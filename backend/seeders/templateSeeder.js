const mongoose = require('mongoose');
const Form = require('../models/Form');
const User=require("../models/User");
const ADMIN_USER_ID ='6878ba0610fd27c4ab974e27';
const defaultTemplates = [
  {
    title:"Survey Form",
    description: "Collect valuable feedback and insights from your audience with this customizable survey template.",
    templateTitle: "Survey Form",
    templateBadge: "Popular",
    templateDescription: "Collect valuable feedback and insights from your audience with this customizable survey template.",
    templateImage: "https://img.freepik.com/free-photo/survey-form-research-marketing-mark-concept_53876-127959.jpg",
    isTemplate: true,
    createdBy: ADMIN_USER_ID,
    
    fields: [
      {
        type: "text",
        label: "Full Name",
        placeholder: "Enter your name",
        required: true,
        id: "fullName"
      },
      {
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email",
        required: true,
        id: "email"
      },
      {
        type: "number",
        label: "Age",
        min: 0,
        max: 120,
        id: "age"
      },
      {
        type: "radio",
        label: "Gender",
        options: ["Male", "Female", "Other"],
        id: "gender"
      },
      {
        type: "dropdown",
        label: "Which product do you use most?",
        options: ["Product A", "Product B", "Product C"],
        id: "product"
      },
      {
        type: "checkbox",
        label: "Which features do you use? (Select all that apply)",
        options: ["Search", "Filters", "Dashboard"],
        id: "features"
      },
      {
        type: "rating",
        label: "Rate your satisfaction with our service",
        max: 5,
        id: "rating"
      },
      {
        type: "textarea",
        label: "Any additional comments or feedback?",
        placeholder: "Please share your thoughts...",
        id: "comments"
      }
    ]
  },
  {
    title:"Registration Form",
    description: "Sign up users for events, courses, or memberships with this comprehensive registration form.",
    templateTitle: "Registration Form",
    templateDescription: "Sign up users for events, courses, or memberships with this comprehensive registration form.",
    templateImage: "https://img.freepik.com/premium-vector/registration-form-template-with-flat-design_23-2147976703.jpg",
    isTemplate: true,
     createdBy: ADMIN_USER_ID,
   
    fields: [
      {
        type: "text",
        label: "First Name",
        required: true,
        id: "firstName"
      },
      {
        type: "text",
        label: "Last Name",
        required: true,
        id: "lastName"
      },
      {
        type: "email",
        label: "Email Address",
        required: true,
        id: "email"
      },
      {
        type: "text",
        label: "Phone Number",
        placeholder: "Format: 123-456-7890",
        id: "phone"
      },
      {
        type: "text",
        label: "Address",
        id: "address"
      },
      {
        type: "text",
        label: "City",
        id: "city"
      },
      {
        type: "text",
        label: "State/Province",
        id: "state"
      },
      {
        type: "text",
        label: "ZIP/Postal Code",
        id: "zip"
      },
      {
        type: "dropdown",
        label: "Registration Type",
        options: ["General Admission", "VIP", "Student", "Group"],
        id: "registrationType"
      }
    ]
  },
  {
    title:"ContactUs Form",
    description: "Collect inquiries and messages from your website visitors with this simple contact form.",
    templateTitle: "ContactUs Form",
    templateDescription: "Collect inquiries and messages from your website visitors with this simple contact form.",
    templateImage: "https://nortwood.com/wp-content/uploads/2022/11/contact-us-concept-with-wood-block-and-symbols.jpg",
    isTemplate: true,
     createdBy: ADMIN_USER_ID,
   
    fields: [
      {
        type: "text",
        label: "Name",
        required: true,
        id: "name"
      },
      {
        type: "email",
        label: "Email",
        required: true,
        id: "email"
      },
      {
        type: "text",
        label: "Subject",
        id: "subject"
      },
      {
        type: "textarea",
        label: "Message",
        required: true,
        placeholder: "How can we help you?",
        id: "message"
      }
    ]
  },
  {
    title:"Feedback Form",
    templateTitle: "Feedback Form",
    description: "Gather customer feedback to improve your services and products with this professional form.",
    templateBadge: "New",
    templateDescription: "Gather customer feedback to improve your services and products with this professional form.",
    templateImage: "https://img.freepik.com/free-vector/flat-feedback-concept-illustrated_23-2148946027.jpg",
    isTemplate: true,
     createdBy: ADMIN_USER_ID,
   
    fields: [
      {
        type: "text",
        label: "Your Name",
        id: "name"
      },
      {
        type: "email",
        label: "Email Address",
        id: "email"
      },
      {
        type: "rating",
        label: "Overall Satisfaction",
        max: 5,
        id: "overallRating"
      },
      {
        type: "rating",
        label: "Product Quality",
        max: 5,
        id: "qualityRating"
      },
      {
        type: "rating",
        label: "Customer Service",
        max: 5,
        id: "serviceRating"
      },
      {
        type: "textarea",
        label: "What did you like most?",
        id: "likes"
      },
      {
        type: "textarea",
        label: "How can we improve?",
        id: "improvements"
      }
    ]
  },
  {
    title:"Job Application",
    description: "Collect candidate details, resumes, and job preferences with this professional application form.",
    templateTitle: "Job Application",
    templateDescription: "Collect candidate details, resumes, and job preferences with this professional application form.",
    templateImage: "https://img.freepik.com/premium-vector/hiring-recruitment-concept-job-interview-recruitment-agency-vector-illustration_199064-479.jpg",
    isTemplate: true,
     createdBy: ADMIN_USER_ID,
   
    fields: [
      {
        type: "text",
        label: "First Name",
        required: true,
        id: "firstName"
      },
      {
        type: "text",
        label: "Last Name",
        required: true,
        id: "lastName"
      },
      {
        type: "email",
        label: "Email Address",
        required: true,
        id: "email"
      },
      {
        type: "text",
        label: "Phone Number",
        required: true,
        id: "phone"
      },
      {
        type: "text",
        label: "Current Position",
        id: "currentPosition"
      },
      {
        type: "text",
        label: "Years of Experience",
        id: "experience"
      },
      {
        type: "file",
        label: "Upload Resume",
        required: true,
        id: "resume"
      },
      {
        type: "file",
        label: "Cover Letter (Optional)",
        id: "coverLetter"
      },
      {
        type: "textarea",
        label: "Why are you interested in this position?",
        id: "interest"
      }
    ]
  },
  {
    title:"Appointment Form",
    description: "Let users schedule meetings, consultations, or services with this booking form.",
    templateTitle: "Appointment Form",
    templateDescription: "Let users schedule meetings, consultations, or services with this booking form.",
    templateImage: "https://th.bing.com/th/id/OIP.4hHn15nU7521ixcqrtQn9wHaH0?w=168&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
    isTemplate: true,
     createdBy: ADMIN_USER_ID,
   
    fields: [
      {
        type: "text",
        label: "Full Name",
        required: true,
        id: "name"
      },
      {
        type: "email",
        label: "Email Address",
        required: true,
        id: "email"
      },
      {
        type: "text",
        label: "Phone Number",
        required: true,
        id: "phone"
      },
      {
        type: "dropdown",
        label: "Service Type",
        options: ["Consultation", "Check-up", "Follow-up", "Emergency"],
        required: true,
        id: "serviceType"
      },
      {
        type: "date",
        label: "Preferred Date",
        required: true,
        id: "date"
      },
      {
        type: "text",
        label: "Preferred Time",
        required: true,
        id: "time"
      },
      {
        type: "textarea",
        label: "Additional Notes",
        id: "notes"
      }
    ]
  },
  {
    title:"Newsletter",
    description: "Grow your mailing list and keep users updated with this simple subscription form.",
    templateTitle: "Newsletter Signup",
    templateDescription: "Grow your mailing list and keep users updated with this simple subscription form.",
    templateImage: "https://images.unsplash.com/photo-1620302044670-f4a8ba5fe4d8",
    isTemplate: true,
     createdBy: ADMIN_USER_ID,
  
    fields: [
      {
        type: "text",
        label: "First Name",
        id: "firstName"
      },
      {
        type: "text",
        label: "Last Name",
        id: "lastName"
      },
      {
        type: "email",
        label: "Email Address",
        required: true,
        id: "email"
      },
      {
        type: "checkbox",
        label: "Email Preferences",
        options: ["Weekly Newsletter", "Product Updates", "Special Offers"],
        id: "preferences"
      }
    ]
  },
  {
    title:"RSVP Form",
    description: "Let guests confirm their attendance for your events with this elegant RSVP form.",
    templateTitle: "RSVP Form",
    templateDescription: "Let guests confirm their attendance for your events with this elegant RSVP form.",
    templateImage: "https://img.freepik.com/free-vector/wedding-rsvp-card_23-2147968695.jpg",
    isTemplate: true,
     createdBy: ADMIN_USER_ID,
    title:"RSVP",
    fields: [
      {
        type: "text",
        label: "Full Name",
        required: true,
        id: "name"
      },
      {
        type: "email",
        label: "Email Address",
        required: true,
        id: "email"
      },
      {
        type: "radio",
        label: "Will you attend?",
        options: ["Yes, I'll be there", "No, I can't make it"],
        required: true,
        id: "attendance"
      },
      {
        type: "number",
        label: "Number of Guests",
        min: 0,
        max: 10,
        id: "guests"
      },
      {
        type: "textarea",
        label: "Dietary Restrictions or Comments",
        id: "comments"
      }
    ]
  },
  {
    title:"Donation",
    description: "Collect donations securely from your supporters with this payment-ready form.",
    templateTitle: "Donation Form",
    templateBadge: "Featured",
    templateDescription: "Collect donations securely from your supporters with this payment-ready form.",
    templateImage: "https://plus.unsplash.com/premium_photo-1683134050449-080429c850a4",
    isTemplate: true,
    fields: [
      {
        type: "text",
        label: "Full Name",
        required: true,
         createdBy: ADMIN_USER_ID,
        id: "name"
      },
      {
        type: "email",
        label: "Email Address",
        required: true,
        id: "email"
      },
      {
        type: "radio",
        label: "Donation Type",
        options: ["One-time", "Monthly"],
        required: true,
        id: "donationType"
      },
      {
        type: "dropdown",
        label: "Donation Amount",
        options: ["$10", "$25", "$50", "$100", "Other"],
        required: true,
        id: "amount"
      },
      {
        type: "text",
        label: "Custom Amount (if Other selected)",
        id: "customAmount"
      },
      {
        type: "textarea",
        label: "Dedication or Message (Optional)",
        id: "message"
      }
    ]
  }
];

async function seedTemplates() {
    try {
        const adminUser = await User.findOne({ email: { $in: ADMIN_EMAILS } });
        
        if (!adminUser) {
            console.log('Admin user not found. Skipping template seeding');
            return;
        }

        // Delete existing templates
        await Form.deleteMany({ isTemplate: true });
        console.log('Removed existing templates');

        const templatesToInsert = defaultTemplates.map(template => ({
            ...template,
            createdBy: adminUser._id,
            isTemplate: true,
            isPublished: true
        }));

        await Form.insertMany(templatesToInsert);
        console.log('Default templates seeded successfully');
    } catch (error) {
        console.error('Error seeding templates:', error);
    } finally {
        mongoose.connection.close();
    }
}

module.exports = seedTemplates;


