import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError
} from "@/lib/errors";

// ============================================
// TYPES
// ============================================

export type UserRole = "ADMIN" | "STAFF" | "OWNER" | "TENANT";

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Verifies that a user is authenticated and returns the user object
 * @param request The Next.js request object
 * @returns Promise<AuthenticatedUser> The authenticated user
 * @throws AuthenticationError if user is not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  try {
    // Get session from NextAuth
    const session = await getServerSession();

    if (!session?.user?.id) {
      console.log("No session found:", { session });
      throw new AuthenticationError("Authentication required");
    }

    console.log("Found session:", { userId: session.user.id });

    // Fetch fresh user data from database to ensure isActive status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      console.log("User not found in database:", { userId: session.user.id });
      throw new AuthenticationError("User not found");
    }

    if (!user.isActive) {
      console.log("User account is deactivated:", { userId: user.id });
      throw new AuthenticationError("User account is deactivated");
    }

    console.log("User authenticated successfully:", { userId: user.id, role: user.role });

    return user as AuthenticatedUser;

  } catch (error) {
    console.error("Authentication error:", error);

    if (error instanceof AuthenticationError) {
      throw error;
    }

    // Log unexpected errors
    console.error("Unexpected authentication error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    throw new AuthenticationError("Authentication failed");
  }
}

/**
 * Verifies that the authenticated user has one of the required roles
 * @param roles Array of allowed roles
 * @returns Middleware function that checks user role
 */
export function requireRole(roles: UserRole[]) {
  return async (request: NextRequest): Promise<AuthenticatedUser> => {
    const user = await requireAuth(request);

    if (!roles.includes(user.role)) {
      console.log(`Authorization failed: User ${user.id} with role ${user.role} attempted to access resource requiring roles: ${roles.join(", ")}`);
      throw new AuthorizationError(
        `Access denied. Required roles: ${roles.join(", ")}. Your role: ${user.role}`
      );
    }

    return user;
  };
}

/**
 * Verifies that the user owns or has access to a specific resource
 * @param resourceType The type of resource (tenant, unit, building, etc.)
 * @param resourceId The ID of the resource
 * @param userId The ID of the user making the request
 * @returns Promise<boolean> Whether the user has access
 */
