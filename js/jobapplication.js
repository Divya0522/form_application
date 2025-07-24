const selected = document.querySelector("#selected");
    const options = document.querySelector("#options");
    const toggleIcon = document.getElementById("toggleIcon");

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
    });

    function displayContent(ele) {
      const inputContainer = document.getElementById("inputContainer");
      inputContainer.innerHTML = "";
      inputContainer.style.color = "rgb(0, 60, 139)";
      
      if (ele === "Short Answer") {
        inputContainer.innerHTML = "<input type='text' placeholder='Short answer text' style='border:none; border-bottom:1px solid #ccc'>";
      } else if (ele === "Paragraph") {
        inputContainer.innerHTML = "<textarea rows='3' cols='40'></textarea>";
      } else if (ele == "Multiple Choice") {
        inputContainer.innerHTML = multipleChoice();
      } else if (ele == "Checkboxes") {
        inputContainer.innerHTML = checkboxes();
      } else if (ele == "Dropdown") {
        inputContainer.innerHTML = dropdown();
      } else if (ele == "FileUpload") {
        inputContainer.innerHTML = "<input type='file'>";
      } else if (ele == "Date") {
        inputContainer.innerHTML = "<input type='date'>";
      } else if (ele == "Time") {
        inputContainer.innerHTML = "<input type='time'>";
      }
    }

    function addNewElement(event) {
      let addContent = document.getElementById("addContent");
      if (addContent.style.visibility !== "visible") {
        addContent.style.visibility = "visible";
      }

      let questionBlock = event.target.closest('#questionBlock');
      if (questionBlock) {
        questionBlock.insertAdjacentElement("afterend", addContent);
      }
    }

    function editElement() {
      const questionBlock = this.closest('#questionBlock');
      const label = questionBlock.querySelector('label');
      const input = questionBlock.querySelector('input, textarea, select');
      
      const newText = prompt("Edit your question:", label.textContent);
      if (newText !== null) {
        label.textContent = newText;
      }
      
      if (input && input.type !== 'radio' && input.type !== 'checkbox') {
        const newPlaceholder = prompt("Edit placeholder text:", input.placeholder);
        if (newPlaceholder !== null) {
          input.placeholder = newPlaceholder;
        }
      }
    }

    function deleteElement() {
      if (confirm("Are you sure you want to delete this question?")) {
        const questionBlock = this.closest('#questionBlock');
        questionBlock.remove();
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
      }
      
      let other = prompt("Do you like to include 'others' option also");
      if (other && other.toLowerCase() == "yes") {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "dynamicMCQ";
        input.value = "Other";

        label.appendChild(input);
        label.append(" " + "Other");
        container.appendChild(label);
      }

      return container.outerHTML;
    }

    function checkboxes() {
      const container = document.createElement("div");
      container.className = "Checkbox";
      let no = prompt("Enter no of Checkboxes");
      no = parseInt(no);
      
      if (no <= 0 || isNaN(no)) {
        alert("Please enter valid number");
        return "";
      }
      
      for (let i = 0; i < no; i++) {
        let value = prompt(`Enter value of checkbox ${i + 1}`);
        let label = document.createElement("label");
        let input = document.createElement('input');
        input.type = "checkbox";
        input.value = value;
        input.name = "DynamicCheckboxes";
        
        label.appendChild(input);
        label.append(" " + value);
        container.appendChild(label);
      }
      
      let other = prompt("Do you like to include 'others' option also");
      if (other && other.toLowerCase() == "yes") {
        let label = document.createElement("label");
        let input = document.createElement('input');
        input.type = "checkbox";
        input.value = "Other";
        input.name = "DynamicCheckboxes";
        
        label.appendChild(input);
        label.append(" " + "Other");
        container.appendChild(label);
      }
      
      return container.outerHTML;
    }

    function dropdown() {
      const container = document.createElement("div");
      container.className = "dropdown";
      let no = prompt("Enter no of elements in the dropdown");
      no = parseInt(no);
      
      if (no <= 0 || isNaN(no)) {
        alert("Please enter valid number");
        return "";
      }
      
      const select = document.createElement('select');
      for (let i = 0; i < no; i++) {
        let value = prompt(`Enter value of option ${i + 1} in dropdown: `);
        let option = document.createElement("option");
        option.textContent = value;
        select.appendChild(option);
      }
      
      let other = prompt("Do you like to include 'others' option also");
      if (other && other.toLowerCase() == "yes") {
        let option = document.createElement("option");
        option.textContent = "Other";
        select.appendChild(option);
      }
      
      container.appendChild(select);
      return container.outerHTML;
    }

    function save() {
      const questionInput = document.querySelector("#addContent input[type='text']");
      const inputContainer = document.getElementById("inputContainer");
      const isRequired = toggleIcon.classList.contains("fa-toggle-on");

      if (!questionInput || !questionInput.value.trim()) {
        alert("Please enter a question first");
        return;
      }

      const newQuestionBlock = document.createElement("div");
      newQuestionBlock.className = "questionBlock";

      const formGroup = document.createElement("div");
      formGroup.id = "form-group";

      const label = document.createElement("label");
      label.textContent = questionInput.value.trim();
      if (isRequired) {
        label.classList.add("required");
      }

      const icons = document.createElement("div");
      icons.id = "icons";

      const addIcon = document.createElement("i");
      addIcon.className = "fas fa-plus-circle";
      addIcon.style.fontSize = "24px";
      addIcon.style.cursor = "pointer";
      addIcon.addEventListener("click", addNewElement);

      const editIcon = document.createElement("i");
      editIcon.className = "fas fa-edit";
      editIcon.style.fontSize = "20px";
      editIcon.style.cursor = "pointer";
      editIcon.addEventListener("click", editElement);

      const deleteIcon = document.createElement("i");
      deleteIcon.className = "fas fa-trash";
      deleteIcon.style.fontSize = "18px";
      deleteIcon.style.cursor = "pointer";
      deleteIcon.addEventListener("click", deleteElement);

      const space1 = document.createTextNode("\u00A0\u00A0");
      const space2 = document.createTextNode("\u00A0\u00A0");

      icons.appendChild(addIcon);
      icons.appendChild(space1);
      icons.appendChild(editIcon);
      icons.appendChild(space2);
      icons.appendChild(deleteIcon);

      formGroup.appendChild(label);
      formGroup.appendChild(icons);

      const inputClone = document.createElement("div");
      inputClone.innerHTML = inputContainer.innerHTML;
      
      // Remove any <br> elements from the cloned content
      const brElements = inputClone.querySelectorAll("br");
      brElements.forEach(br => br.remove());

      newQuestionBlock.appendChild(formGroup);
      newQuestionBlock.appendChild(inputClone);

      const addContent = document.getElementById("addContent");
      addContent.insertAdjacentElement("beforebegin", newQuestionBlock);

      // Save to localStorage
      const form = document.querySelector('form');
      localStorage.setItem('jobApplicationQuestions', form.innerHTML);

      questionInput.value = "";
      inputContainer.innerHTML = "";
      addContent.style.visibility = "hidden";
    }

    function copyText() {
      alert("Copy functionality will be implemented here");
    }
    
    function deleteText() {
      const inputContainer = document.getElementById("inputContainer");
      inputContainer.innerHTML = "";
    }
    
    function uploadImage() {
      alert("Image upload functionality will be implemented here");
    }

    // Load saved form questions if available
    document.addEventListener('DOMContentLoaded', function() {
      const savedForm = localStorage.getItem('jobApplicationQuestions');
      if (savedForm) {
        document.querySelector('form').innerHTML = savedForm;
        
        // Reattach event listeners to all icons
        document.querySelectorAll('.fa-plus-circle').forEach(icon => {
          icon.addEventListener('click', addNewElement);
        });
        
        document.querySelectorAll('.fa-edit').forEach(icon => {
          icon.addEventListener('click', editElement);
        });
        
        document.querySelectorAll('.fa-trash').forEach(icon => {
          icon.addEventListener('click', deleteElement);
        });
      }
    });