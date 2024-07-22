const jwt = require('jsonwebtoken');
const FormData = require('../models/formDataSchema');
const Application = require('../models/Application');
// Handle user registration
const submitHandler = async (req, res) => {
  const { nam, email, password, age, dob, image } = req.body;
  try {
    const newData = new FormData({ nam, email, password, age, dob, image });
    await newData.save();
    res.status(201).json({ message: 'Data saved' });
    console.log('Data saved:', newData);
  } catch (err) {
    res.status(500).json({ message: 'Error saving data', error: err.message });
  }
};

// Handle user login
const loginHandler = async (req, res) => {
  const { nam, password } = req.body;
  try {
    const user = await FormData.findOne({ nam, password });
    if (user) {
      const token = jwt.sign({ userId: user._id }, 'jwtkey', { expiresIn: '4h' });
      res.cookie('token', token, { httpOnly: true });
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error during login', error: err.message });
  }
};

// Handle user logout
const logoutHandler = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Error during logout', error: err.message });
  }
};

// Middleware to verify user authentication
const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ status: false, message: 'Authentication failed' });
    }
    const decoded = jwt.verify(token, 'jwtkey');
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ status: false, message: 'Token is invalid' });
  }
};

const getDataHandler = async (req, res) => {
  try {
    const data = await FormData.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving data', error: err.message });
  }
};

const getProfileHandler = async (req, res) => {
  try {
    const user = await FormData.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user profile', error: err.message });
  }
};

const homeHandler = async (req, res) => {
  res.status(200).json({ message: 'You are authorized to access the home page!' });
};

const applyHandler = async (req, res) => {
  const { opp } = req.body;
  try {
    const userId = req.user.userId;
    const newApplication = new Application({
      userId,
      stipend: opp.Stipend,
      location: {
        office: opp.Location?.Office,
        stipend: opp.Location?.Stipend
      },
      role: opp.Role,
      company: opp.Company
    });

    await newApplication.save();

    // Update the FormData document to reference the new application
    await FormData.findByIdAndUpdate(userId, {
      $push: { applications: newApplication._id }
    });

    res.status(200).json({ message: 'Application successful', applied: opp });
  } catch (err) {
    res.status(500).json({ message: 'Error applying for internship', error: err.message });
  }
};

const getAppliedHandler = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch the user's applications
    const user = await FormData.findById(userId).populate('applications');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.applications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applied internships', error: err.message });
  }
};


module.exports = {
  submitHandler,
  applyHandler,
  loginHandler,
  verifyUser,
  getDataHandler,
  homeHandler,
  getProfileHandler,
  logoutHandler,
  getAppliedHandler
};
