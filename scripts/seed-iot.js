const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding IoT Data...');

    // 1. Get Admin User or Create System User
    let user = await prisma.user.findUnique({
        where: { email: 'limaconnect187@gmail.com' }
    });

    if (!user) {
        console.log('Admin user not found, creating system user...');
        user = await prisma.user.create({
            data: {
                email: 'system@iot.com',
                password: 'system_password',
                name: 'System Admin',
                role: 'ADMIN'
            }
        });
    }

    // 2. Get or Create Demo Building
    let building = await prisma.building.findFirst({
        where: { name: 'Tech Plaza One' }
    });

    if (!building) {
        building = await prisma.building.create({
            data: {
                name: 'Tech Plaza One',
                address: '123 Innovation Dr',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105',
                country: 'USA',
                totalUnits: 50,
                createdBy: user.id
            }
        });
        console.log('Created demo building: Tech Plaza One');
    }

    // 2. Create HVAC System
    const hvac = await prisma.buildingSystem.create({
        data: {
            buildingId: building.id,
            systemType: 'HVAC',
            name: 'Main HVAC System',
            manufacturer: 'Carrier',
            status: 'ONLINE',
            devices: {
                create: [
                    {
                        deviceType: 'THERMOSTAT',
                        name: 'Lobby Thermostat',
                        location: 'Lobby',
                        deviceId: 'TH-LOBBY-01',
                        status: 'ONLINE',
                        currentState: JSON.stringify({ temp: 72, mode: 'cool', fan: 'auto' }),
                        isOnline: true
                    },
                    {
                        deviceType: 'THERMOSTAT',
                        name: 'Gym Thermostat',
                        location: 'Gym',
                        deviceId: 'TH-GYM-01',
                        status: 'ONLINE',
                        currentState: JSON.stringify({ temp: 68, mode: 'cool', fan: 'on' }),
                        isOnline: true
                    }
                ]
            }
        }
    });
    console.log('Created HVAC System');

    // 3. Create Security System
    const security = await prisma.buildingSystem.create({
        data: {
            buildingId: building.id,
            systemType: 'SECURITY',
            name: 'Perimeter Security',
            manufacturer: 'Hikvision',
            status: 'ONLINE',
            devices: {
                create: [
                    {
                        deviceType: 'CAMERA',
                        name: 'Main Entrance Cam',
                        location: 'Entrance',
                        deviceId: 'CAM-ENT-01',
                        status: 'ONLINE',
                        isOnline: true,
                        currentState: JSON.stringify({ recording: true, motion: false })
                    },
                    {
                        deviceType: 'DOOR_LOCK',
                        name: 'Front Door',
                        location: 'Entrance',
                        deviceId: 'LOCK-FRONT-01',
                        status: 'ONLINE',
                        isOnline: true,
                        currentState: JSON.stringify({ locked: true })
                    }
                ]
            }
        }
    });
    console.log('Created Security System');

    // 4. Create Energy System
    const energy = await prisma.buildingSystem.create({
        data: {
            buildingId: building.id,
            systemType: 'ENERGY',
            name: 'Smart Meter Array',
            manufacturer: 'Schneider',
            status: 'ONLINE',
            devices: {
                create: [
                    {
                        deviceType: 'SENSOR',
                        name: 'Main Power Meter',
                        location: 'Basement',
                        deviceId: 'PWR-MAIN-01',
                        status: 'ONLINE',
                        isOnline: true,
                        currentState: JSON.stringify({ power: 45.2, voltage: 240 })
                    }
                ]
            }
        }
    });
    console.log('Created Energy System');

    console.log('IoT Seeding Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
