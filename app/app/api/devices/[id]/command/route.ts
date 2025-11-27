import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const deviceId = params.id;
        const body = await request.json();
        const { command, parameters } = body;

        if (!command) {
            return new NextResponse("Command is required", { status: 400 });
        }

        // 1. Verify device exists
        const device = await prisma.device.findUnique({
            where: { id: deviceId },
            include: { system: true }
        });

        if (!device) {
            return new NextResponse("Device not found", { status: 404 });
        }

        // 2. Log the command
        const deviceCommand = await prisma.deviceCommand.create({
            data: {
                deviceId,
                command,
                parameters: parameters ? JSON.stringify(parameters) : undefined,
                issuedBy: session.user.id,
                status: "PENDING"
            }
        });

        // 3. Update device state (Optimistic update for simulation)
        // In a real system, this would wait for device acknowledgement
        // For our "God-Level" simulation, we update immediately to show responsiveness

        let newState = device.currentState ? JSON.parse(device.currentState) : {};

        // Update state based on command
        if (command === "SET_TEMPERATURE" && parameters?.temp) {
            newState.temp = parameters.temp;
        } else if (command === "SET_MODE" && parameters?.mode) {
            newState.mode = parameters.mode;
        } else if (command === "LOCK") {
            newState.locked = true;
        } else if (command === "UNLOCK") {
            newState.locked = false;
        } else if (command === "TURN_ON") {
            newState.isOn = true;
        } else if (command === "TURN_OFF") {
            newState.isOn = false;
        }

        await prisma.device.update({
            where: { id: deviceId },
            data: {
                currentState: JSON.stringify(newState),
                updatedAt: new Date()
            }
        });

        // 4. Create a system log
        await prisma.systemLog.create({
            data: {
                systemId: device.systemId,
                action: `DEVICE_COMMAND_${command}`,
                details: JSON.stringify({ deviceId, command, parameters }),
                userId: session.user.id,
                timestamp: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            commandId: deviceCommand.id,
            newState
        });

    } catch (error) {
        console.error("[DEVICE_COMMAND_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
