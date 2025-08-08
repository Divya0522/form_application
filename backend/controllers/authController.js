const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

const ADMIN_EMAILS = ['admin1@gmail.com', 'admin2@gmail.com'];

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler('User already exists with this email', 400));
    }

     const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
    const user = await User.create({
      fullName,
      email,
      password,
      role
    });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    next(new ErrorHandler(error.message, 400));
  }
};

// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return next(new ErrorHandler('Please provide email and password', 400));
//     }

//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       return next(new ErrorHandler('Invalid credentials', 401));
//     }

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return next(new ErrorHandler('Invalid credentials', 401));
//     }

//     const token = generateToken(user._id);

//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorHandler('Invalid credentials', 401));
    }

    // Use bcrypt directly for comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler('Invalid credentials', 401));
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(new ErrorHandler('Server error', 500));
  }
};
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler('User not found with this email', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    console.log('Update request received:', req.body); // Log incoming data
    
    const { fullName, email, password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return next(new ErrorHandler('User not found', 404));
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();
    console.log('User updated successfully:', user);

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(new ErrorHandler(error.message, 500));
  }
};