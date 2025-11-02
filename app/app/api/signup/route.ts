import { NextRequest } from "next/server";
import { validateBody } from "@/lib/middleware/validation";
import { signupSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// POST /api/signup - Enhanced user registration
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await validateBody(signupSchema, request) as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role?: "ADMIN" | "STAFF" | "OWNER" | "TENANT";
      phone?: string;
    };

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return badRequest("User with this email already exists");
    }

    // TODO: Hash password using bcrypt
    // const hashedPassword = await bcrypt.hash(body.password, 12);

    // TODO: Generate email verification token
    // const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user (inactive until verified)
    const user = await prisma.user.create({
      data: {
        email: body.email,
        // password: hashedPassword,
        password: body.password, // TODO: Remove when bcrypt is implemented
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role || "TENANT",
        phone: body.phone,
        isActive: false, // Require email verification
        // emailVerificationToken: verificationToken,
        // emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // TODO: Send verification email
    // await EmailService.sendEmailVerification({
    //   to: user.email,
    //   firstName: user.firstName,
    //   verificationToken,
    //   verificationUrl: `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`,
    // });

    logger.info("User registered successfully", {
      userId: user.id,
      email: user.email,
      role: user.role,
      requiresVerification: true,
    });

    return ok({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      requiresVerification: true,
      message: "Registration successful. Please check your email to verify your account.",
    }, "User registered successfully");
  } catch (error) {
    logger.error("Failed to register user", { error });
    return serverError(error);
  }
}
