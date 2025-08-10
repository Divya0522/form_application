// js/userDashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }

    document.getElementById('username-display').textContent = user.fullName || 'User';

    await loadUserForms();

    document.getElementById('createForm').addEventListener('click', () => showModal('createFormModal'));
    document.getElementById('createFormEmpty').addEventListener('click', () => showModal('createFormModal'));

    document.getElementById('profileMenuBtn').addEventListener('click', function (e) {
        e.stopPropagation();
        const dropdown = document.getElementById('profileDropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-profile')) {
            document.getElementById('profileDropdown').style.display = 'none';
        }
    });

    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'signin.html';
    });

    document.getElementById('editProfile').addEventListener('click', (e) => {
        e.preventDefault();
        showEditProfileModal(user);
    });

    document.querySelector('#createFormModal .close-modal').addEventListener('click', () => hideModal('createFormModal'));
    document.getElementById('cancelCreateForm').addEventListener('click', () => hideModal('createFormModal'));

    document.getElementById('createFormForm').addEventListener('submit', handleCreateForm);
});

function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showEditProfileModal(user) {
    showModal('editProfileModal');
    document.getElementById('editFullName').value = user.fullName || '';
    document.getElementById('editEmail').value = user.email || '';

    const closeBtn = document.querySelector('#editProfileModal .close-modal');
    if(closeBtn) closeBtn.onclick = () => hideModal('editProfileModal');
    
    const cancelBtn = document.getElementById('cancelEdit');
    if(cancelBtn) cancelBtn.onclick = () => hideModal('editProfileModal');
    
    const form = document.getElementById('editProfileForm');
    form.onsubmit = handleEditProfile;
}

async function handleEditProfile(e) {
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
        hideModal('editProfileModal');
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Update error:', error);
        alert('Error updating profile: ' + error.message);
    }
}

async function handleCreateForm(e) {
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

        hideModal('createFormModal');
        window.location.href = `formEditor.html?id=${result.data._id}`;
    } catch (error) {
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

        const forms = await response.json();
        renderForms(forms);
    } catch (error) {
        console.error('Error loading forms:', error);
        const formsGrid = document.getElementById('formsGrid');
        if (formsGrid) {
            formsGrid.innerHTML = `<div class="empty-state">
                <img src="https://cdn4.iconfinder.com/data/icons/document-31/200/374-1024.png" alt="Error">
                <h2>Error Loading Forms</h2>
                <p>Failed to load your forms. Please try again later.</p>
            </div>`;
        }
    }
}

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
        const imageHTML = form.templateImage ?
            `<div class="form-image"><img src="${form.templateImage}" alt="${form.title}"></div>` :
            `<div class="form-image no-image"><i class="fas fa-file-alt"></i></div>`;

        const formCard = document.createElement('div');
        formCard.className = 'form-card';
        formCard.innerHTML = `
            ${imageHTML}
            <div class="form-content">
                <h3>${form.title}</h3>
                <p>${form.description || 'No description'}</p>
                <div class="form-footer">
                    <span class="response-count-link" data-id="${form._id}">
                        <i class="fas fa-chart-bar"></i> ${form.responseCount || 0} responses
                    </span>
                    <div class="form-actions">
                        <button class="action-btn edit-form" data-id="${form._id}" title="Edit Form">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-form" data-id="${form._id}" title="Delete Form">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        formsGrid.appendChild(formCard);

        formCard.querySelector('.edit-form').addEventListener('click', () => {
            window.location.href = `formEditor.html?id=${form._id}`;
        });
        
        formCard.querySelector('.response-count-link').addEventListener('click', () => {
            window.location.href = `responses.html?formId=${form._id}`;
        });

        formCard.querySelector('.delete-form').addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete "${form.title}"? This action cannot be undone.`)) {
                try {
                    const response = await fetch(`http://localhost:5000/api/forms/${form._id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (response.ok) {
                        formCard.remove();
                        await loadUserForms();
                    } else {
                        alert('Error deleting form.');
                    }
                } catch (error) {
                    alert('Error deleting form: ' + error.message);
                }
            }
        });
    });
}