// const initialState = {
//   user: null,
//   accessToken: null,
//   address: [],
//   isAdmin: false,
// };

// const userReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case LOGIN:
//       return {
//         ...state,
//         user: {
//           ...action.payload.user,
//           _id: action.payload.user._id,
//           isAdmin: action.payload.isAdmin, // Đảm bảo _id được lưu
//         },
//         accessToken: action.payload.accessToken,
//       };
//     case LOGOUT:
//       return {
//         ...state,
//         user: null,
//         accessToken: null,
//       };
//     case SET_USER:
//       return {
//         ...state,
//         user: {
//           ...action.payload,
//           _id: action.payload._id, // Đảm bảo _id được lưu
//         },
//       };
//     case "REMOVE_USER_ADDRESS":
//       return {
//         ...state,
//         addresses: state.addresses.filter(
//           (address) => address._id !== action.payload
//         ),
//       };
//     case "UPDATE_ADDRESSES":
//       return {
//         ...state,
//         addresses: action.payload,
//       };
//     default:
//       return state;
//   }
// };

// // const addressReducer = (state = initialState, action) => {
// //   switch (action.type) {
// //     case "UPDATE_ADDRESSES":
// //       return { ...state, addresses: action.payload };
// //     default:
// //       return state;
// //   }
// // };

// export default userReducer;
