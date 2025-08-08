const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const ErrorHandler = require('./utils/errorHandler');
const bodyParser = require('body-parser');
const formRoutes = require('./routes/formRoutes');
const responseRoutes=require("./routes/responseRoutes");
const adminRoutes = require('./routes/adminRoutes');
const User = require('./models/User');
const Form = require('./models/Form');

dotenv.config();


async function initializeTemplates() {
  try {
    const ADMIN_EMAILS = ['admin1@gmail.com', 'admin2@gmail.com'];
    const adminUser = await User.findOne({ email: { $in: ADMIN_EMAILS } });
    
    if (!adminUser) {
      console.log('No admin user found. Skipping template initialization');
      return;
    }

    const templateCount = await Form.countDocuments({ isTemplate: true });
    if (templateCount === 0) {
      const seedTemplates = require('./seeders/templateSeeder');
      await seedTemplates();
      console.log('Templates seeded successfully');
    }
  } catch (error) {
    console.error('Template initialization error:', error);
  }
}


// Change the connection handler to:
connectDB().then(async () => {
  console.log('Database connected, initializing templates...');
  try {
    await initializeTemplates();
  } catch (err) {
    console.error('Template initialization failed:', err);
  }
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500', 
  credentials:true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.get('/api/seed-templates', async (req, res) => {
    try {
        await seedTemplates();
        res.status(200).json({ success: true, message: 'Templates seeded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.use(express.json());

app.use(cookieParser());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use("/api/responses",responseRoutes);
app.use('/api/admin', adminRoutes);


app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    // Log the error for debugging
    console.error('Error:', err.message, err.stack);
    
    // Send detailed error in development
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack
        });
    } else {
        // Send simplified error in production
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
});

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.originalUrl}`);
  next();
});



// Update the /save-form endpoint
app.post('/save-form', (req, res) => {
    const formData = req.body;
    const formId = formData.id || Date.now().toString();
    
    // Ensure the forms directory exists
    if (!fs.existsSync('forms')) {
        fs.mkdirSync('forms');
    }
    
    fs.writeFile(`forms/${formId}.json`, JSON.stringify(formData), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving form');
        }
        res.send({ id: formId });
    });
});

// Update the /load-form endpoint
app.get('/load-form/:id', (req, res) => {
    fs.readFile(`forms/${req.params.id}.json`, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(404).send('Form not found');
        }
        res.send(JSON.parse(data));
    });
});

app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Backend is working!' });
});

// app.js - Add this after all routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            error: messages
        });
    }
    
    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
    
    // Default error handling
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error'
    });
});
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  
  server.close(() => process.exit(1));
});