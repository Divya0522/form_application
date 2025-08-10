// // js/responses.js

// document.addEventListener('DOMContentLoaded', async () => {
//     const user = JSON.parse(localStorage.getItem('user'));
//     if (!user) {
//         window.location.href = 'signin.html';
//         return;
//     }
    
//     document.getElementById('username-display').textContent = user.fullName || 'User';

//     document.getElementById('profileMenuBtn').addEventListener('click', function (e) {
//         e.stopPropagation();
//         const dropdown = document.getElementById('profileDropdown');
//         dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
//     });

//     document.addEventListener('click', (e) => {
//         if (!e.target.closest('.user-profile')) {
//             document.getElementById('profileDropdown').style.display = 'none';
//         }
//     });

//     document.getElementById('logout').addEventListener('click', (e) => {
//         e.preventDefault();
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = 'signin.html';
//     });
    
//     document.getElementById('editProfile').addEventListener('click', (e) => {
//         e.preventDefault();
//         // Placeholder for edit profile functionality
//         alert('Edit profile functionality is not yet implemented.');
//     });

//     const urlParams = new URLSearchParams(window.location.search);
//     const initialFormId = urlParams.get('formId');
    
//     // DOM elements
//     const pageTitle = document.getElementById('pageTitle');
//     const formsListContainer = document.getElementById('formsListContainer');
//     const formsList = document.getElementById('formsList');
//     const responsesContent = document.getElementById('responsesContent');
//     const totalResponsesEl = document.getElementById('totalResponses');
//     const lastResponseEl = document.getElementById('lastResponse');
//     const tableHeaders = document.getElementById('tableHeaders');
//     const responsesBody = document.getElementById('responsesBody');
//     const exportBtn = document.getElementById('exportResponses');

//     let allForms = [];
//     let currentForm = null;

//     await loadUserFormsList();

//     if (initialFormId) {
//         const form = allForms.find(f => f._id === initialFormId);
//         if (form) {
//             await loadResponsesForForm(form);
//         } else {
//             pageTitle.textContent = 'Form Not Found';
//             formsListContainer.style.display = 'block';
//             responsesContent.style.display = 'none';
//         }
//     } else {
//         formsListContainer.style.display = 'block';
//         responsesContent.style.display = 'none';
//     }

//     exportBtn.addEventListener('click', exportToCSV);

//     async function loadUserFormsList() {
//         try {
//             const response = await fetch('http://localhost:5000/api/forms', {
//                 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//             });
//             if (!response.ok) throw new Error('Failed to load forms');
            
//             allForms = await response.json();
//             renderFormsList(allForms);
//         } catch (error) {
//             console.error('Error loading forms:', error);
//             formsList.innerHTML = `<div class="empty-state">
//                 <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Forms">
//                 <h2>Error Loading Forms</h2>
//                 <p>Failed to load your forms. Please try again later.</p>
//             </div>`;
//         }
//     }

//     function renderFormsList(forms) {
//         formsList.innerHTML = '';
//         if (forms.length === 0) {
//             formsList.innerHTML = `<div class="empty-state">
//                 <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Forms">
//                 <h2>No Forms Yet</h2>
//                 <p>Create a form to start collecting responses.</p>
//             </div>`;
//         } else {
//             forms.forEach(form => {
//                 const card = document.createElement('div');
//                 card.className = 'form-card';
//                 card.innerHTML = `
//                     <div class="form-card-header">
//                         <i class="fas fa-file-alt"></i>
//                     </div>
//                     <div class="form-card-body">
//                         <h3 class="form-card-title">${form.title}</h3>
//                         <p class="form-card-description">${form.description || 'No description'}</p>
//                     </div>
//                     <div class="form-card-footer">
//                         <span><i class="fas fa-chart-bar"></i> ${form.responseCount || 0} responses</span>
//                     </div>
//                 `;
//                 card.addEventListener('click', () => loadResponsesForForm(form));
//                 formsList.appendChild(card);
//             });
//         }
//     }

//     async function loadResponsesForForm(form) {
//         currentForm = form;
//         pageTitle.textContent = `${form.title} Responses`;
//         formsListContainer.style.display = 'none';
//         responsesContent.style.display = 'block';
//         exportBtn.style.display = 'inline-flex';
        
//         try {
//             const response = await fetch(`http://localhost:5000/api/responses/${form._id}`, {
//                 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//             });
            
