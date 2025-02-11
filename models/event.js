const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    peopleAttend: { type: Number, default: 0 },

    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    price: { type: Number, required: true },
    imageUrl: { type: String, required: false }, // Cloudinary URL
    peopleAttend: { type: Number, required: true },
    status: { type: String, enum: ["Upcoming", "Ongoing", "Completed"], default: "Upcoming" },
    location: { type: String, required: true },
    category: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);
