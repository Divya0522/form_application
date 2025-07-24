const emailReg=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ADMIN_EMAILS = ['admin1@gmail.com', 'admin2@gmail.com'];


const email=document.getElementById("email");
const fullName=document.getElementById("fullName");
const password=document.getElementById("password");
const confirmPassword=document.getElementById("confirmPassword");
const remember=document.getElementById("rememberMe");




async function signUpValidation(e) {
  e.preventDefault();
  let isValid = true;
  

  clearError("email");
  clearError("password");
  clearError("fullName");
  clearError("confirmPassword");
  clearError("remember");
  
  const em = email.value.trim();
  const fn = fullName.value.trim();
  const ps = password.value.trim();
  const cp = confirmPassword.value.trim();
  
  if (!em || !emailReg.test(em)) {
    showError("email", "Please enter a valid email address");
    isValid = false;
  }
  
  if (!fn) {
    showError("fullName", "Please enter your full name");
    isValid = false;
  }
  
  if (!ps) {
    showError("password", "Please enter a password");
    isValid = false;
  } else if (ps.length < 8) {
    showError("password", "Password must be at least 8 characters");
    isValid = false;
  }
  
  if (!cp) {
    showError("confirmPassword", "Please confirm your password");
    isValid = false;
  } else if (cp !== ps) {
    showError("confirmPassword", "Passwords do not match");
    isValid = false;
  }
  
  if (!remember.checked) {
    showError("remember", "Please accept the terms and conditions");
    isValid = false;
  }
  
  if (isValid) {
    try {
      const role = ADMIN_EMAILS.includes(em) ? 'admin' : 'user';
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          fullName: fn,
          email: em,
          password: ps,
          role:role
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
       
        throw new Error(data.message || 'Registration failed');
      }
      
     
      localStorage.setItem('token', data.token);
     localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        window.location.href = 'adminDashboard.html';
      } else {
        window.location.href = 'userDashboard.html';
      }
      
    } catch (error) {
      showError("email", error.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    }
  }
}

function showError(id,msg){
    const input=document.getElementById(id);
    const next=input.nextElementSibling;

    if(next && next.classList.contains('error')){
        next.textContent=msg;
    }

    let ele=document.createElement('p');
    ele.textContent=`* ${msg} *`;
    ele.className="error";
    ele.style.color="red";
    ele.style.fontSize="18px";
    input.insertAdjacentElement("afterend",ele);
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    const next = input.nextElementSibling;
    if (next && next.classList.contains('error')) {
        next.remove();
    }
}
