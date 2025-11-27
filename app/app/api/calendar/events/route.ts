import { NextRequest, NextResponse } from "next/server";
import { calendarService } from "@/lib/services/calendar/calendar-service";
import { getAuthenticatedUser } from "@/lib/auth";
import { successResponse, serverError, unauthorized } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get("buildingId");
    const eventType = searchParams.get("eventType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    const filters: any = {};
    if (buildingId) filters.buildingId = buildingId;
    if (eventType) filters.eventType = eventType;
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const events = await calendarService.getEvents(filters);

    return NextResponse.json(successResponse(events, "Events retrieved successfully"));
  } catch (error) {
    console.error("Error fetching events:", error);
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return unauthorized();
    }

    const body = await request.json();
    const eventData = {
      ...body,
      createdBy: user.id,
    };

    const event = await calendarService.createEvent(eventData);

    return NextResponse.json(successResponse(event, "Event created successfully"), { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return serverError(error);
  }
}
