const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { supabaseAdmin } = require('./database');
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', profile.emails[0].value)
            .single();

          if (existingUser) {
            // User exists, return user
            return done(null, existingUser);
          } else {
            // Create new user
            const newUser = {
              first_name: profile.name.givenName || 'User',
              last_name: profile.name.familyName || 'Name',
              email: profile.emails[0].value,
              password: '', // No password for OAuth users
              role: 'student',
              google_id: profile.id,
              avatar: profile.photos[0]?.value || null
            };

            const { data: createdUser } = await supabaseAdmin
              .from('users')
              .insert([newUser])
              .select()
              .single();

            return done(null, createdUser);
          }
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
