import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

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
      // In production, this would be properly hashed
      password: "admin123", // TODO: Hash with bcrypt
    },
  });

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
      password: "staff123", // TODO: Hash with bcrypt
    },
  });

  // Create owner user
  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@propertymanagement.com" },
    update: {},
    create: {
      email: "owner@propertymanagement.com",
      firstName: "Property",
      lastName: "Owner",
      role: "OWNER",
      isActive: true,
      password: "owner123", // TODO: Hash with bcrypt
    },
  });

  // Create sample buildings
  const buildings = await Promise.all([
    prisma.building.upsert({
      where: { id: "building_1" },
      update: {},
      create: {
        id: "building_1",
        name: "Sunset Apartments",
        address: "123 Sunset Boulevard",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        country: "USA",
        totalUnits: 20,
        yearBuilt: 2018,
        description: "Modern apartment complex with pool and gym",
        amenities: ["Pool", "Gym", "Parking", "Laundry"],
        ownerId: ownerUser.id,
      },
    }),
    prisma.building.upsert({
      where: { id: "building_2" },
      update: {},
      create: {
        id: "building_2",
        name: "Riverside Complex",
        address: "456 River Street",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90211",
        country: "USA",
        totalUnits: 15,
        yearBuilt: 2015,
        description: "Riverside apartments with scenic views",
        amenities: ["Parking", "Laundry", "Storage"],
        ownerId: ownerUser.id,
      },
    }),
  ]);

  // Create sample units
  const units = await Promise.all([
    // Building 1 units
    prisma.units.upsert({
      where: { id: "unit_1" },
      update: {},
      create: {
        id: "unit_1",
        buildingId: "building_1",
        unitNumber: "101",
        type: "2BED",
        bedrooms: 2,
        bathrooms: 2,
        squareFootage: 1200,
        rentAmount: 2800,
        securityDeposit: 2800,
        status: "OCCUPIED",
        floor: 1,
        description: "Spacious 2-bedroom unit with city views",
        amenities: ["Balcony", "Dishwasher", "Hardwood Floors"],
        isFurnished: false,
        hasParking: true,
        hasLaundry: true,
        hasPetsAllowed: true,
      },
    }),
    prisma.units.upsert({
      where: { id: "unit_2" },
      update: {},
      create: {
        id: "unit_2",
        buildingId: "building_1",
        unitNumber: "205",
        type: "1BED",
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: 800,
        rentAmount: 2200,
        securityDeposit: 2200,
        status: "VACANT",
        floor: 2,
        description: "Cozy 1-bedroom unit perfect for singles",
        amenities: ["City Views", "Modern Kitchen"],
        isFurnished: false,
        hasParking: true,
        hasLaundry: true,
        hasPetsAllowed: true,
      },
    }),
    // Building 2 units
    prisma.units.upsert({
      where: { id: "unit_3" },
      update: {},
      create: {
        id: "unit_3",
        buildingId: "building_2",
        unitNumber: "301",
        type: "STUDIO",
        bedrooms: 0,
        bathrooms: 1,
        squareFootage: 600,
        rentAmount: 1800,
        securityDeposit: 1800,
        status: "OCCUPIED",
        floor: 3,
        description: "Modern studio apartment",
        amenities: ["High Ceilings", "Large Windows"],
        isFurnished: false,
        hasParking: true,
        hasLaundry: true,
        hasPetsAllowed: false,
      },
    }),
  ]);

  // Create sample tenants
  const tenants = await Promise.all([
    prisma.tenant.upsert({
      where: { id: "tenant_1" },
      update: {},
      create: {
        id: "tenant_1",
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@email.com",
        phone: "+1-555-0123",
        unitId: "unit_1",
        leaseStartDate: new Date("2024-01-01"),
        leaseEndDate: new Date("2025-01-01"),
        monthlyRent: 2800,
        securityDeposit: 2800,
        status: "ACTIVE",
      },
    }),
    prisma.tenant.upsert({
      where: { id: "tenant_2" },
      update: {},
      create: {
        id: "tenant_2",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1-555-0456",
        unitId: "unit_3",
        leaseStartDate: new Date("2024-03-01"),
        leaseEndDate: new Date("2025-03-01"),
        monthlyRent: 1800,
        securityDeposit: 1800,
        status: "ACTIVE",
      },
    }),
  ]);

  // Create sample payments
  const payments = await Promise.all([
    prisma.payment.createMany({
      data: [
        {
          tenantId: "tenant_1",
          unitId: "unit_1",
          amount: 2800,
          paymentType: "RENT",
          dueDate: new Date("2024-12-01"),
          paymentDate: new Date("2024-11-30"),
          status: "PAID",
          method: "BANK_TRANSFER",
          description: "December 2024 rent payment",
        },
        {
          tenantId: "tenant_1",
          unitId: "unit_1",
          amount: 2800,
          paymentType: "RENT",
          dueDate: new Date("2024-11-01"),
          status: "PENDING",
          method: "ONLINE",
          description: "November 2024 rent payment",
        },
        {
          tenantId: "tenant_2",
          unitId: "unit_3",
          amount: 1800,
          paymentType: "RENT",
          dueDate: new Date("2024-12-01"),
          paymentDate: new Date("2024-12-01"),
          status: "PAID",
          method: "CREDIT_CARD",
          description: "December 2024 rent payment",
        },
      ],
    }),
  ]);

  // Create sample maintenance requests
  const maintenanceRequests = await Promise.all([
    prisma.maintenanceRequest.createMany({
      data: [
        {
          unitId: "unit_1",
          tenantId: "tenant_1",
          title: "Leaky Faucet in Kitchen",
          description: "The kitchen faucet has been dripping for the past week. It needs to be fixed as soon as possible.",
          category: "PLUMBING",
          priority: "MEDIUM",
          status: "COMPLETED",
          estimatedCost: 150,
          actualCost: 125,
          scheduledDate: new Date("2024-11-15"),
          completedDate: new Date("2024-11-16"),
        },
        {
          unitId: "unit_2",
          title: "HVAC System Not Working",
          description: "The heating system is not working properly. The unit is getting cold.",
          category: "HVAC",
          priority: "HIGH",
          status: "IN_PROGRESS",
          estimatedCost: 800,
          scheduledDate: new Date("2024-12-01"),
        },
        {
          unitId: "unit_3",
          tenantId: "tenant_2",
          title: "Light Switch Replacement",
          description: "The light switch in the bedroom is faulty and needs replacement.",
          category: "ELECTRICAL",
          priority: "LOW",
          status: "OPEN",
          estimatedCost: 75,
        },
      ],
    }),
  ]);

  // Create sample communications
  const communications = await Promise.all([
    prisma.communication.createMany({
      data: [
        {
          recipientId: "tenant_1",
          recipientType: "TENANT",
          type: "EMAIL",
          subject: "Welcome to Sunset Apartments!",
          message: "Welcome to your new home! We're excited to have you as a tenant.",
          status: "SENT",
          sentBy: adminUser.id,
          sentAt: new Date("2024-01-01"),
        },
        {
          recipientId: "tenant_1",
          recipientType: "TENANT",
          type: "EMAIL",
          subject: "Rent Payment Reminder",
          message: "This is a reminder that your rent payment is due on the 1st of each month.",
          status: "DELIVERED",
          sentBy: staffUser.id,
          sentAt: new Date("2024-11-25"),
        },
      ],
    }),
  ]);

  // Create sample workflows
  const workflows = await Promise.all([
    prisma.workflow.upsert({
      where: { id: "workflow_1" },
      update: {},
      create: {
        id: "workflow_1",
        name: "Late Rent Reminder",
        description: "Automatically send reminders for overdue rent payments",
        trigger: {
          type: "SCHEDULE",
          schedule: "0 9 * * 1", // Every Monday at 9 AM
        },
        conditions: [
          {
            field: "payment.status",
            operator: "equals",
            value: "LATE",
          },
        ],
        actions: [
          {
            type: "SEND_EMAIL",
            config: {
              template: "LATE_RENT_REMINDER",
              recipient: "{{tenant.email}}",
            },
          },
        ],
        isActive: true,
        createdBy: adminUser.id,
      },
    }),
  ]);

  console.log("✅ Database seeded successfully!");
  console.log("📊 Created:");
  console.log(`   • ${buildings.length} buildings`);
  console.log(`   • ${units.length} units`);
  console.log(`   • ${tenants.length} tenants`);
  console.log(`   • ${payments.length} payment records`);
  console.log(`   • ${maintenanceRequests.length} maintenance requests`);
  console.log(`   • ${communications.length} communications`);
  console.log(`   • ${workflows.length} workflows`);
  console.log(`   • 3 users (admin, staff, owner)`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
