import type { NextFunction, Request, Response } from "express";

import { registerSchema } from "../utils/registerSchema.js";

export const validateRegisterRequest = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const parsed = registerSchema.safeParse(request.body);

  if (!parsed.success) {
    const primaryIssue = parsed.error.issues[0];

    response.status(400).json({
      message: primaryIssue?.message ?? "Invalid registration data",
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  request.body = parsed.data;
  next();
};
