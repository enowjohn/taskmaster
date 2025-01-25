const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google Strategy if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (!user) {
            // Create new user if doesn't exist
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              profilePicture: profile.photos[0].value,
              googleId: profile.id,
              password: Math.random().toString(36).slice(-8), // Random password for Google users
            });
          } else if (!user.googleId) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.profilePicture = profile.photos[0].value;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

module.exports = passport;
