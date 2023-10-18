const express = require('express');
const router = express.Router();
const { executeQuery } = require('../pool');

// Duration of booking in minutes (1 hour)
const defaultBookingDuration = 60;

// API to create a booking
router.post('/createBooking', async (req, res) => {
  try {
    const {
      booking_date,
      booking_time,
      bookingorgUser,
      clinicid,
      description,
      bookinguser_email,
    } = req.body;

    // Check if the user has any other booking at the specified time
    const checkExistingBookingQuery =
      'SELECT * FROM user_booking WHERE booking_date = ? AND booking_time = ? AND bookingorgUser = ?';
    const [existingBooking] = await executeQuery(checkExistingBookingQuery, [
      booking_date,
      booking_time,
      bookingorgUser,
    ]);

    if (existingBooking) {
      return res
        .status(400)
        .json({ message: 'User already has a booking at this time.' });
    }

    // Retrieve the user's timing from usertiming
    const getUserTimingQuery =
      'SELECT usertiming FROM clinicusers WHERE user_id = ?';
    const [userTimingResult] = await executeQuery(getUserTimingQuery, [
      bookingorgUser,
    ]);

    if (!userTimingResult || !userTimingResult.usertiming) {
      return res
        .status(400)
        .json({ message: 'User timing not found or invalid.' });
    }

    const userTiming = userTimingResult.usertiming;

    // Check if the user is available at the specified time on the given day
    const dayOfWeek = new Date(booking_date).toLocaleDateString('en-US', {
      weekday: 'long',
    });

    if (!userTiming[dayOfWeek]) {
      return res
        .status(400)
        .json({ message: 'User is not available on this day.' });
    }

    const [startTime, endTime] = userTiming[dayOfWeek].split(' - ');
    const bookingDateTime = new Date(`${booking_date}T${booking_time}`);
    const bookingStartTime = new Date(`${booking_date}T${startTime}`);
    const bookingEndTime = new Date(`${booking_date}T${endTime}`);

    if (
      bookingDateTime < bookingStartTime ||
      bookingDateTime >= bookingEndTime
    ) {
      return res
        .status(400)
        .json({ message: 'User is not available at this time.' });
    }

    // Create the booking
    const createBookingQuery =
      'INSERT INTO user_booking (booking_date, booking_time, booking_duration, bookingorgUser, clinicid, description,bookinguser_email) VALUES (?, ?, ?, ?, ?, ?,?)';
    await executeQuery(createBookingQuery, [
      booking_date,
      booking_time,
      defaultBookingDuration, // Default booking duration in minutes
      bookingorgUser,
      clinicid,
      description,
      bookinguser_email,
    ]);

    res.status(201).json({ message: 'Booking created successfully.' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while creating the booking.' });
  }
});

module.exports = router;
