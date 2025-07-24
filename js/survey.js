const surveyFormContents = [
  {
    label: "Full Name",
    id: "fullName",
    type: "text",
    placeholder: "Enter your name"
  },
  {
    label: "Email",
    type: "email",
    id: "email",
    placeholder: "Enter your email"
  },
  {
    label: "Age",
    type: "number",
    id: "number",
    min: "0"
  },
  {
    label: "Gender",
    type: "radio",
    id: "gender",
    options: ["Male", "Female", "Other"]
  },
  {
    label: "Which product do you like most?",
    type: "select",
    id: "product",
    options: ["Product A", "Product B", "Product C"]
  },
  {
    label: "Which features do you use? (Select all that apply)",
    type: "checkbox",
    id: "features",
    options: ["Search", "Filters", "Dashboard"]
  },
  {
    label: "When did you last visit us?",
    type: "date",
    id: "lastVisit"
  },
  {
    label: "Rate your satisfaction:",
    type: "rating",
    id: "rating",
    max: 5
  },
  {
    label: "Any suggestions or feedback?",
    type: "textarea",
    id: "feedback",
    placeholder: "Type here..."
  }
];


let currentFormId = null;


document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedFormId = urlParams.get('shared_form');
  
  if (sharedFormId) {
    const sharedForm = localStorage.getItem('shared_form_' + sharedFormId);
    if (sharedForm) {
      document.querySelector('form').innerHTML = sharedForm;
      addEventListenersToFormElements();
      
      document.querySelectorAll('#icons').forEach(icons => {
        icons.style.display = 'none';
      });
      
   
      const formHeader = document.querySelector('.form-header h1');
      if (formHeader) {
        formHeader.textContent += ' (Response Mode)';
      }
      

      document.querySelector('form').addEventListener('submit', handleFormSubmit);
    }
  } else {
  
    const savedForm = localStorage.getItem('surveyForm');
    if (savedForm) {
      document.querySelector('form').innerHTML = savedForm;
      addEventListenersToFormElements();
    } else {
      loadDefaultForm();
    }
    
   
    initializeFormStates();
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentFormId = urlParams.get('id');
  
  if (currentFormId) {
    try {
      const response = await fetch(`http://localhost:5000/api/forms/${currentFormId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const { data: form } = await response.json();
        updatePublishButton(form.isPublished);
      }
    } catch (error) {
      console.error('Error checking form status:', error);
    }
    
  }
  const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
      publishBtn.addEventListener('click', publishForm);
    }
     const shareBtn = document.querySelector('#buttonsHeader button:nth-child(5)');
  if (shareBtn) {
    shareBtn.addEventListener('click', shareForm);
  }
});

function updatePublishButton(isPublished) {
  const publishBtn = document.getElementById('publishBtn');
  if (isPublished) {
    publishBtn.textContent = 'Published';
    publishBtn.style.backgroundColor = '#4CAF50';
    publishBtn.style.color = 'white';
    publishBtn.onclick = unpublishForm;
  } else {
    publishBtn.textContent = 'Publish';
    publishBtn.style.backgroundColor = '';
    publishBtn.style.color = '';
    publishBtn.onclick = publishForm;
  }
}


async function publishForm() {
  if (!currentFormId) {
    const saved = await saveForm();
    if (!saved) {
      alert('Failed to save form before publishing');
      return;
    }
  }

  try {
    const response = await fetch(`http://localhost:5000/api/forms/${currentFormId}/publish`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      updatePublishButton(true);
      showShareDialog(currentFormId);
      alert('Form published successfully!');
    } else {
      const error = await response.json();
      throw new Error(error.message || 'Failed to publish form');
    }
  } catch (error) {
    console.error('Error publishing form:', error);
    alert(`Error publishing form: ${error.message}`);
  }
}


async function unpublishForm() {
  try {
    const response = await fetch(`http://localhost:5000/api/forms/${currentFormId}/unpublish`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      updatePublishButton(false);
      alert('Form unpublished successfully!');
    } else {
      throw new Error('Failed to unpublish form');
    }
  } catch (error) {
    console.error('Error unpublishing form:', error);
    alert('Error unpublishing form. Please try again.');
  }
}

async function saveForm() {
  const formStructure = getFormStructure();
  
  try {
    const endpoint = currentFormId ? `/api/forms/${currentFormId}` : '/api/forms';
    const method = currentFormId ? 'PUT' : 'POST';
    
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formStructure)
    });
    
    if (!response.ok) throw new Error('Failed to save form');
    
    const { data } = await response.json();
    currentFormId = data._id;
    alert('Form saved successfully!');
    return true;
  } catch (error) {
    console.error('Error saving form:', error);
    alert(`Error saving form: ${error.message}`);
    return false;
  }
}


