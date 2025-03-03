import { LOGIN, LOGOUT, SET_USER } from "./types";

// Action login thành công
export const loginUser = (user, accessToken) => {
  return {
    type: LOGIN,
    payload: { user, accessToken },
  };
};

// Action logout
export const logoutUser = () => {
  return {
    type: LOGOUT,
  };
};

// Action set user
export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};
