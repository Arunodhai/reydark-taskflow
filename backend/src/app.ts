import express from "express";

import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { authRoutes } from "./routes/authRoutes.js";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.get("/health", (_request, response) => {
    response.status(200).json({ message: "OK" });
  });
  app.use("/api/auth", authRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
