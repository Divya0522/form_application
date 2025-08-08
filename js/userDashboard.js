

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'signin.html'; 
        return;
    }

    document.getElementById('username-display').textContent = user.fullName || 'User';
    
    // Load user forms
    await loadUserForms();

    document.getElementById('createForm').addEventListener('click', showCreateFormModal);
    document.getElementById('createFormEmpty').addEventListener('click', showCreateFormModal);



     document.getElementById('profileMenuBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('profileDropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
   document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-profile')) {
        document.getElementById('profileDropdown').style.display = 'none';
    }
});

    // Logout functionality
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'signin.html';
    });

    // Edit profile functionality
    document.getElementById('editProfile').addEventListener('click', (e) => {
        e.preventDefault();
        showEditProfileModal(user);
    });
});


function renderForms(forms) {
    const formsGrid = document.getElementById('formsGrid');
    const noFormsMessage = document.getElementById('noFormsMessage');
    
    if (!forms || forms.length === 0) {
        noFormsMessage.style.display = 'flex';
        formsGrid.innerHTML = '';
        return;
    }
    
    noFormsMessage.style.display = 'none';
    formsGrid.innerHTML = '';
  
    forms.forEach(form => {
        let imageHTML = '';
        if (form.templateImage) {
            imageHTML = `
                <div class="form-image">
                    <img src="${form.templateImage}" alt="${form.title}">
                </div>
            `;
        } else {
            imageHTML = `
                <div class="form-image no-image">
                    <i class="fas fa-file-alt"></i>
                </div>
            `;
        }

        const formCard = document.createElement('div');
        formCard.className = 'form-card';
        formCard.innerHTML = `
            ${imageHTML}
            <div class="form-content">
                <h3>${form.title}</h3>
                <p>${form.description || 'No description'}</p>
                <div class="form-footer">
                    <span>${form.responseCount || 0} responses</span>
                    <div class="form-actions">
                        <button class="action-btn edit-form" data-id="${form._id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-form" data-id="${form._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        formsGrid.appendChild(formCard);
        
        // Add event listeners
        formCard.querySelector('.edit-form').addEventListener('click', () => {
            window.location.href = `formEditor.html?id=${form._id}`;
        });
        
        formCard.querySelector('.delete-form').addEventListener('click', async () => {
            if (confirm(`Delete "${form.title}"?`)) {
                try {
                    const response = await fetch(`http://localhost:5000/api/forms/${form._id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    
                    if (response.ok) {
                        formCard.remove();
                    }
                } catch (error) {
                    alert('Error deleting form: ' + error.message);
                }
            }
        });
    });
}


function showEditProfileModal(user) {
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.getElementById('editFullName').value = user.fullName || '';
    document.getElementById('editEmail').value = user.email || '';
    
    document.querySelector('#editProfileModal .close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.getElementById('cancelEdit').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedUser = {
            fullName: document.getElementById('editFullName').value,
            email: document.getElementById('editEmail').value,
            password: document.getElementById('editPassword').value || undefined
        };
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedUser)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Update failed');
            }
            
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            document.getElementById('username-display').textContent = data.user.fullName;
            modal.style.display = 'none';
        } catch (error) {
            console.error('Update error:', error);
            alert('Error updating profile: ' + error.message);
        }
    });
}



async function createFormFromTemplate(templateId) {
    try {
        const response = await fetch(`http://localhost:5000/api/forms/create-from-template/${templateId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to create form from template');
        
        const { data } = await response.json();
        window.location.href = `formEditor.html?id=${data._id}`;
    } catch (error) {
        console.error('Error creating form from template:', error);
        alert('Error creating form: ' + error.message);
    }
}


async function loadUserForms() {
    try {
        const response = await fetch('http://localhost:5000/api/forms', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load forms');
        }
        
        // Remove destructuring - API returns array directly
        const forms = await response.json(); 
        renderForms(forms);
    } catch (error) {
        console.error('Error loading forms:', error);
        const formsGrid = document.getElementById('formsGrid');
        if (formsGrid) {
            formsGrid.innerHTML = `<div class="error-message">Error loading forms: ${error.message}</div>`;
        }
    }
}

function showCreateFormModal() {
    const modal = document.getElementById('createFormModal');
    if (!modal) return;
    
    modal.style.display = 'block';
    document.getElementById('formTitle').value = '';
    document.getElementById('formDescription').value = '';

    document.querySelector('#createFormModal .close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.getElementById('cancelCreateForm').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.getElementById('createFormForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('formTitle').value,
            description: document.getElementById('formDescription').value
        };
        
        try {
            const response = await fetch('http://localhost:5000/api/forms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to create form');
            }
            
            modal.style.display = 'none';
            // Reload forms after creation
            await loadUserForms();
        } catch (error) {
            alert('Error creating form: ' + error.message);
        }
    });
}
