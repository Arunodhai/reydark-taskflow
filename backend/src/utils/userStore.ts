import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { RegisterRequestBody } from "./registerSchema.js";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type RegisterUserInput = RegisterRequestBody;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultStorePath = path.resolve(__dirname, "../../data/users.json");

const getStorePath = () => {
  return process.env.USER_DATA_FILE ?? defaultStorePath;
};

const ensureStoreFile = async () => {
  const storePath = getStorePath();
  await mkdir(path.dirname(storePath), { recursive: true });

  try {
    await readFile(storePath, "utf8");
  } catch (error) {
    const fsError = error as NodeJS.ErrnoException;

    if (fsError.code === "ENOENT") {
      await writeFile(storePath, "[]\n", "utf8");
      return storePath;
    }

    throw error;
  }

  return storePath;
};

const readUsers = async () => {
  const storePath = await ensureStoreFile();
  const rawUsers = await readFile(storePath, "utf8");

  return JSON.parse(rawUsers) as StoredUser[];
};

const writeUsers = async (users: StoredUser[]) => {
  const storePath = await ensureStoreFile();
  await writeFile(storePath, `${JSON.stringify(users, null, 2)}\n`, "utf8");
};

export const findUserByEmail = async (email: string) => {
  const users = await readUsers();

  return users.find((user) => user.email === email) ?? null;
};

export const createUser = async ({
  name,
  email,
  passwordHash,
}: {
  name: string;
  email: string;
  passwordHash: string;
}) => {
  const users = await readUsers();
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);

  return user;
};

export const clearUsers = async () => {
  await writeUsers([]);
};

export const getUserByEmailForTests = async (email: string) => {
  return findUserByEmail(email);
};
