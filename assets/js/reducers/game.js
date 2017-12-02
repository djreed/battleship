const initialState = {
  game_id: null,
  game: null,
  player: null,
  opponent: null,
  status: null,
  ships_to_place: [],
  game_channel: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case 'JOIN_GAME_CHANNEL':
      return Object.assign({}, state, {
        game: action.resp,
        player: action.resp.player,
        opponent: action.resp.opponent,
        status: action.resp.status,
        ships_to_place: action.resp.player.ships_to_place,
        game_channel: action.channel,
        game_id: action.resp.game_id,
      });
    case 'SET_GAME_STATE':
      return Object.assign({}, state, {
        game: action.resp,
        player: action.resp.player,
        opponent: action.resp.opponent,
        status: action.resp.status,
        ships_to_place: action.resp.player.ships_to_place,
      });
    case 'SET_GAME_STATUS':
      return Object.assign({}, state, { status: action.status});
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }

}