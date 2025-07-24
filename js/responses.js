document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'signin.html'; 
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('formId');
    
    if (!formId) {
        window.location.href = 'userDashboard.html';
        return;
    }

    // DOM elements
    const formTitle = document.getElementById('formTitle');
    const formDescription = document.getElementById('formDescription');
    const noResponsesMessage = document.getElementById('noResponsesMessage');
    const responsesContent = document.getElementById('responsesContent');
    const totalResponses = document.getElementById('totalResponses');
    const lastResponse = document.getElementById('lastResponse');
    const tableHeaders = document.getElementById('tableHeaders');
    const responsesBody = document.getElementById('responsesBody');
    const refreshBtn = document.getElementById('refreshResponses');
    const exportBtn = document.getElementById('exportResponses');

    let formData = null;
    let responsesData = [];

    // Initialize
    await loadFormData();
    await loadResponses();
    setupEventListeners();

    async function loadFormData() {
        try {
            const response = await fetch(`http://localhost:5000/api/forms/${formId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) throw new Error('Form not found');
            
            const { data } = await response.json();
            formData = data;
            
            formTitle.textContent = `${data.title} - Responses`;
            if (data.description) {
                formDescription.textContent = data.description;
            }
        } catch (error) {
            console.error('Error loading form:', error);
            alert('Error loading form: ' + error.message);
        }
    }

async function loadResponses() {
    try {
        const response = await fetch(`http://localhost:5000/api/responses/${formId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load responses');
        
        const { data: responses } = await response.json();
        responsesData = responses;
        
        if (responses.length === 0) {
            noResponsesMessage.style.display = 'flex';
            responsesContent.style.display = 'none';
            return;
        }
        
        noResponsesMessage.style.display = 'none';
        responsesContent.style.display = 'block';
        
        // Update summary
        totalResponses.textContent = responses.length;
        if (responses.length > 0) {
            const latest = new Date(responses[0].createdAt);
            lastResponse.textContent = latest.toLocaleString();
        }
        
        renderResponsesTable(responses);
    } catch (error) {
        console.error('Error loading responses:', error);
        alert('Error loading responses: ' + error.message);
    }
}

function renderResponsesTable(responses) {
    // Clear existing content
    tableHeaders.innerHTML = '<th>#</th><th>Submission Date</th>';
    responsesBody.innerHTML = '';
    
    // Create header columns for each field
    formData.fields.forEach(field => {
        const th = document.createElement('th');
        th.textContent = field.label;
        tableHeaders.appendChild(th);
    });
    
    // Add response rows
    responses.forEach((response, index) => {
        const tr = document.createElement('tr');
        
        // Add index and date cells
        const indexTd = document.createElement('td');
        indexTd.textContent = index + 1;
        tr.appendChild(indexTd);
        
        const dateTd = document.createElement('td');
        const date = new Date(response.createdAt);
        dateTd.textContent = date.toLocaleString();
        tr.appendChild(dateTd);
        
        // Add response data for each field
        formData.fields.forEach(field => {
            const td = document.createElement('td');
            const fieldResponse = response.responses.find(r => r.fieldId === field.id);
            
            if (fieldResponse) {
                // Handle array values (like from checkboxes)
                if (Array.isArray(fieldResponse.value)) {
                    td.textContent = fieldResponse.value.join(', ');
                } else {
                    td.textContent = fieldResponse.value;
                }
            } else {
                td.textContent = '-';
            }
            tr.appendChild(td);
        });
        
        responsesBody.appendChild(tr);
    });
}



    function setupEventListeners() {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing';
            await loadResponses();
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        });
        
        exportBtn.addEventListener('click', () => {
            exportToCSV();
        });
    }

   function exportToCSV() {
    if (responsesData.length === 0) {
        alert('No responses to export');
        return;
    }
    
    // Get all field IDs from the form definition
    const fieldIds = formData.fields.map(field => field.id);
    const fieldLabels = {};
    formData.fields.forEach(field => {
        fieldLabels[field.id] = field.label;
    });
    
    // Create headers
    const headers = ['#', 'Submission Date', ...fieldIds.map(id => fieldLabels[id] || id)];
    
    // Create rows
    const rows = responsesData.map((response, index) => {
        const date = new Date(response.createdAt);
        
        // Create a map of responses for easy lookup
        const responseMap = {};
        response.responses.forEach(item => {
            responseMap[item.fieldId] = item.value;
        });
        
        const row = [
            index + 1,
            date.toLocaleString(),
            ...fieldIds.map(fieldId => {
                const value = responseMap[fieldId];
                if (value !== undefined) {
                    return Array.isArray(value) ? 
                        `"${value.join(', ')}"` : 
                        (value || '-');
                }
                return '-';
            })
        ];
        return row.join(',');
    });
    
    // Combine into CSV
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${formData.title}_responses_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
});