function initializeFormStates() {
  formStates = [document.querySelector('form').innerHTML];
  currentStateIndex = 0;
  updateUndoRedoButtons();
}

document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedFormId = urlParams.get('shared_form');
  
  if (sharedFormId) {
    const sharedForm = localStorage.getItem('shared_form_' + sharedFormId);
    if (sharedForm) {
      document.querySelector('form').innerHTML = sharedForm;
      addEventListenersToFormElements();
    
      document.querySelectorAll('#icons').forEach(icons => {
        icons.style.display = 'none';
      });
   
      const formHeader = document.querySelector('.form-header h1');
      if (formHeader) {
        formHeader.textContent += ' (Response Mode)';
      }
    }
  } else {
   
    const savedForm = localStorage.getItem('surveyForm');
    if (savedForm) {
      document.querySelector('form').innerHTML = savedForm;
      addEventListenersToFormElements();
    } else {
      loadDefaultForm();
    }
  }
});


let formStates = [];
let currentStateIndex = -1;

saveFormState();


function updateUndoRedoButtons() {
  const undoBtn = document.querySelector('#buttonsHeader button:nth-child(1)');
  const redoBtn = document.querySelector('#buttonsHeader button:nth-child(2)');
  
  undoBtn.disabled = currentStateIndex <= 0;
  redoBtn.disabled = currentStateIndex >= formStates.length - 1;
}

function undoAction() {
  if (currentStateIndex > 0) {
    currentStateIndex--;
    document.querySelector('form').innerHTML = formStates[currentStateIndex];
    updateUndoRedoButtons();
    addEventListenersToFormElements();
  }
}

function redoAction() {
  if (currentStateIndex < formStates.length - 1) {
    currentStateIndex++;
    document.querySelector('form').innerHTML = formStates[currentStateIndex];
    updateUndoRedoButtons();
    addEventListenersToFormElements();
  }
}

function addEventListenersToFormElements() {
  document.querySelectorAll('.fa-plus-circle').forEach(btn => {
    btn.addEventListener('click', addNewElement);
  });
  
  document.querySelectorAll('.fa-edit').forEach(btn => {
    btn.addEventListener('click', editElement);
  });
  
  document.querySelectorAll('.fa-trash').forEach(btn => {
    btn.addEventListener('click', deleteElement);
  });
}

function previewForm() {

  const formClone = document.querySelector('form').cloneNode(true);
  

  formClone.querySelectorAll('#icons').forEach(icons => {
    icons.remove();
  });
  

  const previewModal = document.createElement('div');
  previewModal.style.position = 'fixed';
  previewModal.style.top = '0';
  previewModal.style.left = '0';
  previewModal.style.width = '100%';
  previewModal.style.height = '100%';
  previewModal.style.backgroundColor = 'rgba(0,0,0,0.8)';
  previewModal.style.display = 'flex';
  previewModal.style.justifyContent = 'center';
  previewModal.style.alignItems = 'center';
  previewModal.style.zIndex = '2000';
  

  const previewContent = document.createElement('div');
  previewContent.style.backgroundColor = 'white';
  previewContent.style.padding = '20px';
  previewContent.style.borderRadius = '8px';
  previewContent.style.width = '80%';
  previewContent.style.maxWidth = '800px';
  previewContent.style.maxHeight = '90vh';
  previewContent.style.overflowY = 'auto';
  

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close Preview';
  closeBtn.style.marginTop = '20px';
  closeBtn.style.padding = '10px 20px';
  closeBtn.style.backgroundColor = 'rgb(0, 60, 139)';
  closeBtn.style.color = 'white';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '5px';
  closeBtn.style.cursor = 'pointer';
  
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(previewModal);
  });
  
 
  previewContent.appendChild(formClone);
  previewContent.appendChild(closeBtn);
  previewModal.appendChild(previewContent);
  

  document.body.appendChild(previewModal);
}

