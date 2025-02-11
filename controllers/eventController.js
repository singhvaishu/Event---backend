const Event = require("../models/event");
const moment = require("moment");

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { name, date, description, price, status, location, category } = req.body;

        const imageUrl = req.file ? req.file.path : null;
        console.log("request file:", req.file);


        console.log("File is uploaded:", imageUrl);

        if (!name || !date || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newEvent = new Event({
            name,
            date,
            description,
            price,
            imageUrl,
            peopleAttend: 0,
            status,
            location,
            category
        });

        await newEvent.save();
        req.io.emit("eventCreated", newEvent);

        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Error creating event", error });
    }
};


// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: "Error fetching events", error });
    }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Use Moment.js to format the date
        const formattedDate = moment(event.date).format("YYYY-MM-DD");

        // Send the response with the formatted date
        res.status(200).json({ ...event._doc, date: formattedDate });
    } catch (error) {
        res.status(500).json({ message: "Error fetching event", error });
    }
};


// Update an event
exports.updateEvent = async (req, res) => {
    try {
        const { name, date, description, price, peopleAttend, status, location, category } = req.body;
        let updateData = { name, date, description, price, peopleAttend, status, location, category };

        if (req.file) updateData.imageUrl = req.file.path;

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

        req.io.emit("eventUpdated", updatedEvent); // Emit event using Socket.IO
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: "Error updating event", error });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: "Event not found" });

        req.io.emit("eventDeleted", deletedEvent._id); // Emit event deletion
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting event", error });
    }

};

exports.joinEvent = async (req, res) => {
    try {
        const eventId = req.params.id;  // Matches ':id' in route
        const userId = req.body.userId || (req.user ? req.user.id : null);

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }


        if (event.attendees.includes(userId)) {
            return res.status(400).json({ message: 'User already joined this event' });
        }

        event.attendees.push(userId);
        event.peopleAttend += 1;
        await event.save();

        if (req.io) {
            req.io.emit('attendeeCountUpdated', { eventId, peopleAttend: event.peopleAttend });
        }

        res.status(200).json({ message: 'Joined event successfully', peopleAttend: event.peopleAttend });
    } catch (error) {
        console.error('Error joining event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.withdrawEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id || req.body.userId;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.attendees.includes(userId)) {
            return res.status(400).json({ message: 'User has not joined this event' });
        }


        event.attendees = event.attendees.filter(id => id.toString() !== userId);
        event.peopleAttend -= 1;
        await event.save();

        // Emit the updated attendee count via Socket.IO for real-time updates
        req.io.emit('attendeeCountUpdated', { eventId, peopleAttend: event.peopleAttend });

        res.status(200).json({ message: 'Withdrawn from event successfully', peopleAttend: event.peopleAttend });
    } catch (error) {
        console.error('Error withdrawing from event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
