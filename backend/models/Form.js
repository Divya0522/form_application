const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  title: {
     type: String,
        required: [true, 'Please add a form title'],
        minlength: [3, 'Title must be at least 3 characters']
  },
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  fields: [{
    id: String,
    type: {
      type: String,
      enum: ['text', 'email', 'number', 'date', 'dropdown', 'radio', 'checkbox', 'textarea', 'file', 'rating', 'range','time'],
      required: true
    },
    label: String,
    options: [String], 
    required: Boolean,
    placeholder: String,
    min: Number,
    max: Number
  }],
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateCategory: {
    type: String,
    enum: ['Survey', 'Registration', 'Contact', 'Feedback', 'Job Application', 'Appointment', 'Newsletter', 'RSVP', 'Donation', 'Other'],
    default: 'Other'
  },
  templateImage: {
    type: String,
    default: ''
  },
   createdFromTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form'
    }
},
 {
  timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


formSchema.virtual('responseCount', {
    ref: 'Response',
    localField: '_id',
    foreignField: 'form',
    count: true
});


formSchema.post('save', function (error, doc, next) {
    if (error.name === 'ValidationError') {
        const errors = {};
        Object.keys(error.errors).forEach(key => {
            errors[key] = error.errors[key].message;
        });
        next(new ErrorHandler('Validation failed', 400, errors));
    } else {
        next(error);
    }
});
module.exports = mongoose.model('Form', formSchema);