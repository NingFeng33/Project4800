const { Room, Booking } = require('../models');

exports.checkRoomAvailability = async (req, res) => {
    const { date, time, courseId } = req.body;
    try {
        const availableRooms = await Room.findAvailableRooms(date, time, courseId);
        res.json({ success: true, availableRooms });
    } catch (error) {
        console.error('Error checking room availability:', error);
        res.status(500).send('Error checking room availability');
    }
};

exports.bookRoom = async (req, res) => {
    const { roomId, date, time, userId } = req.body;
    try {
        const newBooking = await Booking.create({ roomId, date, time, userId });
        res.json({ success: true, message: 'Room booked successfully', bookingId: newBooking.id });
    } catch (error) {
        console.error('Error booking room:', error);
        res.status(500).send('Error booking room');
    }
};