import { LOGIN, LOGOUT, SET_USER } from "../actions/types";

const initialState = {
  user: null,
  accessToken: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        accessToken: null,
      };
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;
