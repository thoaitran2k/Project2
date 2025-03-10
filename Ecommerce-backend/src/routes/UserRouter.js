const express = require("express");

const multer = require("multer");
const userController = require("../controllers/UserController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const jwt = require("jsonwebtoken");

router.post("/check-token", (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.json({ expired: true });
  }

  try {
    const decoded = jwt.decode(token);
    const expired =
      !decoded || !decoded.exp || decoded.exp < Math.floor(Date.now() / 1000);
    res.json({ expired });
  } catch (error) {
    res.json({ expired: true });
  }
});
const {
  authMiddleware,
  authUserMiddleware,
} = require("../middleware/authMiddleware");

router.post("/sign-up", userController.createUser);
router.post("/sign-in", userController.loginUser);
router.put("/update-user/:id", userController.updateUser);
router.delete("/delete-user/:id", authMiddleware, userController.deleteUser);
router.get("/getAll", authMiddleware, userController.getAllUser);
router.post("/change-password/", authMiddleware, userController.changePassword);
router.get(
  "/get-details/:id",
  authUserMiddleware,
  userController.getDetailsUser
);
router.post("/refresh-token", userController.refreshToken);
router.post("/send-register-code", userController.sendRegisterVerificationCode);
router.post(
  "/send-forgot-password-code",
  userController.sendForgotPasswordCode
);
router.post("/forgot-password", userController.forgotPassword);

router.post(
  "/upload-avatar",
  upload.single("avatar"),
  (req, res, next) => {
    console.log("Multer đã xử lý file:", req.file); // 🔍 Kiểm tra multer
    next();
  },
  userController.uploadAvatar
);

//Address
router.post("/:userId/add-addresses", userController.addAddress); // Thêm địa chỉ mới
router.put(
  "/:userId/addresses/:addressId/set-default",
  userController.setDefaultAddress
); // Cập nhật địa chỉ mặc định
router.get("/:userId/addresses", userController.getAddresses); // Lấy danh sách địa chỉ
router.delete(
  "/:userId/delete-address/:addressId",
  userController.deleteAddress
);

router.put(
  "/:userId/address/:addressId/update-address",
  userController.updateAddress
);

router.get("/:userId/address-info/:addressId", userController.getInfoAddress);

module.exports = router;
