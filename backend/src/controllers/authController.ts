import type { NextFunction, Request, Response } from "express";

import { authService } from "../services/authService.js";

export const registerUser = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    await authService.register(request.body);

    response.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};
