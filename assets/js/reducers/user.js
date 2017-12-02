const initialState = {
  user: null,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case 'SET_USER':
      return Object.assign({}, state, { user: action.user });
    default:
      return state;
  }
}