//             if (!response.ok) throw new Error('Failed to load responses');
            
//             const { data: responses, formFields, count } = await response.json();
            
//             totalResponsesEl.textContent = count;
//             if (responses.length > 0) {
//                 lastResponseEl.textContent = new Date(responses[0].createdAt).toLocaleString();
//             } else {
//                 lastResponseEl.textContent = '-';
//             }
            
//             renderResponsesTable(responses, formFields);
//         } catch (error) {
//             console.error('Error loading responses:', error);
//             responsesBody.innerHTML = `<tr><td colspan="100%">Error loading responses: ${error.message}</td></tr>`;
//         }
//     }

//     function renderResponsesTable(responses, formFields) {
//         tableHeaders.innerHTML = `<th>#</th><th>Submission Date</th>` +
//                                 formFields.map(field => `<th>${field.label}</th>`).join('');
//         responsesBody.innerHTML = '';
        
//         if (responses.length === 0) {
//             responsesBody.innerHTML = `<tr><td colspan="${formFields.length + 2}" style="text-align: center;">No responses yet.</td></tr>`;
//             return;
//         }

//         responses.forEach((response, index) => {
//             const tr = document.createElement('tr');
//             tr.innerHTML = `<td>${index + 1}</td><td>${new Date(response.createdAt).toLocaleString()}</td>` +
//                            formFields.map(field => {
//                                const fieldResponse = response.responses.find(r => r.fieldId === field.id);
//                                const value = fieldResponse ? fieldResponse.value : '-';
//                                const displayValue = Array.isArray(value) ? value.join(', ') : value;
//                                return `<td>${displayValue}</td>`;
//                            }).join('');
//             responsesBody.appendChild(tr);
//         });
//     }

//     function exportToCSV() {
//         if (!currentForm || !responsesData || responsesData.length === 0 || !responsesBody.children.length) {
//             alert('No data to export.');
//             return;
//         }

//         const table = document.getElementById('responsesTable');
//         const rows = table.querySelectorAll('tr');
//         let csvContent = "data:text/csv;charset=utf-8,";
        
//         rows.forEach(row => {
//             const rowData = Array.from(row.querySelectorAll('th, td')).map(cell => `"${cell.textContent.trim().replace(/"/g, '""')}"`);
//             csvContent += rowData.join(',') + "\n";
//         });

//         const encodedUri = encodeURI(csvContent);
//         const link = document.createElement("a");
//         link.setAttribute("href", encodedUri);
//         link.setAttribute("download", `${currentForm.title}_responses.csv`);
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     }

//     // Set up initial active nav item based on URL
//     const navItems = document.querySelectorAll('.nav-item');
//     navItems.forEach(item => {
//         if (item.href.includes(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1))) {
//             item.classList.add('active');
//         } else {
//             item.classList.remove('active');
//         }
//     });

// });


