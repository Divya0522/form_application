const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a form title']
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
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'email', 'number', 'date', 'dropdown', 'radio', 'checkbox', 'textarea', 'file', 'rating'],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    options: [String],
    required: {
      type: Boolean,
      default: false
    }
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
});
module.exports = mongoose.model('Form', formSchema);