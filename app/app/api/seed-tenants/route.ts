import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get or create admin user
    let adminUser = await prisma.user.findFirst({
      where: { email: "admin@propertymanagement.com" }
    });

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: "admin@propertymanagement.com",
          firstName: "System",
          lastName: "Administrator",
          role: "ADMIN",
          isActive: true,
          password: "$2a$10$Bjg08tmc1MLXkk5z199TwoegT8Lmk5leI5if7C2BKOP1sIT1ed.LBq", // This is "admin123" hashed
        },
      });
    }

    // Get or create a building
    let building = await prisma.building.findFirst({
      where: { name: "Sunset Apartments" }
    });

    if (!building) {
      building = await prisma.building.create({
        data: {
          name: "Sunset Apartments",
          address: "123 Sunset Boulevard",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90210",
          country: "USA",
          totalUnits: 20,
          yearBuilt: 2018,
          description: "Modern apartment complex with pool and gym",
          createdBy: adminUser.id,
        },
      });
    }

    // Get or create units
    const unitsData = [
      { unitNumber: "101", bedrooms: 2, bathrooms: 2, squareFeet: 1200, rentAmount: 2800 },
      { unitNumber: "102", bedrooms: 1, bathrooms: 1, squareFeet: 800, rentAmount: 1800 },
      { unitNumber: "103", bedrooms: 2, bathrooms: 2, squareFeet: 1100, rentAmount: 2200 },
      { unitNumber: "104", bedrooms: 3, bathrooms: 2, squareFeet: 1400, rentAmount: 3500 },
      { unitNumber: "105", bedrooms: 1, bathrooms: 1, squareFeet: 750, rentAmount: 1600 },
    ];

    for (const unitData of unitsData) {
      let unit = await prisma.unit.findFirst({
        where: { buildingId: building.id, unitNumber: unitData.unitNumber }
      });

      if (!unit) {
        unit = await prisma.unit.create({
          data: {
            buildingId: building.id,
            unitNumber: unitData.unitNumber,
            type: `${unitData.bedrooms}BED`,
            bedrooms: unitData.bedrooms,
            bathrooms: unitData.bathrooms,
            squareFeet: unitData.squareFeet,
            rentAmount: unitData.rentAmount,
            status: "VACANT",
            description: `Spacious ${unitData.bedrooms}-bedroom unit`,
            createdBy: adminUser.id,
          },
        });
      }
    }

    // Create sample tenants
    const tenantsData = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1-555-123-4567",
        status: "ACTIVE",
        leaseStart: new Date("2024-01-01"),
        leaseEnd: new Date("2024-12-31"),
        rentAmount: 2800,
        securityDeposit: 500,
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phone: "+1-555-987-6543",
        status: "ACTIVE",
        leaseStart: new Date("2024-02-01"),
        leaseEnd: new Date("2025-01-31"),
        rentAmount: 1800,
        securityDeposit: 400,
      },
      {
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike.johnson@example.com",
        phone: "+1-555-555-1234",
        status: "ACTIVE",
        leaseStart: new Date("2023-12-01"),
        leaseEnd: new Date("2024-12-31"),
        rentAmount: 2200,
        securityDeposit: 600,
      },
      {
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah.williams@example.com",
        phone: "+1-555-555-5678",
        status: "ACTIVE",
        leaseStart: new Date("2024-03-15"),
        leaseEnd: new Date("2025-03-14"),
        rentAmount: 3500,
        securityDeposit: 700,
      },
      {
        firstName: "Robert",
        lastName: "Brown",
        email: "robert.brown@example.com",
        phone: "+1-555-555-9999",
        status: "ACTIVE",
        leaseStart: new Date("2024-01-15"),
        leaseEnd: new Date("2025-01-15"),
        rentAmount: 2500,
        securityDeposit: 500,
      },
    ];

    for (const tenantData of tenantsData) {
      // Get a vacant unit for this tenant
      const unit = await prisma.unit.findFirst({
        where: { 
          buildingId: building.id,
          status: "VACANT"
        }
      });

      if (unit) {
        const tenant = await prisma.tenant.create({
          data: {
            unitId: unit.id,
            firstName: tenantData.firstName,
            lastName: tenantData.lastName,
            email: tenantData.email,
            phone: tenantData.phone,
            status: tenantData.status,
            leaseStart: tenantData.leaseStart,
            leaseEnd: tenantData.leaseEnd,
            rentAmount: tenantData.rentAmount,
            securityDeposit: tenantData.securityDeposit,
            createdBy: adminUser.id,
          },
        });

        // Update unit status to occupied
        await prisma.unit.update({
          where: { id: unit.id },
          data: { status: "OCCUPIED" }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Sample tenants created successfully",
      data: {
        tenantsCreated: tenantsData.length,
        unitsCreated: unitsData.length
      }
    });
  } catch (error) {
    console.error("Error seeding tenants:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed tenants" },
      { status: 500 }
    );
  }
}