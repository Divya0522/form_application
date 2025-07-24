document.addEventListener('DOMContentLoaded', () => {

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'signin.html'; 
        return;
    }

    document.getElementById('username-display').textContent = user.fullName || 'User';
    
  
    loadUserForms();

    document.getElementById('createForm').addEventListener('click', showCreateFormModal);
    document.getElementById('createFormEmpty').addEventListener('click', showCreateFormModal);


    document.querySelector('.profile-menu-btn').addEventListener('click', (e) => {
        e.stopPropagation();
         const existingDropdown = document.querySelector('.profile-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';
    dropdown.innerHTML = `
        <div class="dropdown-content">
            <a href="#" id="editProfile"><i class="fas fa-user-edit"></i> Edit Profile</a>
            <a href="#" id="logout"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
    `;
    
    document.querySelector('.user-profile').appendChild(dropdown);
        
        dropdown.querySelector('#logout').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'signin.html';
        });
    
        dropdown.querySelector('#editProfile').addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.remove();
            showEditProfileModal(user);
        });

        const closeHandler = (e) => {
            if (!e.target.closest('.user-profile')) {
                dropdown.remove();
                document.removeEventListener('click', closeHandler);
            }
        };
        
        document.addEventListener('click', closeHandler);
    });
});

function showEditProfileModal(user) {
    const modal = document.getElementById('editProfileModal');
    document.getElementById('editFullName').value = user.fullName || '';
    document.getElementById('editEmail').value = user.email || '';
    
     modal.classList.add('active');

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


async function loadUserForms() {
    try {
        const response = await fetch('http://localhost:5000/api/forms', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load forms');
        
        const { data: forms } = await response.json();
        
        // Clear existing forms before rendering
        document.getElementById('formsGrid').innerHTML = '';
        
        if (forms.length === 0) {
            document.getElementById('noFormsMessage').style.display = 'flex';
            return;
        }
        
        document.getElementById('noFormsMessage').style.display = 'none';
        
        
        
        renderForms(forms);
    } catch (error) {
        console.error('Error loading forms:', error);
        document.getElementById('formsGrid').innerHTML = `
            <div class="error-message">
                <p>Error loading forms: ${error.message}</p>
                <button onclick="loadUserForms()">Try Again</button>
            </div>
        `;
    }
}

// Update the renderForms function
function renderForms(forms) {
    const formsGrid = document.getElementById('formsGrid');
    formsGrid.innerHTML = '';
    
    forms.forEach(form => {
        
        const formCard = document.createElement('div');
        formCard.className = 'form-card';
        
        const createdDate = new Date(form.createdAt);
        const formattedDate = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        formCard.innerHTML = `
            <div class="form-card-header">
                <i class="fas fa-file-alt"></i>
                ${form.responseCount > 0 ? `<span class="response-badge">${form.responseCount}</span>` : ''}
            </div>
            <div class="form-card-body">
                <h3 class="form-card-title">${form.title || 'Untitled Form'}</h3>
                <p class="form-card-description">${form.description || 'No description provided'}</p>
                <div class="form-card-footer">
                    <span class="form-card-date">Created: ${formattedDate}</span>
                    <div class="form-card-actions">
                        <button class="action-btn edit-form" data-id="${form._id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn view-responses" data-id="${form._id}" title="Responses">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        formCard.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                window.location.href = `formEditor.html?id=${form._id}`;
            }
        });
        
        formCard.querySelector('.edit-form').addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `formEditor.html?id=${form._id}`;
        });
        
        formCard.querySelector('.view-responses').addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `responses.html?formId=${form._id}`;
        });
        
        formsGrid.appendChild(formCard);
    });
}


document.addEventListener('DOMContentLoaded', () => {

  loadUserForms();

  
  document.getElementById('createForm').addEventListener('click', () => {
    showCreateFormModal();
  });
});



function showCreateFormModal() {
    const modal = document.getElementById('createFormModal');
     modal.classList.add('active'); 

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
            
            if (!response.ok) throw new Error('Failed to create form');
            
            const { data } = await response.json();
            modal.style.display = 'none';
            loadUserForms();
            window.location.href = `formEditor.html?id=${data._id}`;
        } catch (error) {
            alert('Error creating form: ' + error.message);
        }
    });
}