export async function requireOwnership(
  resourceType: string,
  resourceId: string,
  userId: string
): Promise<boolean> {
  try {
    switch (resourceType) {
      case "tenant":
        // Users can access their own tenant record
        const tenant = await prisma.tenant.findFirst({
          where: {
            id: resourceId,
            createdBy: userId,
          },
        });
        return !!tenant;

      case "unit":
        // Check if user owns the building containing the unit
        const unit = await prisma.unit.findFirst({
          where: {
            id: resourceId,
            building: {
              createdBy: userId,
            },
          },
        });
        return !!unit;

      case "building":
        // Check if user owns the building
        const building = await prisma.building.findFirst({
          where: {
            id: resourceId,
            createdBy: userId,
          },
        });
        return !!building;

      case "payment":
        // Users can access their own payment records
        const payment = await prisma.payment.findFirst({
          where: {
            id: resourceId,
            tenant: {
              createdBy: userId,
            },
          },
        });
        return !!payment;

      case "maintenance":
        // Users can access their own maintenance requests
        const maintenance = await prisma.maintenanceRequest.findFirst({
          where: {
            id: resourceId,
            tenant: {
              createdBy: userId,
            },
          },
        });
        return !!maintenance;

      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking ownership for ${resourceType}:`, error);
    return false;
  }
}

/**
 * Extracts and validates the authenticated user from the request
 * @param request The Next.js request object
 * @returns Promise<AuthenticatedUser | null> The authenticated user or null if not authenticated
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    return await requireAuth(request);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return null;
    }
    console.error("Error getting authenticated user:", error);
    return null;
  }
}

/**
 * Middleware factory for checking if user can access tenant data
 * @param tenantId The tenant ID to check access for
 * @returns Middleware function that verifies tenant access
 */
export function requireTenantAccess(tenantId: string) {
  return async (request: NextRequest): Promise<AuthenticatedUser> => {
    const user = await requireAuth(request);

    // Admin and Staff can access all tenant data
    if (user.role === "ADMIN" || user.role === "STAFF") {
      return user;
    }

    // Tenants can only access their own data
    if (user.role === "TENANT") {
      const hasAccess = await requireOwnership("tenant", tenantId, user.id);
      if (!hasAccess) {
        console.log(`User ${user.id} denied access to tenant ${tenantId}`);
        throw new AuthorizationError("Access denied to this tenant data. You can only access your own tenant record.");
      }
      return user;
    }

    // Owners can access tenant data for their properties
    if (user.role === "OWNER") {
      const tenant = await prisma.tenant.findFirst({
        where: {
          id: tenantId,
          unit: {
            building: {
              createdBy: user.id,
            },
          },
        },
      });

      if (!tenant) {
        console.log(`User ${user.id} denied access to tenant ${tenantId}`);
        throw new AuthorizationError("Access denied to this tenant data. You can only access tenants in your buildings.");
      }
      return user;
    }

    console.log(`User ${user.id} with role ${user.role} denied access to tenant ${tenantId}`);
    throw new AuthorizationError("Access denied. Insufficient permissions to access tenant data.");
  };
}

/**
 * Middleware factory for checking if user can access unit data
 * @param unitId The unit ID to check access for
 * @returns Middleware function that verifies unit access
 */
export function requireUnitAccess(unitId: string) {
  return async (request: NextRequest): Promise<AuthenticatedUser> => {
    const user = await requireAuth(request);

    // Admin and Staff can access all unit data
    if (user.role === "ADMIN" || user.role === "STAFF") {
      return user;
    }

    // Tenants can only access their own unit data
    if (user.role === "TENANT") {
      const tenant = await prisma.tenant.findFirst({
        where: {
          createdBy: user.id,
          unitId: unitId,
        },
      });

      if (!tenant) {
        console.log(`User ${user.id} denied access to unit ${unitId}`);
        throw new AuthorizationError("Access denied to this unit data. You can only access your own unit.");
      }
      return user;
    }

    // Owners can access units in their buildings
    if (user.role === "OWNER") {
      const unit = await prisma.unit.findFirst({
        where: {
          id: unitId,
          building: {
            createdBy: user.id,
          },
        },
      });

      if (!unit) {
        console.log(`User ${user.id} denied access to unit ${unitId}`);
        throw new AuthorizationError("Access denied to this unit data. You can only access units in your buildings.");
      }
      return user;
    }

    console.log(`User ${user.id} with role ${user.role} denied access to unit ${unitId}`);
    throw new AuthorizationError("Access denied. Insufficient permissions to access unit data.");
  };
}

/**
 * Middleware factory for checking if user can access building data
 * @param buildingId The building ID to check access for
 * @returns Middleware function that verifies building access
 */
export function requireBuildingAccess(buildingId: string) {
  return async (request: NextRequest): Promise<AuthenticatedUser> => {
    const user = await requireAuth(request);

    // Admin and Staff can access all building data
    if (user.role === "ADMIN" || user.role === "STAFF") {
      return user;
    }

    // Owners can only access their own buildings
    if (user.role === "OWNER") {
      const building = await prisma.building.findFirst({
        where: {
          id: buildingId,
          createdBy: user.id,
        },
      });

      if (!building) {
        console.log(`User ${user.id} denied access to building ${buildingId}`);
        throw new AuthorizationError("Access denied to this building data. You can only access your own buildings.");
      }
      return user;
    }

    // Tenants cannot access building data directly
    console.log(`User ${user.id} with role ${user.role} denied access to building ${buildingId}`);
    throw new AuthorizationError("Access denied. Insufficient permissions to access building data.");
  };
}

// Export NextAuth configuration
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
              password: true,
            },
          });

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          if (!user.isActive) {
            console.log("User account is deactivated:", user.email);
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }

          console.log("User authenticated successfully:", user.email);

          // Return user without password - match NextAuth User interface
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = `${user.firstName} ${user.lastName}`;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/en/auth/signin",
    error: "/en/auth/error",
  },
};
