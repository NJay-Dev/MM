const form = document.getElementById('login-form')
const username_input = document.getElementById('username')
const password_input = document.getElementById('password')
const error_message = document.getElementById('error-message')

form.addEventListener('submit', (e) => {
  let errors = []
  
  // Validate username and password (replace with your actual validation logic)
  if (username_input.value === '' || password_input.value === '') {
    errors.push('Username and Password are required')
  }

  if (errors.length > 0) {
    e.preventDefault()
    error_message.innerText = errors.join(". ")
  } else {
    // Successful login
    const selectedLogin = document.querySelector('.login-type-btn.active').innerText;
    const redirectUrl = selectedLogin.includes('Employee') ? 'employee_dashboard.html' : 'admin_dashboard.html';
    window.location.href = redirectUrl;  // Redirect based on selected login type
  }
})