import request from "supertest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import { clearUsers, getUserByEmailForTests } from "../src/utils/userStore.js";

describe("POST /api/auth/register", () => {
  const app = createApp();
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "taskflow-users-"));
    process.env.USER_DATA_FILE = path.join(tempDir, "users.json");
    await clearUsers();
  });

  afterEach(async () => {
    delete process.env.USER_DATA_FILE;
    await rm(tempDir, { recursive: true, force: true });
  });

  it("registers a user with a hashed password", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Rey Dark",
      email: "rey@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "User registered successfully",
    });

    const storedUser = await getUserByEmailForTests("rey@example.com");
    expect(storedUser).not.toBeNull();
    expect(storedUser?.passwordHash).not.toBe("password123");
  });

  it("rejects invalid input", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "",
      email: "invalid-email",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Name is required");
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
        expect.objectContaining({ field: "email" }),
        expect.objectContaining({ field: "password" }),
      ]),
    );
  });

  it("rejects duplicate emails", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Rey Dark",
      email: "rey@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Rey Dark Again",
      email: "REY@example.com",
      password: "password123",
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: "Email is already registered",
    });
  });

  it("rejects passwords shorter than 8 characters", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Rey Dark",
      email: "rey@example.com",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Password must be at least 8 characters");
  });
});
