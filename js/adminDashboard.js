document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user || user.role !== 'admin') {
        window.location.href = 'signin.html';
        return;
    }
    
    // Display admin name
    document.getElementById('adminName').textContent = user.fullName;
    
    // Logout functionality
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'signin.html';
    });

     await loadTemplates();
    
    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Here you would load the appropriate content based on the clicked nav item
            const section = item.getAttribute('href').substring(1);
            loadSectionContent(section);
        });
    });
    
    // Load dashboard data
    try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        
        const { data } = await response.json();
        
        // Update dashboard stats
        document.getElementById('totalUsers').textContent = data.userCount;
        document.getElementById('totalForms').textContent = data.formCount;
        document.getElementById('publishedForms').textContent = data.publishedForms;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Failed to load dashboard data');
    }
     document.getElementById('addTemplateBtn').addEventListener('click', showTemplateModal);
    document.querySelector('#templateModal .close-modal').addEventListener('click', hideTemplateModal);
    document.getElementById('cancelTemplate').addEventListener('click', hideTemplateModal);
    document.getElementById('templateForm').addEventListener('submit', handleTemplateSubmit);
});

async function loadTemplates() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/templates', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load templates');
        
        const { data: templates } = await response.json();
        renderTemplates(templates);
    } catch (error) {
        console.error('Error loading templates:', error);
        document.getElementById('templatesGrid').innerHTML = `
            <div class="error-message">
                <p>Failed to load templates: ${error.message}</p>
                <button onclick="loadTemplates()">Try Again</button>
            </div>
        `;
    }
}


function renderTemplates(templates) {
    const templatesGrid = document.getElementById('templatesGrid');
    templatesGrid.innerHTML = '';
    
    templates.forEach(template => {
        const templateCard = document.createElement('div');
        templateCard.className = 'template-card';
        
        templateCard.innerHTML = `
            <div class="template-image">
                <img src="${template.templateImage || 'https://via.placeholder.com/300x200?text=Form+Template'}" alt="${template.title}">
            </div>
            <div class="template-content">
                <h3>${template.title}</h3>
                <p>${template.description || 'No description'}</p>
                <div class="template-footer">
                    <span class="template-category">${template.templateCategory}</span>
                    <div class="template-actions">
                        <button class="action-btn preview-template" data-id="${template._id}">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <button class="action-btn delete-template" data-id="${template._id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        templateCard.querySelector('.preview-template').addEventListener('click', () => {
            window.open(`formEditor.html?template=${template._id}`, '_blank');
        });
        
        templateCard.querySelector('.delete-template').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${template.title}" template?`)) {
                try {
                    const response = await fetch(`http://localhost:5000/api/admin/templates/${template._id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    
                    if (response.ok) {
                        templateCard.remove();
                    } else {
                        throw new Error('Failed to delete template');
                    }
                } catch (error) {
                    console.error('Error deleting template:', error);
                    alert('Error deleting template: ' + error.message);
                }
            }
        });
        
        templatesGrid.appendChild(templateCard);
    });
}

function showTemplateModal() {
    document.getElementById('templateModal').classList.add('active');
}

function hideTemplateModal() {
    document.getElementById('templateModal').classList.remove('active');
}

async function handleTemplateSubmit(e) {
    e.preventDefault();
    
    const templateData = {
        title: document.getElementById('templateTitle').value,
        description: document.getElementById('templateDescription').value,
        templateCategory: document.getElementById('templateCategory').value,
        templateImage: document.getElementById('templateImage').value,
        isTemplate: true
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/admin/templates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(templateData)
        });
        
        if (!response.ok) throw new Error('Failed to create template');
        
        const { data: template } = await response.json();
        hideTemplateModal();
        loadTemplates();
        
        // Open the template in editor
        window.open(`formEditor.html?template=${template._id}`, '_blank');
    } catch (error) {
        console.error('Error creating template:', error);
        alert('Error creating template: ' + error.message);
    }
}