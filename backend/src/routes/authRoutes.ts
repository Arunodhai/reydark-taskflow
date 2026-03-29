import { Router } from "express";

import { registerUser } from "../controllers/authController.js";
import { validateRegisterRequest } from "../middleware/validateRegisterRequest.js";

export const authRoutes = Router();

authRoutes.post("/register", validateRegisterRequest, registerUser);
