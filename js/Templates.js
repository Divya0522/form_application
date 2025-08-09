// const templates=[{
//   image:"https://img.freepik.com/free-photo/survey-form-research-marketing-mark-concept_53876-127959.jpg",
//   templateTitle:"Survey Form",
//   templateBadge:"Popular",
//   templateDescription:"Collect valuable feedback and insights from your audience with this customizable survey template.",
//   location:"survey.html"
// },
// {
//   image:"https://img.freepik.com/premium-vector/registration-form-template-with-flat-design_23-2147976703.jpg",
//   templateTitle:"Registration Form",
//   templateDescription:"Sign up users for events, courses, or memberships with this comprehensive registration form.",
//   location:"registration.html"
// },
// {
//   image:"https://nortwood.com/wp-content/uploads/2022/11/contact-us-concept-with-wood-block-and-symbols.jpg",
//   templateTitle:"Contact Form",
//   templateDescription:"Collect inquiries and messages from your website visitors with this simple contact form.",
//   location:"contact.html"
// },
// {
//   image:"https://img.freepik.com/free-vector/flat-feedback-concept-illustrated_23-2148946027.jpg",
//   templateTitle:"Feedback Form",
//   templateBadge:"New",
//   templateDescription:"Gather customer feedback to improve your services and products with this professional form.",
//   location:"feedback.html"
// },{
//    image:"https://img.freepik.com/premium-vector/hiring-recruitment-concept-job-interview-recruitment-agency-vector-illustration_199064-479.jpg",
//   templateTitle:"Job Application",
//   templateDescription:"Collect candidate details, resumes, and job preferences with this professional application form.",
//   location:"jobapplication.html"
// },{
//    image:"https://th.bing.com/th/id/OIP.4hHn15nU7521ixcqrtQn9wHaH0?w=168&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
//   templateTitle:"Appointment Form",
//   templateDescription:"Let users schedule meetings, consultations, or services with this booking form.",
//   location:"appointment.html"
// },{
//    image:"https://images.unsplash.com/photo-1620302044670-f4a8ba5fe4d8",
//   templateTitle:"Newsletter Signup",
//   templateDescription:"Grow your mailing list and keep users updated with this simple subscription form.",
//   location:"newsletter.html"
// },{
//    image:"https://img.freepik.com/free-vector/wedding-rsvp-card_23-2147968695.jpg",
//   templateTitle:"RSVP Form",
//   templateDescription:"Let guests confirm their attendance for your events with this elegant RSVP form.",
//   location:"rsvp.html"
// },
// {
//   image:"https://plus.unsplash.com/premium_photo-1683134050449-080429c850a4",
//   templateTitle:"Donation Form",
//   templateBadge:"Featured",
//   templateDescription:"Collect donations securely from your supporters with this payment-ready form.",
//   location:"donation.html"
// }

// ];

// let html=``;

// templates.forEach((template)=>{
//   html+=`<div class="template-card">
//                 <div class="template-image">
//                     <img src="${template.image}" alt="${template.templateTitle}">
//                    ${
//   template.templateBadge ? `<span class="template-badge">${template.templateBadge}</span>` : ''
// }

                    
//                 </div>
//                 <div class="template-content">
//                     <h3 class="template-title">${template.templateTitle}</h3>
//                     <p class="template-description">${template.templateDescription}</p>
//                     <button class="use-template-btn" onclick="window.location.href='./templates/${template.location}'">
//                         <i class="fas fa-plus"></i> Use Template
//                     </button>
//                 </div>
//             </div>`
// });


// document.querySelector(".templates-grid").innerHTML=html;






document.addEventListener('DOMContentLoaded', async () => {
    // First render the local templates
    renderLocalTemplates();
    
    // Then try to load from server if user is admin
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'admin') {
            const response = await fetch('http://localhost:5000/api/admin/templates', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const { data: templates } = await response.json();
                renderServerTemplates(templates);
            }
        }
    } catch (error) {
        console.log('Could not load admin templates:', error.message);
    }
});

function renderLocalTemplates() {
    let html = '';
    templates.forEach((template) => {
        html += `<div class="template-card">
            <div class="template-image">
                <img src="${template.templateImage || 'https://placehold.co/300x200?text=Form+Template'}" alt="${template.title}">
                ${template.templateBadge ? `<span class="template-badge">${template.templateBadge}</span>` : ''}
            </div>
            <div class="template-content">
                <h3 class="template-title">${template.title}</h3>
                <p class="template-description">${template.description}</p>
                 <button class="use-template-btn" data-id="${template._id}">
          <i class="fas fa-plus"></i> Use Template
        </button>
            </div>
        </div>`;
    });
    document.querySelector(".templates-grid").innerHTML = html;
}

function renderServerTemplates(templates) {
    let html = '';
    templates.forEach(template => {
        html += `<div class="template-card">
            <div class="template-image">
                <img src="${template.templateImage || 'https://via.placeholder.com/300x200?text=Form+Template'}" alt="${template.title}">
            </div>
            <div class="template-content">
                <h3>${template.title}</h3>
                <p>${template.description || 'No description available'}</p>
                <div class="template-footer">
                    <span class="template-category">${template.templateCategory}</span>
                    <button class="use-template-btn" onclick="useTemplate('${template._id}')">
                        <i class="fas fa-plus"></i> Use Template
                    </button>
                </div>
            </div>
        </div>`;
    });
    document.querySelector(".templates-grid").innerHTML += html;
}

async function useTemplate(templateId) {
    try {
        const response = await fetch(`http://localhost:5000/api/templates/${templateId}/create-form`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to create form from template');
        
        const { data: form } = await response.json();
        window.location.href = `formEditor.html?id=${form._id}`;
    } catch (error) {
        console.error('Error using template:', error);
        alert('Error creating form from template: ' + error.message);
    }
} 