// js/responses.js

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }
    
    document.getElementById('username-display').textContent = user.fullName || 'User';

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
        // Placeholder for edit profile functionality
        alert('Edit profile functionality is not yet implemented.');
    });

    const urlParams = new URLSearchParams(window.location.search);
    const initialFormId = urlParams.get('formId');
    
    // DOM elements
    const pageTitle = document.getElementById('pageTitle');
    const formsListContainer = document.getElementById('formsListContainer');
    const formsList = document.getElementById('formsList');
    const responsesContent = document.getElementById('responsesContent');
    const totalResponsesEl = document.getElementById('totalResponses');
    const lastResponseEl = document.getElementById('lastResponse');
    const tableHeaders = document.getElementById('tableHeaders');
    const responsesBody = document.getElementById('responsesBody');
    const exportBtn = document.getElementById('exportResponses');

    let allForms = [];
    let currentForm = null;
    let currentResponses = []; // Store loaded responses
    let currentFormFields = []; // Store form fields

    await loadUserFormsList();

    if (initialFormId) {
        const form = allForms.find(f => f._id === initialFormId);
        if (form) {
            await loadResponsesForForm(form);
        } else {
            pageTitle.textContent = 'Form Not Found';
            formsListContainer.style.display = 'block';
            responsesContent.style.display = 'none';
        }
    } else {
        formsListContainer.style.display = 'block';
        responsesContent.style.display = 'none';
    }

    exportBtn.addEventListener('click', exportToCSV);

    async function loadUserFormsList() {
        try {
            const response = await fetch('http://localhost:5000/api/forms', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error('Failed to load forms');
            
            allForms = await response.json();
            renderFormsList(allForms);
        } catch (error) {
            console.error('Error loading forms:', error);
            formsList.innerHTML = `<div class="empty-state">
                <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Forms">
                <h2>Error Loading Forms</h2>
                <p>Failed to load your forms. Please try again later.</p>
            </div>`;
        }
    }

    function renderFormsList(forms) {
        formsList.innerHTML = '';
        if (forms.length === 0) {
            formsList.innerHTML = `<div class="empty-state">
                <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No Forms">
                <h2>No Forms Yet</h2>
                <p>Create a form to start collecting responses.</p>
            </div>`;
        } else {
            forms.forEach(form => {
                const card = document.createElement('div');
                card.className = 'form-card';
                card.innerHTML = `
                    <div class="form-card-header">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="form-card-body">
                        <h3 class="form-card-title">${form.title}</h3>
                        <p class="form-card-description">${form.description || 'No description'}</p>
                    </div>
                    <div class="form-card-footer">
                        <span><i class="fas fa-chart-bar"></i> ${form.responseCount || 0} responses</span>
                    </div>
                `;
                card.addEventListener('click', () => loadResponsesForForm(form));
                formsList.appendChild(card);
            });
        }
    }

    async function loadResponsesForForm(form) {
        currentForm = form;
        pageTitle.textContent = `${form.title} Responses`;
        formsListContainer.style.display = 'none';
        responsesContent.style.display = 'block';
        exportBtn.style.display = 'inline-flex';
        
        try {
            const response = await fetch(`http://localhost:5000/api/responses/${form._id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (!response.ok) throw new Error('Failed to load responses');
            
            const { data: responses, formFields, count } = await response.json();
            
            // Store responses and fields for CSV export
            currentResponses = responses;
            currentFormFields = formFields;
            
            totalResponsesEl.textContent = count;
            if (responses.length > 0) {
                lastResponseEl.textContent = new Date(responses[0].createdAt).toLocaleString();
            } else {
                lastResponseEl.textContent = '-';
            }
            
            renderResponsesTable(responses, formFields);
        } catch (error) {
            console.error('Error loading responses:', error);
            responsesBody.innerHTML = `<tr><td colspan="100%">Error loading responses: ${error.message}</td></tr>`;
        }
    }

    function renderResponsesTable(responses, formFields) {
        tableHeaders.innerHTML = `<th>#</th><th>Submission Date</th>` +
                            formFields.map(field => `<th>${field.label}</th>`).join('');
        responsesBody.innerHTML = '';
        
        if (responses.length === 0) {
            responsesBody.innerHTML = `<tr><td colspan="${formFields.length + 2}" style="text-align: center;">No responses yet.</td></tr>`;
            return;
        }

        responses.forEach((response, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${index + 1}</td><td>${new Date(response.createdAt).toLocaleString()}</td>` +
                          formFields.map(field => {
                              const fieldResponse = response.responses.find(r => r.fieldId === field.id);
                              const value = fieldResponse ? fieldResponse.value : '-';
                              const displayValue = Array.isArray(value) ? value.join(', ') : value;
                              return `<td>${displayValue}</td>`;
                          }).join('');
            responsesBody.appendChild(tr);
        });
    }

    function exportToCSV() {
        if (!currentForm || currentResponses.length === 0) {
            alert('No data to export.');
            return;
        }

        // Create CSV header
        const headers = ['#', 'Submission Date', ...currentFormFields.map(field => field.label)];
        let csvContent = headers.map(header => 
            `"${header.replace(/"/g, '""')}"`
        ).join(',') + '\n';

        // Add response rows
        currentResponses.forEach((response, index) => {
            const rowData = [
                index + 1,
                new Date(response.createdAt).toLocaleString(),
                ...currentFormFields.map(field => {
                    const fieldResponse = response.responses.find(r => r.fieldId === field.id);
                    let value = fieldResponse ? fieldResponse.value : '';
                    
                    // Handle array values (like checkboxes)
                    if (Array.isArray(value)) {
                        value = value.join(', ');
                    }
                    
                    // Escape double quotes and wrap in quotes
                    return `"${String(value).replace(/"/g, '""')}"`;
                })
            ];
            csvContent += rowData.join(',') + '\n';
        });

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${currentForm.title.replace(/\s+/g, '_')}_responses.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Set up initial active nav item based on URL
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.href.includes(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});