import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                price: 'asc',
            },
        });

        return NextResponse.json({ success: true, data: services });
    } catch (error) {
        console.error('Failed to fetch services:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch services' },
            { status: 500 }
        );
    }
}
