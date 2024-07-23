require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const FormData = require('./models/formDataSchema');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const MONGODB_URI = process.env.MONGODB_URI;

const {
  submitHandler,
  loginHandler,
  verifyUser,
  getAppliedHandler,
  getDataHandler,
  homeHandler,
  getProfileHandler,
  logoutHandler,
  applyHandler
} = require('./Routes/handlers');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.post('/submit', submitHandler);
app.post('/login', loginHandler);
app.post('/logout', logoutHandler);
app.get('/data', getDataHandler);
app.get('/profile', verifyUser, getProfileHandler);
app.get('/home', verifyUser, homeHandler);
app.post('/apply', verifyUser, applyHandler);
app.get('/applied', verifyUser, getAppliedHandler);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
