const express = require('express');
const router = express.Router();
const { Course, Program, Room } = require('../models');

// GET: manager page showing courses and rooms
router.get('/manager', async (req, res) => {
    try {
        const courses = await Course.findAll({
            include: [{ model: Program,
                        as: 'Program'
             }],
          });
      const rooms = await Room.findAll();
      const programs = await Program.findAll({
        include: [
          {
            model: Course,
            as: 'Courses'
          }
        ]
      });
  
      res.render('manager', { courses, rooms, programs, showModal: false, editData: null });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      res.status(500).send('Error fetching data');
    }
});

// POST: Add a new course
router.post('/courses', async (req, res) => {
    const { courseCode, courseName, programName, startDate, endDate } = req.body;
  
    try {
      let program;
  
      // Check if a program with the given name already exists
      program = await Program.findOne({ where: { program_name: programName } });
  
      // If program doesn't exist, create a new one
      if (!program) {
        program = await Program.create({
          program_name: programName
        });
      }
  
      await Course.create({
        course_code: courseCode,
        course_name: courseName,
        program_id: program.program_id,  
        start_date: startDate,
        end_date: endDate,
      });
  
      res.redirect('/admin/manager');
    } catch (error) {
      console.error('Failed to add course:', error);
      res.status(500).json({ error: 'Failed to add course due to a server error.' });
    }
});

// Delete course by ID
router.post('/courses/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
      await Course.destroy({ where: { course_id: id } });
      res.redirect('/admin/manager'); 
  } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).send('Error deleting course');
  }
});
  
// POST: Add a new room
router.post('/rooms', async (req, res) => {
    const { roomNumber, capacity } = req.body; 
  
    try {
      await Room.create({
        room_number: roomNumber,
        capacity: capacity  
      });
      res.redirect('/admin/manager');
    } catch (error) {
      console.error('Failed to add room:', error);
      res.status(500).json({ error: 'Failed to add room due to server error.' });
    }
});
  
// Delete room by ID
router.post('/rooms/:id/delete', async (req, res) => {
    try {
        await Room.destroy({ where: { room_id: req.params.id } });
        res.redirect('/admin/manager'); 
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).send('Error deleting room');
    }
});

// Fetch paginated courses
router.get('/courses', async (req, res) => {
  const { page = 1, limit = 5 } = req.query; // Default to page 1, limit 5
  try {
      const { count, rows: courses } = await Course.findAndCountAll({
          include: 'Program',
          limit: parseInt(limit), // Convert to number
          offset: (page - 1) * limit, // Calculate offset
      });
      res.json({ courses, totalPages: Math.ceil(count / limit), currentPage: parseInt(page) });
  } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).send('Error fetching courses');
  }
});

// Fetch paginated rooms
router.get('/rooms', async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  try {
      const { count, rows: rooms } = await Room.findAndCountAll({
          limit: parseInt(limit),
          offset: (page - 1) * limit,
      });
      res.json({ rooms, totalPages: Math.ceil(count / limit), currentPage: parseInt(page) });
  } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).send('Error fetching rooms');
  }
});

// Handle form submission to update course
router.post('/courses/:id/edit', async (req, res) => {
  const { id } = req.params;
  const { codeOrNumber, nameOrCapacity, program } = req.body;

  console.log(`Received ID: ${id}`);
  console.log(`Received data:`, { codeOrNumber, nameOrCapacity, program });

  try {
      const course = await Course.findByPk(id);
      
      if (course) {
          course.course_code = codeOrNumber;
          course.course_name = nameOrCapacity;

          if (program) {
              const programInstance = await Program.findOne({ where: { program_name: program } });
              
              if (programInstance) {
                  course.program_id = programInstance.program_id;
              } else {
                  console.error(`Program with name "${program}" not found.`);
                  return res.status(404).json({ message: 'Program not found' });
              }
          }

          await course.save();
          console.log('Course updated successfully');
          res.status(200).json({ message: 'Course updated successfully' });
      } else {
          console.error(`Course with ID ${id} not found.`);
          res.status(404).json({ message: 'Course not found' });
      }
  } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Handle form submission to update room
router.post('/rooms/:id/edit', async (req, res) => {
  const { id } = req.params;
  const { codeOrNumber, nameOrCapacity } = req.body;

  console.log(`Received Room ID: ${id}`);
  console.log(`Received data for update:`, { codeOrNumber, nameOrCapacity });

  try {
    // Find the room by ID
    const room = await Room.findByPk(id);

    if (room) {
      // Update room details
      room.room_number = codeOrNumber;
      room.capacity = nameOrCapacity;

      // Save the changes
      await room.save();
      console.log(`Room with ID ${id} updated successfully`);

      // Redirect to the manager page or send a success response
      res.status(200).json({ message: 'Room updated successfully' });
    } else {
      console.error(`Room with ID ${id} not found.`);
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a new program
router.post('/programs', async (req, res) => {
  const { programName } = req.body;
  try {
    await Program.create({ program_name: programName });
    res.redirect('/admin/manager'); // Redirect back to the manager page
  } catch (error) {
    console.error('Failed to add program:', error);
    res.status(500).json({ error: 'Failed to add program due to server error.' });
  }
});

// Edit an existing program
router.post('/programs/:id/edit', async (req, res) => {
  try {
      const { program_name } = req.body;
      const programId = req.params.id;

      await Program.update(
          { program_name },
          { where: { program_id: programId } }
      );

      res.redirect('/admin/manager'); 
  } catch (error) {
      console.error('Error updating program:', error);
      res.status(500).send('Error updating program');
  }
});

// Delete a program
router.post('/programs/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
    await Program.destroy({ where: { program_id: id } });
    res.redirect('/admin/manager'); // Redirect back to the manager page
  } catch (error) {
    console.error('Failed to delete program:', error);
    res.status(500).json({ error: 'Failed to delete program due to server error.' });
  }
});




module.exports = router;
