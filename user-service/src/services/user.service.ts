import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { USER_CREATED_EVENT } from "../events/events.js";
import type { RegisterUserInput } from "../validators/user.validator.js";

const SALT_ROUNDS = 12;

export const registerUser = async (input: RegisterUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.outboxEvent.create({
      data: {
        eventType: USER_CREATED_EVENT,
        payload: {
          userId: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
        },
      },
    });

    return createdUser;
  });

  return user;
};
