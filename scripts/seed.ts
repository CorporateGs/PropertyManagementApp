import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@propertymanagement.com" },
      update: {},
      create: {
        email: "admin@propertymanagement.com",
        firstName: "System",
        lastName: "Administrator",
        role: "ADMIN",
        isActive: true,
        password: await bcrypt.hash("admin123", 10),
      },
    });

    console.log("✅ Created admin user:", adminUser.email);

    // Create staff user
    const staffUser = await prisma.user.upsert({
      where: { email: "staff@propertymanagement.com" },
      update: {},
      create: {
        email: "staff@propertymanagement.com",
        firstName: "Property",
        lastName: "Manager",
        role: "STAFF",
        isActive: true,
        password: await bcrypt.hash("staff123", 10),
      },
    });

    console.log("✅ Created staff user:", staffUser.email);

    // Create maintenance user
    const maintenanceUser = await prisma.user.upsert({
      where: { email: "maintenance@propertymanagement.com" },
      update: {},
      create: {
        email: "maintenance@propertymanagement.com",
        firstName: "Maintenance",
        lastName: "Staff",
        role: "MAINTENANCE",
        isActive: true,
        password: await bcrypt.hash("maintenance123", 10),
      },
    });

    console.log("✅ Created maintenance user:", maintenanceUser.email);

    // Create sample building
    const building = await prisma.building.upsert({
      where: { id: "sample-building" },
      update: {},
      create: {
        id: "sample-building",
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

    console.log("✅ Created building:", building.name);

    // Create sample unit
    const unit = await prisma.unit.upsert({
      where: { 
        buildingId_unitNumber: {
          buildingId: building.id,
          unitNumber: "101"
        }
      },
      update: {},
      create: {
        buildingId: building.id,
        unitNumber: "101",
        type: "2BED",
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1200,
        rentAmount: 2800,
        status: "VACANT",
        description: "Spacious 2-bedroom unit with city views",
        createdBy: adminUser.id,
      },
    });

    console.log("✅ Created unit:", unit.unitNumber);

    // Create sample calendar event
    const calendarEvent = await prisma.calendarEvent.upsert({
      where: { id: "sample-event" },
      update: {},
      create: {
        id: "sample-event",
        title: "Building Inspection",
        description: "Annual safety inspection for all units",
        eventType: "INSPECTION",
        priority: "HIGH",
        startDate: new Date("2025-12-01T10:00:00Z"),
        endDate: new Date("2025-12-01T17:00:00Z"),
        buildingId: building.id,
        createdBy: adminUser.id,
        status: "SCHEDULED",
      },
    });

    console.log("✅ Created calendar event:", calendarEvent.title);

    // Create sample annual deadline
    const annualDeadline = await prisma.annualDeadline.upsert({
      where: { id: "sample-deadline" },
      update: {},
      create: {
        id: "sample-deadline",
        title: "Annual Tax Filing",
        description: "File property tax returns for the year",
        deadlineType: "TAX_FILING",
        dueDate: new Date("2026-04-15T23:59:59Z"),
        recurringMonth: 4,
        recurringDay: 15,
        advanceNotice: 30,
        priority: "HIGH",
        jurisdiction: "Federal",
        buildingId: building.id,
        createdBy: adminUser.id,
        isActive: true,
        autoCreateEvent: true,
      },
    });

    console.log("✅ Created annual deadline:", annualDeadline.title);

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
