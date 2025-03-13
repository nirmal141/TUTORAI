from fastapi import APIRouter, HTTPException
from typing import Optional
from ..models.schemas import ProfessorAvailability, MeetingBooking
from ..services.meeting_service import (
    add_professor_availability,
    get_professor_availabilities,
    book_meeting,
    get_student_bookings,
    get_professor_bookings,
    cancel_booking
)

router = APIRouter(prefix="/api", tags=["meetings"])

@router.post("/professor/availability")
async def create_professor_availability(availability: ProfessorAvailability):
    """Add a new availability slot for a professor"""
    try:
        return add_professor_availability(availability)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/professor/availability")
async def list_professor_availabilities(professor_name: Optional[str] = None):
    """Get availabilities for professors"""
    try:
        return get_professor_availabilities(professor_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/student/book-meeting")
async def create_meeting_booking(booking: MeetingBooking):
    """Book a meeting with a professor"""
    try:
        return book_meeting(booking)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/bookings")
async def list_student_bookings(student_email: str):
    """Get bookings for a specific student"""
    try:
        return get_student_bookings(student_email)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/professor/bookings")
async def list_professor_bookings(professor_name: str):
    """Get bookings for a specific professor"""
    try:
        return get_professor_bookings(professor_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/booking/{booking_id}")
async def delete_booking(booking_id: str):
    """Cancel a booking and make the slot available again"""
    try:
        return cancel_booking(booking_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 