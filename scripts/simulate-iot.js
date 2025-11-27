const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simulation configuration
const CONFIG = {
    updateInterval: 5000, // 5 seconds
    tempFluctuation: 0.5,
    energyBase: 45.0,
    energyVariance: 5.0
};

async function simulate() {
    console.log('Starting IoT Simulation...');
    console.log('Press Ctrl+C to stop.');

    while (true) {
        try {
            // 1. Update Thermostats
            const thermostats = await prisma.device.findMany({
                where: { deviceType: 'THERMOSTAT' }
            });

            for (const t of thermostats) {
                const current = JSON.parse(t.currentState || '{}');
                let newTemp = current.temp || 72;

                // Random fluctuation
                const change = (Math.random() - 0.5) * CONFIG.tempFluctuation;
                newTemp += change;

                // Keep within reasonable bounds
                if (newTemp > 75) newTemp -= 0.5;
                if (newTemp < 68) newTemp += 0.5;

                await prisma.device.update({
                    where: { id: t.id },
                    data: {
                        currentState: JSON.stringify({ ...current, temp: parseFloat(newTemp.toFixed(1)) }),
                        lastUpdate: new Date()
                    }
                });

                // Record sensor reading
                await prisma.sensorReading.create({
                    data: {
                        deviceId: t.id,
                        value: newTemp,
                        unit: 'F',
                        quality: 'GOOD'
                    }
                });
            }

            // 2. Update Energy Meter
            const energyMeters = await prisma.device.findMany({
                where: { name: 'Main Power Meter' }
            });

            for (const m of energyMeters) {
                const usage = CONFIG.energyBase + (Math.random() - 0.5) * CONFIG.energyVariance;

                await prisma.device.update({
                    where: { id: m.id },
                    data: {
                        currentState: JSON.stringify({ power: parseFloat(usage.toFixed(2)), voltage: 240 }),
                        lastUpdate: new Date()
                    }
                });

                await prisma.sensorReading.create({
                    data: {
                        deviceId: m.id,
                        value: usage,
                        unit: 'kW',
                        quality: 'GOOD'
                    }
                });
            }

            // 3. Random Security Events (10% chance)
            if (Math.random() < 0.1) {
                const cameras = await prisma.device.findMany({
                    where: { deviceType: 'CAMERA' }
                });

                if (cameras.length > 0) {
                    const cam = cameras[0];
                    console.log(`[EVENT] Motion detected at ${cam.name}`);

                    await prisma.systemAlert.create({
                        data: {
                            systemId: cam.systemId,
                            alertType: 'INFO',
                            category: 'SECURITY',
                            title: 'Motion Detected',
                            message: `Motion detected at ${cam.location}`,
                            severity: 1
                        }
                    });
                }
            }

            process.stdout.write('.');
        } catch (error) {
            console.error('Simulation error:', error);
        }

        await new Promise(resolve => setTimeout(resolve, CONFIG.updateInterval));
    }
}

simulate()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
