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
dotenv.config();

connectDB();


const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500', 
  credentials:true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));




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

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
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
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  
  server.close(() => process.exit(1));
});