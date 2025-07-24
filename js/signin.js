
const email=document.getElementById("email");
const password=document.getElementById("password");
const emailReg=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

async function signInValidation(e) {
  e.preventDefault();
  clearForms("emailContainer");
  clearForms("passwordContainer");
  
  let em = email.value;
  let ps = password.value;
  let isValid = true;
  
  if (em == "" || (!emailReg.test(em))) {
    showError("emailContainer", "Enter valid email id");
    isValid = false;
  }
  
  if (ps == "") {
    showError("passwordContainer", "Enter Password it must not be blank");
    isValid = false;
  }
  
  if (isValid) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: em,
          password: ps
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user)); 
  if (data.user.role === 'admin') {
          window.location.href = 'adminDashboard.html';
        } else {
          window.location.href = 'userDashboard.html';
        }
  
      } else {
        showError("passwordContainer", data.message || 'Login failed');
      }
    } catch (error) {
      showError("passwordContainer", 'An error occurred. Please try again.');
    }
  }
}


function showError(id,msg){
    let parent=document.getElementById(id);
    let p=document.createElement('p');
    p.textContent=`* ${msg} *`;
    p.fontSize="18px";
    p.style.color="red";
    parent.appendChild(p);

}

function clearForms(id){
    let parent=document.getElementById(id);
    let errors=parent.querySelectorAll('p');
    errors.forEach(e=>{
        e.remove();
    })
}

function sendLink(){
     clearForms("newemailContainer");
    let isValid=true;
    const newEmail=document.getElementById("newemail").value;
    if(newEmail === "" || !emailReg.test(newEmail)){
    showError('newemailContainer', "Please enter valid email id");
    isValid = false;
} else {
    clearForms("newemailContainer");
}

    if(isValid){
    alert('Reset password link is sent successfully to your provided mail id');
    }
}