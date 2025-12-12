const express = require('express');
const passport = require('passport');
const { login, signup, googleCallback, completeGoogleAuth } = require('../controllers/auth');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  googleCallback
);

router.post('/google/complete', completeGoogleAuth);

module.exports = router;

