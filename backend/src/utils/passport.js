import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
                process.env.NODE_ENV === 'production'
                    ? 'https://skillbridge-server-zeta.vercel.app/api/v1/user/auth/google/callback'
                    : 'http://localhost:5000/api/v1/user/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    user.googleId = profile.id;
                    if (!user.isEmailVerified) user.isEmailVerified = true;
                    await user.save({ validateBeforeSave: false });
                    return done(null, user);
                }

                const newUser = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    isEmailVerified: true,
                    avatar: {
                        url: profile.photos[0]?.value,
                        publicId: `google_${profile.id}`,
                    },
                    role: 'student',
                });

                return done(null, newUser);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);
