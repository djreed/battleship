import { Socket } from 'phoenix';
//TODO refactor to move functions to separate files

export function getSocket() {
  return dispatch => {
    const socket = new Socket('/socket', {});
    socket.connect();
    dispatch({ type: 'SOCKET_CONNECT', socket });
  }
}

export function joinChannel(name) {
  return (dispatch) => {
    const socket = new Socket('/socket', {});
    socket.connect();

    const channel = socket.channel('table:' + name, {});

    channel.join()
      .receive('ok', resp => {
        dispatch({ type: 'CHANNEL_CONNECT', channel });
      })
      .receive('error', resp => {
        console.log('error', resp);
        //TODO put error flash
      });
  }
}

export function createAndJoinTable(lobby, params, router) {
  return (dispatch) => {
    lobby.push('create_table', params)
      .receive('ok', resp => {
        joinTable(dispatch, resp.data.id, params.user, router);
      })
      .receive('error', resp => {
        console.log('error: could not create table');
        // TODO put error flash
      });
  }
}

export function joinExisting(params, router) {
  return (dispatch) => {
    joinTable(dispatch, params.joinCode, params.user, router);
  }
}

function joinTable(dispatch, id, user = null, router) {
  const socket = new Socket('/socket', {});
  socket.connect();
  const channel = socket.channel('table:' + id, {user: user});
  channel.join()
    .receive('ok', resp => {
      dispatch({ type: 'TABLE_JOIN', table: resp.data, channel: channel });
      router.history.push('/table');
    })
    .receive('error', resp => {
      console.log('error', resp);
      // TODO put error flash
    });

  setTableActions(dispatch, channel);
}


export function signin(channel, username, router) {
  return (dispatch) => {
    channel.push('create_user', { username })
      .receive('ok', resp => {
        dispatch({ type: 'SET_USER', user: resp.data });
        router.history.push('/home');
      })
      .receive('error', resp => {
        // TODO put flash
        console.log('error', resp);
      });
  }
}

export function resetGame() {
  return (dispatch) => {
    dispatch({ type: 'RESET_GAME'});
  }
}

export function sendMsg(channel, msg) {
  return (dispatch) => {
    channel.push('new_msg', msg)
      .receive('ok', resp => console.log('sent msg', resp))
      .receive('error', resp => console.log('failed to send msg', resp));
  }
}

export function issueChallenge(channel, payload, router, user) {
  return (dispatch) => {
    channel.push('issue_challenge', payload)
      .receive('ok', resp => console.log('challenge sent', resp))
      .receive('error', resp => console.log('challenge failed', resp));

    channel.on('challenge_accepted', msg => {
      if (msg.from_id == user.id) {
        joinGameChannel(dispatch, { id: user.id, params: payload }, user.id);
        router.history.push('/game');
      }
    })
  }
}

export function acceptChallenge(channel, payload, router, user) {
  return (dispatch) => {
    channel.push('accept_challenge', payload)
      .receive('ok', resp => {
        dispatch({ type: 'ACCEPTED_CHALLENGE', payload });
        joinGameChannel(dispatch, { id: user.id, params: payload }, user.id);
        router.history.push('/game');
      })
      .receive('error', resp => console.log('error pushing accept', resp));
  }
}

export function placeShip(channel, payload) {
  return (dispatch) => {
    channel.push('place_ship', payload)
      .receive('ok', resp => console.log('placed', resp))
      .receive('error', resp => console.log('error placing', resp));
  }
}

export function attack(channel, payload) {
  console.log('attack');
  return (dispatch) => {
    console.log('dispatch attack')
    channel.push('attack', payload)
      .receive('ok', resp => console.log('attacked', resp))
      .receive('error', resp => console.log('error placing', resp))
  }
}

function joinGameChannel(dispatch, payload, id) {
  const game_id = payload.params.from_id + ':' + payload.params.to_id;
  payload["game_id"] = game_id;

  const socket = new Socket('/socket', {});
  socket.connect();

  const channel = socket.channel('game:' + id, payload);

  channel.join()
    .receive('ok', resp => {
      setGameActions(dispatch, channel);
      dispatch({ type: 'JOIN_GAME_CHANNEL', resp, channel })
    })
    .receive('error', resp => {
      console.log('error', resp);
      //TODO put error flash
    });
}

// reduce complexity of structure to just a map for each user
function processPresenceStateResp(presenceState) {
  let users = [];
  Object.keys(presenceState).map( id => {
    let metaMap = presenceState[id].metas[0];
    metaMap['id'] = id;
    users.push(metaMap);
  });
  return users;
}

function setGameActions(dispatch, channel) {
  channel.on('new_game_state', msg => {
    console.log('new game state', msg);
    dispatch({ type: 'SET_GAME_STATE', resp: msg });
  });

  channel.on('new_game_status', msg => {
    console.log('new_game_status', msg);
    dispatch({ type: 'SET_GAME_STATUS', status: msg.status});
  });
}

function setTableActions(dispatch, channel) {
  channel.on('presence_diff', msg => {
    dispatch({ type: 'PRESENCE_DIFF', joins: processPresenceStateResp(msg.joins)
      , leaves: processPresenceStateResp(msg.leaves) });

  });
  channel.on('presence_state', msg => {
    dispatch({ type: 'PRESENCE_STATE', users: processPresenceStateResp(msg) })

  });

  channel.on('new_msg', msg => {
    dispatch({ type: 'NEW_MSG', message: msg});
  });

  channel.on('challenge_issued', msg => {
    const challenge_msg = {
      username: '[INFO]',
      text: msg.from_name + ' has challenged ' + msg.to_name + '!',
      meta: {
        type: 'CHALLENGE',
        params: msg,
      }
    };
    dispatch({ type: 'NEW_MSG', message: challenge_msg })
  });
}