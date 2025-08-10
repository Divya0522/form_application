
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');
const responseRoutes = require('./routes/responseRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ErrorHandler = require('./utils/errorHandler');
const User = require('./models/User');
const Form = require('./models/Form');
const seedTemplates = require('./seeders/templateSeeder');
const path = require('path');

dotenv.config();


connectDB();

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../html')));


app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use("/api/responses", responseRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ success: false, error: messages });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);


  try {
    const templateCount = await Form.countDocuments({ isTemplate: true });
    if (templateCount === 0) {
      console.log('No templates found. Seeding default templates...');
      await seedTemplates();
      console.log('Template seeding complete.');
    }
  } catch (err) {
    console.error('Template initialization failed:', err);
  }
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
