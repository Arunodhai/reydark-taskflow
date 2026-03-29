import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../utils/httpError.js";

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({
      message: "Invalid JSON payload",
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  response.status(500).json({
    message: "Internal server error",
  });
};
