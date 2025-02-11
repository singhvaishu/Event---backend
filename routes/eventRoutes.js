


const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const upload = require("../middleware/upload");
const { guestUserRestrict, authMiddleware } = require("../middleware/authMiddleware");

// 🔹 Allow guests to view events
router.get("/events", eventController.getAllEvents); // No authMiddleware
router.get("/events/:id", eventController.getEventById); // No authMiddleware

// 🔹 Restrict event creation, updating, and deletion
router.post("/events", guestUserRestrict, upload.single("image"), eventController.createEvent);
router.put("/events/:id", guestUserRestrict, upload.single("image"), eventController.updateEvent);
router.delete("/events/:id", guestUserRestrict, eventController.deleteEvent);
router.post('/:id/join', authMiddleware, eventController.joinEvent);

// Route to withdraw from an event
router.post('/:id/withdraw', authMiddleware, eventController.withdrawEvent);

module.exports = router;
