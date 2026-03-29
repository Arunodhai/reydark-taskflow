import { type ChangeEvent, type FormEvent, useState } from "react";
import { registerUser, type RegisterPayload } from "../api/auth";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

type Status = "idle" | "loading" | "success" | "error";

// Simple email regex — matches backend's Zod .email() expectation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields: RegisterPayload): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name.trim()) {
    errors.name = "Name is required";
  }

  if (!fields.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(fields.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!fields.password) {
    errors.password = "Password is required";
  } else if (fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

export default function RegisterForm() {
  const [fields, setFields] = useState<RegisterPayload>({
    name: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [apiError, setApiError] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear inline error for the field being edited
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setStatus("loading");
    setApiError("");

    try {
      await registerUser(fields);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setApiError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="card">
        <h1 className="card-title">TaskFlow</h1>
        <div className="success-banner">
          <p className="success-heading">Account created!</p>
          <p className="success-sub">You can now log in to TaskFlow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="card-title">TaskFlow</h1>
      <p className="form-subtitle">Create an account</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={fields.name}
            onChange={handleChange}
            disabled={status === "loading"}
            aria-invalid={fieldErrors.name !== undefined}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className={fieldErrors.name ? "input-error" : ""}
          />
          {fieldErrors.name ? (
            <span id="name-error" className="field-error" role="alert">
              {fieldErrors.name}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={handleChange}
            disabled={status === "loading"}
            aria-invalid={fieldErrors.email !== undefined}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={fieldErrors.email ? "input-error" : ""}
          />
          {fieldErrors.email ? (
            <span id="email-error" className="field-error" role="alert">
              {fieldErrors.email}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={fields.password}
            onChange={handleChange}
            disabled={status === "loading"}
            aria-invalid={fieldErrors.password !== undefined}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            className={fieldErrors.password ? "input-error" : ""}
          />
          {fieldErrors.password ? (
            <span id="password-error" className="field-error" role="alert">
              {fieldErrors.password}
            </span>
          ) : null}
        </div>

        {status === "error" && apiError ? (
          <div className="api-error" role="alert">
            {apiError}
          </div>
        ) : null}

        <button type="submit" disabled={status === "loading"} className="submit-btn">
          {status === "loading" ? "Creating account…" : "Register"}
        </button>
      </form>
    </div>
  );
}
