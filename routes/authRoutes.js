
const express = require('express');
const { register, login, guestRegister } = require('../controllers/authController');
const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.post('/guestsignup', guestRegister);
module.exports = router;
