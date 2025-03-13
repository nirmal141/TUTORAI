import uuid
from fastapi import HTTPException
from ..config.settings import professor_availabilities, meeting_bookings
from ..utils.helpers import generate_google_meet_link

def add_professor_availability(availability_data):
    """
    Add a new availability slot for a professor.
    
    Args:
        availability_data: Availability data dict
        
    Returns:
        Added availability with ID
    """
    # Generate a unique ID for the availability
    availability_id = str(uuid.uuid4())
    
    # Generate a Google Meet link if not provided
    if not availability_data.meeting_link:
        meeting_link = generate_google_meet_link()
    else:
        meeting_link = availability_data.meeting_link
    
    # Store availability with its ID and meeting link
    stored_availability = availability_data.dict()
    stored_availability["id"] = availability_id
    stored_availability["meeting_link"] = meeting_link
    professor_availabilities.append(stored_availability)
    
    return {
        "id": availability_id, 
        "meeting_link": meeting_link,
        "status": "Availability added successfully"
    }

def get_professor_availabilities(professor_name=None):
    """
    Get availabilities for a specific professor or all professors.
    
    Args:
        professor_name: Optional professor name to filter by
        
    Returns:
        List of availabilities
    """
    if professor_name:
        # Filter availabilities by professor name
        filtered_availabilities = [a for a in professor_availabilities 
                                  if a["professor_name"] == professor_name]
        return {"availabilities": filtered_availabilities}
    
    # Return all availabilities if no professor name provided
    return {"availabilities": professor_availabilities}

def book_meeting(booking_data):
    """
    Book a meeting with a professor.
    
    Args:
        booking_data: Booking data dict
        
    Returns:
        Booking details
    """
    # Find the availability to update
    availability = None
    for avail in professor_availabilities:
        if avail["id"] == booking_data.availability_id:
            if avail["is_booked"]:
                return {"status": "error", "message": "This time slot is already booked"}
            availability = avail
            break
    
    if not availability:
        return {"status": "error", "message": "Availability not found"}
    
    # Mark as booked
    availability["is_booked"] = True
    
    # Store booking
    booking_id = str(uuid.uuid4())
    stored_booking = booking_data.dict()
    stored_booking["id"] = booking_id
    stored_booking["professor_name"] = availability["professor_name"]
    stored_booking["date"] = availability["date"]
    stored_booking["start_time"] = availability["start_time"]
    stored_booking["end_time"] = availability["end_time"]
    stored_booking["meeting_link"] = availability["meeting_link"]
    # Make sure availability_id is included in the stored booking
    stored_booking["availability_id"] = booking_data.availability_id
    meeting_bookings.append(stored_booking)
    
    return {
        "id": booking_id,
        "status": "success",
        "message": "Meeting booked successfully"
    }

def get_student_bookings(student_email):
    """
    Get bookings for a specific student.
    
    Args:
        student_email: Student email to filter by
        
    Returns:
        List of student bookings
    """
    # Filter bookings by student email
    student_bookings = [b for b in meeting_bookings if b["student_email"] == student_email]
    return {"bookings": student_bookings}

def get_professor_bookings(professor_name):
    """
    Get bookings for a specific professor.
    
    Args:
        professor_name: Professor name to filter by
        
    Returns:
        List of professor bookings
    """
    # Filter bookings by professor name
    professor_bookings = [b for b in meeting_bookings if b["professor_name"] == professor_name]
    return {"bookings": professor_bookings}

def cancel_booking(booking_id):
    """
    Cancel a booking and make the slot available again.
    
    Args:
        booking_id: ID of the booking to cancel
        
    Returns:
        Cancellation status
    """
    # Find the booking
    booking_to_cancel = None
    for i, booking in enumerate(meeting_bookings):
        if booking["id"] == booking_id:
            booking_to_cancel = booking
            # Remove the booking from the list
            meeting_bookings.pop(i)
            break
    
    if not booking_to_cancel:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Find the corresponding availability and mark it as available
    availability_id = booking_to_cancel["availability_id"]
    availability_updated = False
    
    for avail in professor_availabilities:
        if avail["id"] == availability_id:
            avail["is_booked"] = False
            availability_updated = True
            break
    
    if not availability_updated:
        # This is an unexpected state, but we'll handle it gracefully
        # The booking was deleted, but we couldn't update the availability
        return {
            "status": "partial_success",
            "message": "Booking was cancelled, but the availability status could not be updated"
        }
    
    return {
        "status": "success",
        "message": "Booking cancelled successfully"
    } 