const initialState = {
  user: null,
  accessToken: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        user: {
          ...action.payload.user,
          _id: action.payload.user._id, // Đảm bảo _id được lưu
        },
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
        user: {
          ...action.payload,
          _id: action.payload._id, // Đảm bảo _id được lưu
        },
      };
    default:
      return state;
  }
};

export default userReducer;
