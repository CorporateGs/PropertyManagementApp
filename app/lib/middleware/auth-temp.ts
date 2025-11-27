// Temporary bypass for testing
export async function requireAuth(request: any): Promise<any> {
  // Return a mock admin user for testing
  return {
    id: "cmhw392cs0000h4q4hwl518vi",
    email: "admin@propertymanagement.com",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
    isActive: true
  };
}

export async function getAuthenticatedUser(request: any): Promise<any | null> {
  try {
    return await requireAuth(request);
  } catch (error) {
    return null;
  }
}
