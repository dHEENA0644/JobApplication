// -------- Local Storage Setup --------
let users = JSON.parse(localStorage.getItem('users')) || {};
let applications = JSON.parse(localStorage.getItem('applications')) || {};
let currentUser = localStorage.getItem('currentUser');

// -------- Page Navigation --------
function showLogin() {
  hideAll();
  document.getElementById('loginPage').style.display = 'block';
}

function showSignup() {
  hideAll();
  document.getElementById('signupPage').style.display = 'block';
}

function showMainMenu() {
  hideAll();
  document.getElementById('mainMenu').style.display = 'block';
}

function hideAll() {
  document.querySelectorAll('.container').forEach(c => c.style.display = 'none');
}

// -------- Account System --------
function register() {
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if (!isValidEmail(email)) {
    alert("Invalid email format!");
    return;
  }
  if (users[email]) {
    alert("Account already exists!");
    return;
  }

  users[email] = hashPassword(password);
  applications[email] = [];
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('applications', JSON.stringify(applications));

  alert("Account created successfully!");
  showLogin();
}

function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!isValidEmail(email)) {
    alert("Invalid email format!");
    return;
  }

  if (users[email] && users[email] === hashPassword(password)) {
    currentUser = email;
    localStorage.setItem('currentUser', email);
    showMainMenu();
  } else {
    alert("Incorrect email or password!");
  }
}

function forgotPassword() {
  const email = document.getElementById('loginEmail').value.trim();
  if (users[email]) {
    alert("Password recovery unavailable (encrypted). Contact admin.");
  } else {
    alert("Email not found.");
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showLogin();
}

// -------- Application Management --------
function showAddForm() {
  const jobTitles = ["Software Engineer", "Data Analyst", "Web Developer", "Project Manager"];
  const companies = ["Google", "Microsoft", "Amazon", "Infosys"];
  const statuses = ["Applied", "Interview", "Offer Letter"];

  const jobName = prompt("Enter Job Title:", jobTitles[0]);
  const company = prompt("Enter Company Name:", companies[0]);
  const date = prompt("Enter Date (dd/MM/yyyy):");
  const status = prompt("Enter Status (Applied/Interview/Offer Letter):", statuses[0]);

  if (!jobName || !company || !date || !status) {
    alert("Please fill all fields.");
    return;
  }

  if (!isValidDate(date)) {
    alert("Invalid or past date! Use dd/MM/yyyy format.");
    return;
  }

  let list = applications[currentUser] || [];
  if (list.some(a => a.jobName === jobName && a.company === company)) {
    alert("Duplicate entry!");
    return;
  }

  list.push({ jobName, company, date, status });
  applications[currentUser] = list;
  localStorage.setItem('applications', JSON.stringify(applications));

  alert("Application added successfully!");
}

function viewApplications() {
  const list = applications[currentUser] || [];
  if (list.length === 0) {
    alert("No applications found!");
    return;
  }

  let output = "";
  list.forEach((a, i) => {
    output += `#${i + 1}\nJob: ${a.jobName}\nCompany: ${a.company}\nDate: ${a.date}\nStatus: ${a.status}\n\n`;
  });
  alert(output);
}

function updateStatus() {
  const list = applications[currentUser] || [];
  if (list.length === 0) return alert("No applications to update.");

  const num = parseInt(prompt("Enter application number to update:"));
  if (isNaN(num) || num < 1 || num > list.length) return alert("Invalid number!");

  const newStatus = prompt("Enter new status (Applied/Interview/Offer Letter):", list[num - 1].status);
  if (newStatus) {
    list[num - 1].status = newStatus;
    applications[currentUser] = list;
    localStorage.setItem('applications', JSON.stringify(applications));
    alert("Status updated successfully!");
  }
}

function deleteApplication() {
  const list = applications[currentUser] || [];
  if (list.length === 0) return alert("No applications to delete.");

  const num = parseInt(prompt("Enter application number to delete:"));
  if (isNaN(num) || num < 1 || num > list.length) return alert("Invalid number!");

  list.splice(num - 1, 1);
  applications[currentUser] = list;
  localStorage.setItem('applications', JSON.stringify(applications));
  alert("Application deleted!");
}

// -------- Helpers --------
function isValidEmail(email) {
  return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/.test(email);
}

function isValidDate(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  return !isNaN(inputDate) && inputDate >= today;
}

function hashPassword(str) {
  // Simple hash (not secure, just mimic SHA-256 behavior for demo)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

// -------- Start Page --------
if (currentUser) {
  showMainMenu();
} else {
  showLogin();
}
