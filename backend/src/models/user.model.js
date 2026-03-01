import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: function () {
                return !this.googleId;
            },
            minlength: 6,
            select: false,
            trim: true,
            validate(value) {
                if (value && value.toLowerCase().includes('password')) {
                    throw new Error('Password cannot contain the word "password"');
                }
            },
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        role: {
            type: String,
            enum: ['student', 'admin'],
            default: 'student',
            required: true,
        },

        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light',
        },

        avatar: {
            url: String,
            publicId: String,
        },

        isBlacklisted: {
            type: Boolean,
            default: false,
        },

        refreshToken: {
            type: String,
        },

        passwordResetToken: {
            type: String,
            select: false,
        },

        passwordResetExpires: {
            type: Date,
            select: false,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        emailOTP: {
            type: String,
            select: false,
        },

        emailOTPExpires: Date,
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 11);
});
userSchema.methods.isPasswordMatch = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.setEmailOTP = async function (otp) {
    this.emailOTP = await bcrypt.hash(otp, 10);
    this.emailOTPExpires = Date.now() + 10 * 60 * 1000;
};

userSchema.methods.isEmailOTPMatch = async function (otp) {
    if (!this.emailOTP) return false;
    return await bcrypt.compare(otp, this.emailOTP);
};

userSchema.methods.clearEmailOTP = function () {
    this.emailOTP = undefined;
    this.emailOTPExpires = undefined;
};

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.refreshToken;
    delete user.emailOTP;
    delete user.emailOTPExpires;
    return user;
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
};

userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

userSchema.index({ isEmailVerified: 1, createdAt: 1 });

export default mongoose.model('User', userSchema);
