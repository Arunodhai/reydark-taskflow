import bcrypt from "bcrypt";

import { HttpError } from "../utils/httpError.js";
import {
  createUser,
  findUserByEmail,
  type RegisterUserInput,
} from "../utils/userStore.js";

const SALT_ROUNDS = 10;

class AuthService {
  async register(input: RegisterUserInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new HttpError(409, "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    await createUser({
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash,
    });
  }
}

export const authService = new AuthService();
