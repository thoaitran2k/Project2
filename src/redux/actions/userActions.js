import {
  LOGIN,
  LOGOUT,
  SET_USER,
  REMOVE_USER_ADDRESS,
  UPDATE_ADDRESSES,
} from "./Types";

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

export const removeUserAddress = (addressId) => ({
  type: REMOVE_USER_ADDRESS,
  payload: addressId,
});

export const updateAddresses = (addresses) => ({
  type: UPDATE_ADDRESSES,
  payload: addresses,
});
