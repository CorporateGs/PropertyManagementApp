import { NextRequest } from "next/server";
import { validateBody } from "@/lib/middleware/validation";
import { signupSchema } from "@/lib/validation/schemas";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { EmailService } from '@/lib/services/communication/communication-service';

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

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user (active for testing - email verification disabled)
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role || "TENANT",
        isActive: true, // Set to true for testing
        emailVerified: true, // Set to true for testing
      },
    });

    // Send verification email
    const emailService = new EmailService();
    await emailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Property Management System',
      body: `Welcome ${user.firstName}! Please verify your email by clicking this link: ${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`,
      html: `<p>Welcome ${user.firstName}!</p><p>Please verify your email by clicking this link: <a href="${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}">Verify Email</a></p>`,
    });

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
      requiresVerification: false, // Disabled for testing
      message: "Registration successful. You can now sign in.",
    }, "User registered successfully");
  } catch (error) {
    logger.error("Failed to register user", { error });
    return serverError(error);
  }
}
