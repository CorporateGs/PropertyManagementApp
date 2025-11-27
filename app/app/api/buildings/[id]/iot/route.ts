import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const buildingId = params.id;

        const systems = await prisma.buildingSystem.findMany({
            where: {
                buildingId: buildingId,
            },
            include: {
                devices: {
                    include: {
                        readings: {
                            orderBy: {
                                timestamp: 'desc'
                            },
                            take: 1
                        }
                    }
                },
                sensors: {
                    include: {
                        readings: {
                            orderBy: {
                                timestamp: 'desc'
                            },
                            take: 1
                        }
                    }
                },
                alerts: {
                    where: {
                        isResolved: false
                    }
                }
            },
        });

        // Also fetch active emergency alerts for the building
        const emergencyAlerts = await prisma.emergencyAlert.findMany({
            where: {
                buildingId: buildingId,
                isActive: true
            }
        });

        return NextResponse.json({
            systems,
            emergencyAlerts
        });
    } catch (error) {
        console.error("[BUILDING_IOT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
