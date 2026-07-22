import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  changePassword,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendEmailVerification,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

// Public routes
router.post("/register", registerValidator, validate, registerUser);
router.post("/login", loginValidator, validate, loginUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/verify-email/:verificationToken", verifyEmail);
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validate,
  forgotPassword,
);
router.post(
  "/reset-password/:resetToken",
  resetPasswordValidator,
  validate,
  resetPassword,
);

// Protected routes
router.use(verifyJWT);
router.post("/logout", logoutUser);
router.get("/current-user", getCurrentUser);
router.post(
  "/change-password",
  changePasswordValidator,
  validate,
  changePassword,
);
router.post("/resend-email-verification", resendEmailVerification);

export default router;
