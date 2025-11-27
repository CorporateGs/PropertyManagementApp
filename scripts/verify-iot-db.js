const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Verifying IoT Data Updates...');

    // 1. Get initial state of a thermostat
    const device = await prisma.device.findFirst({
        where: { deviceType: 'THERMOSTAT' }
    });

    if (!device) {
        console.error('No thermostat found!');
        process.exit(1);
    }

    console.log(`Initial State: ${device.currentState} (Last Ping: ${device.lastPing})`);

    // 2. Wait for simulation to run (user should run simulation in parallel)
    console.log('Waiting 5 seconds for simulation updates...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Get updated state
    const updatedDevice = await prisma.device.findUnique({
        where: { id: device.id }
    });

    console.log(`Updated State: ${updatedDevice.currentState} (Last Ping: ${updatedDevice.lastPing})`);

    if (updatedDevice.lastPing > device.lastPing || updatedDevice.currentState !== device.currentState) {
        console.log('SUCCESS: Device data is updating!');
    } else {
        console.log('WARNING: No changes detected. Is the simulation running?');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
