Room.getAvailableRooms = async function(date, startTime, endTime) {
    const rooms = await this.findAll({
        include: [{
            model: RoomBooking,
            where: {
                booking_date: date,
                start_time: { [Op.lte]: endTime },
                end_time: { [Op.gte]: startTime }
            },
            required: false
        }]
    });
    return rooms.filter(room => room.RoomBookings.length === 0);
};
