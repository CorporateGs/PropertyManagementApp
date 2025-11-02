import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError
} from "@/lib/errors";

// =============================================================================
// TYPES
// =============================================================================

export type UserRole = "ADMIN" | "STAFF" | "OWNER" | "TENANT";

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================

/**
 * Verifies that a user is authenticated and returns the user object
 * @param request The Next.js request object
 * @returns Promise<AuthenticatedUser> The authenticated user
 * @throws AuthenticationError if user is not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new AuthenticationError("Authentication required");
  }

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
    throw new AuthenticationError("User not found");
  }

  if (!user.isActive) {
    throw new AuthenticationError("User account is deactivated");
  }

  return user as AuthenticatedUser;
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
      throw new AuthorizationError(
        `Access denied. Required roles: ${roles.join(", ")}`
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
            userId: userId,
          },
        });
        return !!tenant;

      case "unit":
        // Check if user owns the building containing the unit
        const unit = await prisma.units.findFirst({
          where: {
            id: resourceId,
            building: {
              ownerId: userId,
            },
          },
        });
        return !!unit;

      case "building":
        // Check if user owns the building
        const building = await prisma.building.findFirst({
          where: {
            id: resourceId,
            ownerId: userId,
          },
        });
        return !!building;

      case "payment":
        // Users can access their own payment records
        const payment = await prisma.payment.findFirst({
          where: {
            id: resourceId,
            tenant: {
              userId: userId,
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
              userId: userId,
            },
          },
        });
        return !!maintenance;

      default:
        return false;
    }
  } catch (error) {
    console.error("Error checking ownership:", error);
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
    throw error;
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
        throw new AuthorizationError("Access denied to this tenant data");
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
              ownerId: user.id,
            },
          },
        },
      });

      if (!tenant) {
        throw new AuthorizationError("Access denied to this tenant data");
      }
      return user;
    }

    throw new AuthorizationError("Access denied");
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
          userId: user.id,
          unitId: unitId,
        },
      });

      if (!tenant) {
        throw new AuthorizationError("Access denied to this unit data");
      }
      return user;
    }

    // Owners can access units in their buildings
    if (user.role === "OWNER") {
      const unit = await prisma.units.findFirst({
        where: {
          id: unitId,
          building: {
            ownerId: user.id,
          },
        },
      });

      if (!unit) {
        throw new AuthorizationError("Access denied to this unit data");
      }
      return user;
    }

    throw new AuthorizationError("Access denied");
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
          ownerId: user.id,
        },
      });

      if (!building) {
        throw new AuthorizationError("Access denied to this building data");
      }
      return user;
    }

    // Tenants can access buildings they rent in
    if (user.role === "TENANT") {
      const tenant = await prisma.tenant.findFirst({
        where: {
          userId: user.id,
          unit: {
            buildingId: buildingId,
          },
        },
      });

      if (!tenant) {
        throw new AuthorizationError("Access denied to this building data");
      }
      return user;
    }

    throw new AuthorizationError("Access denied");
  };
}

// =============================================================================
// ROLE HELPERS
// =============================================================================

export const hasRole = (user: AuthenticatedUser, role: UserRole): boolean => {
  return user.role === role;
};

export const hasAnyRole = (
  user: AuthenticatedUser,
  roles: UserRole[]
): boolean => {
  return roles.includes(user.role);
};

export const isAdmin = (user: AuthenticatedUser): boolean => {
  return user.role === "ADMIN";
};

export const isStaff = (user: AuthenticatedUser): boolean => {
  return user.role === "STAFF";
};

export const isOwner = (user: AuthenticatedUser): boolean => {
  return user.role === "OWNER";
};

export const isTenant = (user: AuthenticatedUser): boolean => {
  return user.role === "TENANT";
};

export const canManageAllProperties = (user: AuthenticatedUser): boolean => {
  return user.role === "ADMIN" || user.role === "STAFF";
};

export const canManageOwnProperties = (user: AuthenticatedUser): boolean => {
  return user.role === "OWNER";
};