function saveFormState() {
  const formHTML = document.querySelector('form').innerHTML;
  localStorage.setItem('surveyForm', formHTML);
  
  
  if (currentStateIndex < formStates.length - 1) {
    formStates = formStates.slice(0, currentStateIndex + 1);
  }
  
  formStates.push(formHTML);
  currentStateIndex++;
  
 
  if (formStates.length > 50) {
    formStates.shift();
    currentStateIndex--;
  }
  
  updateUndoRedoButtons();
}

function showShareDialog(publicUrl) {
    const shareModal = document.createElement('div');
    shareModal.style.position = 'fixed';
    shareModal.style.top = '0';
    shareModal.style.left = '0';
    shareModal.style.width = '100%';
    shareModal.style.height = '100%';
    shareModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    shareModal.style.display = 'flex';
    shareModal.style.justifyContent = 'center';
    shareModal.style.alignItems = 'center';
    shareModal.style.zIndex = '2000';
    
    shareModal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 8px; width: 90%; max-width: 500px;">
            <h2 style="margin-top: 0;">Share Your Form</h2>
            <p>Anyone with this link can respond to your form:</p>
            <div style="display: flex; margin: 15px 0;">
                <input type="text" id="shareUrlInput" value="${publicUrl}" readonly 
                    style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px 0 0 4px;">
                <button onclick="copyToClipboard('shareUrlInput')" 
                        style="padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 0 4px 4px 0; cursor: pointer;">
                    Copy
                </button>
            </div>
            <div style="margin-top: 20px;">
                <button onclick="shareVia('email', '${publicUrl}')" 
                        style="padding: 8px 15px; margin-right: 10px; background: #4285F4; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Email
                </button>
                <button onclick="shareVia('whatsapp', '${publicUrl}')" 
                        style="padding: 8px 15px; background: #25D366; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    WhatsApp
                </button>
            </div>
            <div style="margin-top: 20px; text-align: right;">
                <button onclick="document.body.removeChild(this.parentElement.parentElement.parentElement)" 
                        style="padding: 8px 15px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(shareModal);
}


window.copyToClipboard = function(elementId) {
  const input = document.getElementById(elementId);
  input.select();
  document.execCommand('copy');
  alert('Link copied to clipboard!');
};

window.shareVia = function(method, url) {
  const subject = 'Please fill out this form';
  const body = `I'd like you to fill out this form: ${url}`;
  
  if (method === 'email') {
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  } else if (method === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(body)}`);
  }
};

function loadDefaultForm() {
  let html = `<div class="form-header">
    <h1>Survey Form</h1>
    <p>Please share your experience with us</p>
    <div id="icons">
      <i class="fas fa-edit" style="font-size: 20px;" onclick="editElement(event)"></i>
    </div>
  </div>`;

  surveyFormContents.forEach(content => {
    html += `
    <div id="questionBlock" class="questionBlock">
        <div id="form-group">
          <label>${content.label}</label>
          <div id="icons">
            <i class="fas fa-plus-circle" onclick="addNewElement(event)" style="font-size: 24px; cursor: pointer;"></i>
            &nbsp;&nbsp;
            <i class="fas fa-edit" style="font-size: 20px;" onclick="editElement(event)"></i>&nbsp;&nbsp;
            <i class="fas fa-trash" style="font-size: 18px;" onclick="deleteElement(event)"></i>
          </div>
        </div>
        ${generateInput(content)}<br><br>
        </div>
    `;
  });

  html += `<div id="form-group">
          <button type="submit">Submit</button>
        </div>`;

  document.querySelector("form").innerHTML = html;
  initializeFormStates();
  document.querySelector('form').addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const formObject = {};
  
  formData.forEach((value, key) => {
    if (formObject[key]) {
      if (Array.isArray(formObject[key])) {
        formObject[key].push(value);
      } else {
        formObject[key] = [formObject[key], value];
      }
    } else {
      formObject[key] = value;
    }
  });


  const urlParams = new URLSearchParams(window.location.search);
  const formId = urlParams.get('shared_form');

  try {
    if (formId) {
   
      const response = await submitResponseToBackend(formId, formObject);
      alert('Thank you for your response!');
     
    } else {
     
      const formStructure = getFormStructure();
      const savedForm = await saveFormToBackend(formStructure);
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?shared_form=${savedForm._id}`;
      console.log('Shareable link:', shareUrl);
      alert('Form saved successfully!');
    }
  } catch (error) {
    console.error('Submission error:', error);
    alert('There was an error submitting the form. Please try again.');
  }
}


