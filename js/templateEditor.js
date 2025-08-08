document.addEventListener('DOMContentLoaded', () => {
    // Check if we're editing an existing template
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    const formPreview = document.getElementById('formPreview');
    const propertiesForm = document.getElementById('propertiesForm');
    const templateTitle = document.getElementById('templateTitle');
    const previewTitle = document.getElementById('previewTitle');
    const saveBtn = document.getElementById('saveTemplate');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    const closeBtn = document.getElementById('closeEditor');
    
    // Store form elements and state
    let formElements = [];
    let selectedElement = null;
    let undoStack = [];
    let redoStack = [];
    
    // Initialize the editor
    initEditor();
    
    // Load template if editing
    if (templateId) {
        loadTemplate(templateId);
    }
    
    // Initialize drag and drop
    initDragAndDrop();
    
    // Event listeners
    templateTitle.addEventListener('input', () => {
        previewTitle.textContent = templateTitle.value || 'Template Preview';
    });
    
    saveBtn.addEventListener('click', saveTemplate);
    undoBtn.addEventListener('click', undoAction);
    redoBtn.addEventListener('click', redoAction);
    closeBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to close without saving?')) {
            window.close();
        }
    });
    
    // Initialize editor
    function initEditor() {
        // Add default empty state
        formPreview.innerHTML = `
            <div class="empty-preview">
                <i class="fas fa-drafting-compass"></i>
                <h3>Your template is empty</h3>
                <p>Drag elements from the left panel to start building</p>
            </div>
        `;
        
        // Initialize undo/redo stacks
        saveState();
    }
    
    // Initialize drag and drop functionality
    function initDragAndDrop() {
        const elements = document.querySelectorAll('.element-item');
        
        elements.forEach(element => {
            element.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', element.dataset.type);
            });
        });
        
        formPreview.addEventListener('dragover', (e) => {
            e.preventDefault();
            formPreview.classList.add('drag-over');
        });
        
        formPreview.addEventListener('dragleave', () => {
            formPreview.classList.remove('drag-over');
        });
        
        formPreview.addEventListener('drop', (e) => {
            e.preventDefault();
            formPreview.classList.remove('drag-over');
            
            const elementType = e.dataTransfer.getData('text/plain');
            addElement(elementType);
        });
    }
    
    // Add a new element to the form
    function addElement(type) {
        const elementId = `element-${Date.now()}`;
        const newElement = {
            id: elementId,
            type: type,
            label: getDefaultLabel(type),
            required: false,
            options: type === 'dropdown' || type === 'radio' || type === 'checkbox' 
                ? ['Option 1', 'Option 2'] 
                : [],
            placeholder: '',
            description: ''
        };
        
        formElements.push(newElement);
        renderFormElements();
        selectElement(newElement);
        saveState();
    }
    
    // Get default label based on element type
    function getDefaultLabel(type) {
        const labels = {
            text: 'Text Input',
            email: 'Email Address',
            number: 'Number Input',
            date: 'Select Date',
            dropdown: 'Select Option',
            checkbox: 'Checkbox Group',
            radio: 'Radio Buttons',
            textarea: 'Long Text',
            section: 'Section Header'
        };
        
        return labels[type] || 'Untitled Field';
    }
    
    // Render all form elements
    function renderFormElements() {
        if (formElements.length === 0) {
            formPreview.innerHTML = `
                <div class="empty-preview">
                    <i class="fas fa-drafting-compass"></i>
                    <h3>Your template is empty</h3>
                    <p>Drag elements from the left panel to start building</p>
                </div>
            `;
            return;
        }
        
        formPreview.innerHTML = '';
        
        formElements.forEach((element, index) => {
            const elementDiv = document.createElement('div');
            elementDiv.className = `form-element ${selectedElement?.id === element.id ? 'selected' : ''}`;
            elementDiv.dataset.id = element.id;
            
            // Header with title and actions
            elementDiv.innerHTML = `
                <div class="element-header">
                    <div class="element-title">${element.label}</div>
                    <div class="element-actions">
                        <button class="element-action move-up" title="Move Up">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="element-action move-down" title="Move Down">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button class="element-action delete-element" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="element-content">
                    ${renderElementContent(element)}
                </div>
            `;
            
            formPreview.appendChild(elementDiv);
            
            // Add event listeners
            elementDiv.querySelector('.move-up').addEventListener('click', () => moveElement(index, 'up'));
            elementDiv.querySelector('.move-down').addEventListener('click', () => moveElement(index, 'down'));
            elementDiv.querySelector('.delete-element').addEventListener('click', () => deleteElement(element.id));
            elementDiv.addEventListener('click', (e) => {
                if (!e.target.closest('.element-action')) {
                    selectElement(element);
                }
            });
        });
    }
    
    // Render element content based on type
    function renderElementContent(element) {
        switch (element.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'date':
                return `
                    <div class="form-group">
                        <input type="${element.type}" class="form-input" placeholder="${element.placeholder || ''}" disabled>
                    </div>
                    ${element.description ? `<p class="element-description">${element.description}</p>` : ''}
                `;
                
            case 'textarea':
                return `
                    <div class="form-group">
                        <textarea class="form-input form-textarea" placeholder="${element.placeholder || ''}" disabled></textarea>
                    </div>
                    ${element.description ? `<p class="element-description">${element.description}</p>` : ''}
                `;
                
            case 'dropdown':
                return `
                    <div class="form-group">
                        <select class="form-input" disabled>
                            ${element.options.map(opt => `<option>${opt}</option>`).join('')}
                        </select>
                    </div>
                    ${element.description ? `<p class="element-description">${element.description}</p>` : ''}
                `;
            
                
            case 'checkbox':
            case 'radio':
                return `
                    <div class="form-group">
                        ${element.options.map(opt => `
                            <div class="form-check">
                                <input type="${element.type}" id="${element.id}-${opt}" disabled>
                                <label for="${element.id}-${opt}">${opt}</label>
                            </div>
                        `).join('')}
                    </div>
                    ${element.description ? `<p class="element-description">${element.description}</p>` : ''}
                `;
             
                
            case 'section':
                return `
                    <div class="section-content">
                        <h3>${element.label}</h3>
                        ${element.description ? `<p>${element.description}</p>` : ''}
                    </div>
                `;
                break;
                
            default:
                return `<p>Unsupported element type</p>`;
        }
    }
    
    // Move element up/down
    function moveElement(index, direction) {
        if ((direction === 'up' && index === 0) || 
            (direction === 'down' && index === formElements.length - 1)) {
            return;
        }
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [formElements[index], formElements[newIndex]] = [formElements[newIndex], formElements[index]];
        renderFormElements();
        saveState();
    }
    
    // Delete element
    function deleteElement(elementId) {
        formElements = formElements.filter(el => el.id !== elementId);
        
        if (selectedElement?.id === elementId) {
            selectedElement = null;
            renderPropertiesPanel();
        }
        
        renderFormElements();
        saveState();
    }
    
    // Select an element
    function selectElement(element) {
        selectedElement = element;
        renderFormElements();
        renderPropertiesPanel();
    }
    
    // Render properties panel
    function renderPropertiesPanel() {
        if (!selectedElement) {
            propertiesForm.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Select an element to edit its properties</p>
                </div>
            `;
            return;
        }
        
        propertiesForm.innerHTML = `
            <div class="property-group">
                <h4>General Settings</h4>
                
                <div class="property-item">
                    <label>Label</label>
                    <input type="text" id="prop-label" value="${selectedElement.label}">
                </div>
                
                ${selectedElement.type !== 'section' ? `
                <div class="property-item">
                    <label>Placeholder</label>
                    <input type="text" id="prop-placeholder" value="${selectedElement.placeholder || ''}">
                </div>
                ` : ''}
                
                <div class="property-item">
                    <label>Description</label>
                    <textarea id="prop-description">${selectedElement.description || ''}</textarea>
                </div>
                
                ${selectedElement.type !== 'section' ? `
                <div class="property-item">
                    <label>
                        <input type="checkbox" id="prop-required" ${selectedElement.required ? 'checked' : ''}>
                        Required Field
                    </label>
                </div>
                ` : ''}
            </div>
            
            ${['dropdown', 'radio', 'checkbox'].includes(selectedElement.type) ? `
            <div class="property-group">
                <h4>Options</h4>
                <div class="options-list" id="options-list">
                    ${selectedElement.options.map((option, idx) => `
                        <div class="option-item">
                            <input type="text" value="${option}" data-index="${idx}">
                            <button class="option-remove" data-index="${idx}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-option">
                    <i class="fas fa-plus"></i> Add Option
                </button>
            </div>
            ` : ''}
        `;
        
        // Add event listeners to properties
        document.getElementById('prop-label')?.addEventListener('input', updateElementProperty);
        document.getElementById('prop-placeholder')?.addEventListener('input', updateElementProperty);
        document.getElementById('prop-description')?.addEventListener('input', updateElementProperty);
        document.getElementById('prop-required')?.addEventListener('change', updateElementProperty);
        
        // Add options management
        const optionsList = document.getElementById('options-list');
        if (optionsList) {
            optionsList.querySelectorAll('input[type="text"]').forEach(input => {
                input.addEventListener('input', updateOption);
            });
            
            optionsList.querySelectorAll('.option-remove').forEach(btn => {
                btn.addEventListener('click', removeOption);
            });
            
            document.querySelector('.add-option').addEventListener('click', addOption);
        }
    }
    
    // Update element property
    function updateElementProperty(e) {
        if (!selectedElement) return;
        
        const prop = e.target.id.replace('prop-', '');
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        
        selectedElement[prop] = value;
        renderFormElements();
        saveState();
    }
    
    // Update option value
    function updateOption(e) {
        if (!selectedElement) return;
        
        const index = parseInt(e.target.dataset.index);
        selectedElement.options[index] = e.target.value;
        renderFormElements();
        saveState();
    }
    
    // Remove an option
    function removeOption(e) {
        if (!selectedElement) return;
        
        const index = parseInt(e.target.closest('.option-remove').dataset.index);
        selectedElement.options.splice(index, 1);
        renderPropertiesPanel();
        renderFormElements();
        saveState();
    }
    
    // Add a new option
    function addOption() {
        if (!selectedElement) return;
        
        selectedElement.options.push(`Option ${selectedElement.options.length + 1}`);
        renderPropertiesPanel();
        renderFormElements();
        saveState();
    }
    
    // Save current state for undo/redo
    function saveState() {
        undoStack.push(JSON.stringify(formElements));
        redoStack = [];
        updateUndoRedoButtons();
    }
    
    // Undo last action
    function undoAction() {
        if (undoStack.length < 2) return;
        
        redoStack.push(undoStack.pop());
        formElements = JSON.parse(undoStack[undoStack.length - 1]);
        renderFormElements();
        updateUndoRedoButtons();
    }
    
    // Redo last undone action
    function redoAction() {
        if (redoStack.length === 0) return;
        
        undoStack.push(redoStack.pop());
        formElements = JSON.parse(undoStack[undoStack.length - 1]);
        renderFormElements();
        updateUndoRedoButtons();
    }
    
    // Update undo/redo button states
    function updateUndoRedoButtons() {
        undoBtn.disabled = undoStack.length < 2;
        redoBtn.disabled = redoStack.length === 0;
    }
    
//     function loadTemplate(templateId) {
//     fetch(`http://localhost:5000/api/admin/templates/${templateId}`, {
//         headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//     })
//     .then(response => {
//         if (!response.ok) throw new Error('Failed to load template');
//         return response.json();
//     })
//     .then(templateData => {
//         templateTitle.value = templateData.title;
//         previewTitle.textContent = templateData.title;
//         formElements = templateData.elements || [];
//         renderFormElements();
//         saveState();
//     })
//     .catch(error => {
//         console.error('Error loading template:', error);
//         alert('Failed to load template: ' + error.message);
        
//         // Load sample template
//         const sampleTemplate = {
//             title: "Sample Template",
//             elements: [
//                 {
//                     id: "element-1",
//                     type: "section",
//                     label: "Personal Information",
//                     description: "Please provide your personal details"
//                 },
//                 {
//                     id: "element-2",
//                     type: "text",
//                     label: "Full Name",
//                     placeholder: "John Doe",
//                     required: true
//                 }
//             ]
//         };
        
//         templateTitle.value = sampleTemplate.title;
//         previewTitle.textContent = sampleTemplate.title;
//         formElements = sampleTemplate.elements;
//         renderFormElements();
//         saveState();
//     });
// }


// Updated loadTemplate function
async function loadTemplate(templateId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/templates/${templateId}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load template');
        }
        
        const { data: template } = await response.json();
        
        // Set template title
        templateTitle.value = template.title;
        previewTitle.textContent = template.title;
        
        // Create form elements from template data
        formElements = template.fields.map(field => ({
            id: field.id,
            type: field.type,
            label: field.label,
            required: field.required,
            options: field.options || [],
            placeholder: field.placeholder || '',
            description: field.description || '',
            min: field.min,
            max: field.max
        }));
        
        renderFormElements();
        saveState();
    } catch (error) {
        console.error('Error loading template:', error);
        alert('Failed to load template: ' + error.message);
        
        // Load sample template as fallback
        const sampleTemplate = {
            title: "Sample Template",
            fields: [
                {
                    id: "element-1",
                    type: "section",
                    label: "Personal Information",
                    description: "Please provide your personal details"
                },
                {
                    id: "element-2",
                    type: "text",
                    label: "Full Name",
                    placeholder: "John Doe",
                    required: true
                }
            ]
        };
        
        templateTitle.value = sampleTemplate.title;
        previewTitle.textContent = sampleTemplate.title;
        formElements = sampleTemplate.fields;
        renderFormElements();
        saveState();
    }
}
  

async function saveTemplate() {
    const templateData = {
        title: templateTitle.value,
        fields: formElements.map(element => ({
            id: element.id,
            type: element.type,
            label: element.label,
            options: element.options,
            required: element.required,
            placeholder: element.placeholder,
            min: element.min,
            max: element.max,
            description: element.description || ""
        })),
        templateCategory: "Other", // Default category
        templateImage: "https://via.placeholder.com/300x200?text=Form+Template",
        isTemplate: true
    };

    // Determine if we're creating or updating
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    
    if (!templateId) {
        alert('Template ID is missing');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:5000/api/admin/templates/${templateId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(templateData)
        });
        
        if (!response.ok) throw new Error('Failed to save template');
        
        alert('Template saved successfully!');
    } catch (error) {
        console.error('Error saving template:', error);
        alert('Error saving template: ' + error.message);
    }
}
    
});