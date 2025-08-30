const express = require('express');
const { validateLogin, validateSignup } = require('../middleware/validation.middleware');
const { login, signup } = require('../controllers/auth/auth.controller');

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/signup', validateSignup, signup);

module.exports = router;
