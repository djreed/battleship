
const initialState = {
  socket: null,
  channel: null,
  table: null,
  users: [],
  messages: [],
};

function arrContains(arr, user) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === user.id) {
      return true;
    }
  }
  return false;
}

function processDiff(currentUsers, joins, leaves) {
  let users = [];

  currentUsers.forEach(user => {
    if (!arrContains(leaves, user)) {
      users.push(user);
    }
  });

  return users.concat(joins);
}

function stripMeta(messages, payload) {
  let newMessages = [];
  for (var i = 0; i < messages.length; i++) {
    let m = messages[i];
    if (messages[i].meta && messages[i].meta.params
      && (messages[i].meta.params === payload)) {
      m = { username: m.username, text: m.text };
    }
    newMessages.push(m);
  }
  return newMessages;
}

export default function(state = initialState, action) {
  switch (action.type) {
    case 'SOCKET_CONNECT':
      return Object.assign({}, state, { socket: action.socket });
    case 'CHANNEL_CONNECT':
      return Object.assign({}, state, {channel: action.channel});
    case 'TABLE_JOIN':
      return Object.assign({}, state, {channel: action.channel, table: action.table});
    case 'PRESENCE_STATE':
      return Object.assign({}, state, {users: action.users});
    case 'PRESENCE_DIFF':
      return Object.assign({},
        state, {users: processDiff(state.users, action.joins, action.leaves)});
    case 'NEW_MSG':
      return Object.assign({},
        state, {messages: [action.message].concat(state.messages)});
    case 'ACCEPTED_CHALLENGE':
      return Object.assign({},
        state, {messages: stripMeta(state.messages, action.payload)});
    default:
      return state;
  }
}