function getFormStructure() {
  const form = document.querySelector('form');
  const title = document.querySelector('.form-header h1')?.textContent || 'Untitled Form';
  const description = document.querySelector('.form-header p')?.textContent || '';
  
  const fields = [];
  document.querySelectorAll('.questionBlock').forEach(block => {
    const label = block.querySelector('label').textContent;
    const input = block.querySelector('input, textarea, select');
    const type = input?.type || 
                (block.querySelector('textarea') ? 'textarea' : 
                 block.querySelector('select') ? 'select' : 'text');
    const required = input?.required || false;
    
    let options = [];
    if (type === 'select') {
      options = Array.from(block.querySelectorAll('option'))
        .map(opt => ({ value: opt.value, text: opt.textContent }));
    } else if (type === 'radio' || type === 'checkbox') {
      options = Array.from(block.querySelectorAll(`input[type="${type}"]`))
        .map(el => ({ value: el.value, text: el.nextSibling.textContent.trim() }));
    }
    
    fields.push({
      type,
      label,
      options,
      required,
      id: input?.id || label.toLowerCase().replace(/\s+/g, '-')
    });
  });
  
  return { 
    title, 
    description, 
    fields,
    isPublished: false
  };
}

async function submitResponseToBackend(formId, responseData) {
  const responses = Object.entries(responseData).map(([fieldId, value]) => ({
    fieldId,
    value
  }));

  const response = await fetch(`/api/responses/${formId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ responses })
  });

  if (!response.ok) {
    throw new Error('Failed to submit response');
  }

  return response.json();
}


function submitResponse(formId, responseData) {
 
  const responses = JSON.parse(localStorage.getItem(`form_responses_${formId}`)) || [];
 
  responses.push({
    timestamp: new Date().toISOString(),
    data: responseData
  });
 
  localStorage.setItem(`form_responses_${formId}`, JSON.stringify(responses));
 
  alert('Thank you for your response!');
  
 
}


async function saveFormToBackend(formData) {
  const response = await fetch("http://localhost:5000/api/forms", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    throw new Error('Failed to save form');
  }

  return response.json();
}

function generateInput(content) {
  switch(content.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'date':
      return `<input type="${content.type}" id="${content.id}" placeholder="${content.placeholder || ''}" ${content.min ? `min="${content.min}"` : ''}>`;
    
    case 'textarea':
      return `<textarea rows="4" cols="50" id="${content.id}" placeholder="${content.placeholder || ''}"></textarea>`;
    
    case 'radio':
    case 'checkbox':
      return generateOptions(content);
    
    case 'select':
      return generateSelect(content);
    
    case 'rating':
      return generateRating(content);
    
    default:
      return '';
  }
}

function generateOptions(content) {
  let html = '';
  content.options.forEach(option => {
    html += `
    <input type="${content.type}" name="${content.id}" value="${option}" id="${content.id}">
    <label for="${content.id}">${option}</label><br>`;
  });
  return html;
}

function generateSelect(content) {
  let html = `<select id="${content.id}">`;
  html += `<option value="">-- Select --</option>`;
  
  content.options.forEach(option => {
    
    html += `<option value="${option.split(' ')[1]}">${option}</option>`;
  });
  
  html += `</select>`;
  return html;
}

function generateRating(content) {
  let html = '';
  for (let i = 1; i <= content.max; i++) {
    html += `<input type="radio" name="${content.id}" value="${i}" id="${content.id}"> ${i}`;
  }
  return html;
}




const selected = document.querySelector("#selected");
const options = document.querySelector("#options");
const toggleIcon = document.getElementById("toggleRequired");




toggleIcon.addEventListener("click", () => {
  if (toggleIcon.classList.contains("fa-toggle-on")) {
    toggleIcon.classList.remove("fa-toggle-on");
    toggleIcon.classList.add("fa-toggle-off");
    toggleIcon.style.color = "gray";
  } else {
    toggleIcon.classList.remove("fa-toggle-off");
    toggleIcon.classList.add("fa-toggle-on");
    toggleIcon.style.color = "green";
  }
   const inputContainer = document.getElementById("inputContainer");
  const inputElement = inputContainer.querySelector('input, textarea, select');
  if (inputElement) {
    inputElement.required = toggleIcon.classList.contains("fa-toggle-on");
  }
});


selected.addEventListener("click", () => {
  options.style.display = options.style.display === "block" ? "none" : "block";
});



let option = document.querySelectorAll("#options li");
option.forEach(li => {
  li.addEventListener("click", () => {
    selected.innerHTML = li.innerHTML;
    options.style.display = 'none';
    displayContent(li.textContent.trim());
  });
})



function displayContent(ele) {
  const inputContainer = document.getElementById("inputContainer");
  inputContainer.innerHTML = "";
    const isRequired = toggleIcon.classList.contains("fa-toggle-on");
  inputContainer.style.color = "rgb(0, 60, 139)";
  inputContainer.style.marginLeft="10px";
  if (ele === "Short Answer") {
    inputContainer.innerHTML = `<input type='text' placeholder='Short answer text' style:'border:none';border-bottom:'1px solid #ccc' ${isRequired ? 'required' : ''}>`;

  } else if (ele === "Paragraph") {
    inputContainer.innerHTML = `<textarea rows='3' cols='40' ${isRequired ? 'required' : ''}></textarea>`;
  } else if (ele == "Multiple Choice") {
    inputContainer.innerHTML = multipleChoice();
  } else if (ele == "Checkboxes") {
    inputContainer.innerHTML = checkboxes();
  } else if (ele == "Dropdown") {
    inputContainer.innerHTML = dropdown();
  } else if (ele == "FileUpload") {
    inputContainer.innerHTML = `<input type='file' ${isRequired ? 'required' : ''}>`;
  } else if (ele == "Linear Scaling") {
    let max = parseInt(prompt("Enter max range: "));
    let min = parseInt(prompt("Enter min range: "));
    inputContainer.innerHTML = `<input type='number' max=${max} min=${min} ${isRequired ? 'required' : ''}
    placeholder="Enter number among ${min} [poor] and ${max} [Excellent]">`
  } else if (ele == "Date") {
    inputContainer.innerHTML = `<input type='date' ${isRequired ? 'required' : ''}>`;
  } else if (ele == "Time") {
    inputContainer.innerHTML = `<input type='time' ${isRequired ? 'required' : ''}>`;
  } else if (ele == "Rating") {
    inputContainer.innerHTML = rating();

  }
}



function addNewElement(event) {
  let addContent = document.getElementById("addContent");
 if (addContent.style.display !== "block") {
  addContent.style.display = "block";
}


  let questionBlock = event.target.closest('#questionBlock');
  if (questionBlock) {
    questionBlock.insertAdjacentElement("afterend", addContent);
  }
}

function multipleChoice() {
  const container = document.createElement("div");
  container.id = "multipleChoice";
  container.style.marginTop = "10px";

  const optionCount = prompt("How many options do you want to add?");
  const count = parseInt(optionCount);

  if (isNaN(count) || count <= 0) {
    alert("Please enter a valid number.");
    return "";
  }

  for (let i = 1; i <= count; i++) {
    const value = prompt(`Enter text for option ${i}:`);
    if (!value) continue;

    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "dynamicMCQ";
    input.value = value;

    label.appendChild(input);
    label.append(" " + value);
    container.appendChild(label);
    container.appendChild(document.createElement("br"));
  }
  let other = prompt("Do you like to include 'others' option also");
  console.log(other, other.toLowerCase(), other.toLowerCase == "yes");
  if (other.toLowerCase() == "yes") {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "dynamicMCQ";
    input.value = "Other";

    label.appendChild(input);
    label.append(" " + "Other");
    container.appendChild(label);
    container.appendChild(document.createElement("br"));
  }

  return container.outerHTML;
}



function checkboxes() {
  const container = document.createElement("div");
  container.className = "Checkbox";
  let no = prompt("Enter no of Checkboxes");
  no = parseInt(no);
  if (no <= 0 && isNaN(no)) {
    alert("please enter valid number");
  }
  for (let i = 0; i < no; i++) {
    let value = prompt(`Enter value of checkbox ${i + 1}`);
    let label = document.createElement("label");
    let input = document.createElement('input');
    input.type = "checkbox";
    input.value = value;
    input.value = "DynamicCheckboxes";
    label.appendChild(input);
    label.append(" " + value);
    container.appendChild(label);
    container.appendChild(document.createElement('br'));
  }
  let other = prompt("Do you like to include 'others' option also");
  if (other.toLowerCase() == "yes") {
    let label = document.createElement("label");
    let input = document.createElement('input');
    input.type = "checkbox";
    input.value = "Other";
    input.value = "DynamicCheckboxes";
    label.appendChild(input);
    label.append(" " + "Other");
    container.appendChild(label);
    container.appendChild(document.createElement('br'));
  }
  return container.outerHTML;
}



function rating() {
  const container = document.createElement("div");
  container.className = "stars";

  let no = parseInt(prompt("Enter max amount of rating you would like to provide: "));
  if (isNaN(no) || no <= 0) {
    alert("Please enter a valid number.");
    return "";
  }

  for (let i = 0; i < no; i++) {
    let input = document.createElement('input');
    input.type = "radio";
    input.name = "rating";
    input.id = `star${i}`;
    input.value = i.toString();

    let label = document.createElement('label');
    label.htmlFor = `star${i}`;
    label.textContent = "★";
    container.appendChild(input);
    container.appendChild(label);

  }

  return container.outerHTML;
}




function dropdown() {
  const container = document.createElement("div");
  container.className = "dropdown";
  let no = prompt("Enter no of elements in the dropdown");
  no = parseInt(no);
  const select = document.createElement('select');
  for (let i = 0; i < no; i++) {
    let value = prompt(`Enter value of option ${i + 1} in dropdown: `);
    let option = document.createElement("option");
    option.textContent = value;
    select.appendChild(option);
  }
  let other = prompt("Do you like to include 'others' option also");
  if (other.toLowerCase() == "yes") {
    let option = document.createElement("option");
    option.textContent = "Other";
    select.appendChild(option);
    container.appendChild(select);
    return container.outerHTML;
  }
}


function save(event) {
  event.preventDefault();
  
  const addContent = document.getElementById("addContent");
  const isRequired = toggleIcon.classList.contains("fa-toggle-on");
  let questionBlock = addContent.previousElementSibling;
  
  while (questionBlock && !questionBlock.classList.contains('questionBlock')) {
    questionBlock = questionBlock.previousElementSibling;
  }
  
  if (!questionBlock) {
  
    questionBlock = document.querySelector('.form-header');
    if (!questionBlock) questionBlock = document.querySelector('form');
  }

  const questionInput = document.querySelector("#container input[type='text']");
  const questionText = questionInput.value.trim();
  
  if (!questionText) {
    alert("Please enter a question first");
    return;
  }
  
  const answerType = selected.textContent.trim();
  const inputContainer = document.getElementById("inputContainer");
  let inputElement = inputContainer.querySelector('input, textarea, select');
  
  
  let inputHTML = inputContainer.innerHTML;
  if (!inputElement && inputContainer.firstChild) {
  
    const customContainer = inputContainer.firstChild;
    if (customContainer.querySelector) {
      inputElement = customContainer.querySelector('input, textarea, select');
    }
  }
  
  if (inputElement && isRequired) {
    inputElement.required = true;
  
    if (inputElement.type === 'radio' || inputElement.type === 'checkbox') {
      const name = inputElement.name;
      document.querySelectorAll(`input[name="${name}"]`).forEach(el => {
        el.required = true;
      });
    }
  }
  
  const newQuestionBlock = document.createElement("div");
  newQuestionBlock.className = "questionBlock";
  
  newQuestionBlock.innerHTML = `
    <div id="form-group">
      <label>${questionText}</label>
      <div id="icons">
        <i class="fas fa-plus-circle" onclick="addNewElement(event)" style="font-size: 24px; cursor: pointer;"></i>
        &nbsp;&nbsp;
        <i class="fas fa-edit" style="font-size: 20px;" onclick="editElement(event)"></i>&nbsp;&nbsp;
        <i class="fas fa-trash" style="font-size: 18px;" onclick="deleteElement(event)"></i>
      </div>
    </div>
    ${inputHTML}
    <br><br>
  `;
  
  if (questionBlock.nextElementSibling === addContent) {
    questionBlock.parentNode.insertBefore(newQuestionBlock, addContent);
  } else {
    questionBlock.parentNode.insertBefore(newQuestionBlock, questionBlock.nextSibling);
  }
  

  questionInput.value = "";
  inputContainer.innerHTML = "";
  selected.innerHTML = "Select type of answer";
  addContent.style.display = "none";
  

  if (toggleIcon.classList.contains("fa-toggle-on")) {
    toggleIcon.click();
  }
  
 
  saveFormState();
}



function copyText() {
  const addContent = document.getElementById("addContent");
  let questionBlock = addContent.previousElementSibling;
  while (questionBlock && !questionBlock.classList.contains('questionBlock')) {
    questionBlock = questionBlock.previousElementSibling;
  }
  
  if (!questionBlock) {
    alert("No question block found to copy");
    return;
  }
  const clonedBlock = questionBlock.cloneNode(true);
  questionBlock.insertAdjacentElement('afterend', clonedBlock);
  addContent.style.display = "none";
}

function deleteText() {
  const addContent = document.getElementById("addContent");
  let questionBlock = addContent.previousElementSibling;
  while (questionBlock && !questionBlock.classList.contains('questionBlock')) {
    questionBlock = questionBlock.previousElementSibling;
  }
  
  if (!questionBlock) {
    alert("No question block found to delete");
    return;
  }
  
  if (confirm("Are you sure you want to delete this question?")) {
    questionBlock.remove();
  }
  
  addContent.style.display = "none";
}

function deleteElement() {
  const questionBlock = event.target.closest('.questionBlock');
  if (!questionBlock) return;
  
  if (confirm("Are you sure you want to delete this question?")) {
    questionBlock.remove();
  }
}



function editElement(event) {
  const questionBlock = event.target.closest('.questionBlock');
  const formHeader = event.target.closest('.form-header');
  
  if (formHeader) {

    const title = formHeader.querySelector('h1').textContent;
    const description = formHeader.querySelector('p').textContent;
    
    const newTitle = prompt("Edit form title:", title);
    if (newTitle !== null && newTitle !== title) {
      formHeader.querySelector('h1').textContent = newTitle;
    }
    
    const newDesc = prompt("Edit form description:", description);
    if (newDesc !== null && newDesc !== description) {
      formHeader.querySelector('p').textContent = newDesc;
    }
    
    saveFormState();
    return;
  }
  
  if (!questionBlock) return;
  
  const label = questionBlock.querySelector('label');
  const currentText = label.textContent;
  const newText = prompt("Edit your question:", currentText);
  
  if (newText !== null && newText !== currentText) {
    label.textContent = newText;
    saveFormState();
  }
}
async function loadUserForms() {
  try {
    const response = await fetch('/api/forms', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load forms');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error loading forms:', error);
    return [];
  }
}

async function shareForm() {
    if (!currentFormId) {
        const saved = await saveForm();
        if (!saved) {
            alert('Please save the form first before sharing');
            return;
        }
    }

    try {
        // First check if the form is published
        const formResponse = await fetch(`http://localhost:5000/api/forms/${currentFormId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!formResponse.ok) {
            throw new Error('Failed to fetch form details');
        }
        
        const { data: form } = await formResponse.json();
        
        if (!form.isPublished) {
            const shouldPublish = confirm('This form is not published yet. Would you like to publish it now?');
            if (shouldPublish) {
                await publishForm();
            } else {
                return;
            }
        }
        
        // Now show the share dialog with the public URL
        const publicUrl = `${window.location.origin}/form.html?id=${currentFormId}`;
        showShareDialog(publicUrl);
    } catch (error) {
        console.error('Error sharing form:', error);
        alert('Error sharing form: ' + error.message);
    }
}