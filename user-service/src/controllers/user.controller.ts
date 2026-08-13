import type { Request, Response } from "express";
import { registerUserSchema } from "../validators/user.validator.js";
import { registerUser } from "../services/user.service.js";

export const createUser = async (req: Request, res: Response) => {
  const result = registerUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const user = await registerUser(result.data);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    console.error("Failed to create user:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
