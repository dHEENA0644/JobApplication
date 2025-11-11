const API_URL = 'http://localhost:8081/api';
let currentUser = localStorage.getItem('currentUser');
let currentEditingJobId = null;
let allJobs = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    showMainMenu();
    loadApplications();
  } else {
    showLogin();
  }
  
  // Set today's date as default for date input
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('jobDate');
  if (dateInput) {
    dateInput.value = today;
    dateInput.max = today; // Prevent future dates
  }
});

// Navigation Functions
function showLogin() {
  hideAll();
  document.getElementById('loginPage').style.display = 'block';
  clearForm('loginForm');
}

function showSignup() {
  hideAll();
  document.getElementById('signupPage').style.display = 'block';
  clearForm('signupForm');
}

function showMainMenu() {
  hideAll();
  document.getElementById('mainMenu').style.display = 'block';
  if (currentUser) {
    updateUserDisplay();
    loadApplications();
  }
}

function hideAll() {
  document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
}

function clearForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
  }
}

// User Display
function updateUserDisplay() {
  if (currentUser) {
    const emailDisplay = document.getElementById('userEmailDisplay');
    const userInitial = document.getElementById('userInitial');
    
    if (emailDisplay) {
      emailDisplay.textContent = currentUser;
    }
    
    if (userInitial) {
      userInitial.textContent = currentUser.charAt(0).toUpperCase();
    }
  }
}

// Authentication Functions
async function register() {
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if (!isValidEmail(email)) {
    showToast('Invalid email format!', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters!', 'error');
    return;
  }

  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.text();
    
    if (result === 'success') {
      showToast('Account created successfully!', 'success');
      setTimeout(() => showLogin(), 1000);
    } else if (result === 'email_exists') {
      showToast('Email already exists!', 'error');
    } else {
      showToast('Registration failed!', 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showToast('Error creating account. Please check if backend is running.', 'error');
  } finally {
    showLoading(false);
  }
}

async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!isValidEmail(email)) {
    showToast('Invalid email format!', 'error');
    return;
  }

  if (!password) {
    showToast('Please enter your password!', 'error');
    return;
  }

  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.text();
    
    if (result === 'success') {
      currentUser = email;
      localStorage.setItem('currentUser', email);
      showToast('Login successful!', 'success');
      setTimeout(() => {
        showMainMenu();
        loadApplications();
      }, 500);
    } else {
      showToast('Incorrect email or password!', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Error logging in. Please check if backend is running.', 'error');
  } finally {
    showLoading(false);
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  allJobs = [];
  showLogin();
  showToast('Logged out successfully', 'success');
}

// Application Management Functions
function showAddForm() {
  currentEditingJobId = null;
  document.getElementById('modalTitle').textContent = 'Add New Application';
  document.getElementById('applicationForm').reset();
  
  // Set today's date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('jobDate').value = today;
  document.getElementById('jobDate').max = today;
  
  document.getElementById('applicationModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('applicationModal').style.display = 'none';
  currentEditingJobId = null;
  document.getElementById('applicationForm').reset();
}

function editApplication(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;
  
  currentEditingJobId = jobId;
  document.getElementById('modalTitle').textContent = 'Edit Application';
  document.getElementById('jobPosition').value = job.position || '';
  document.getElementById('jobCompany').value = job.company || '';
  
  // Format date for input (YYYY-MM-DD)
  let dateStr = job.appliedDate;
  if (dateStr && dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }
  document.getElementById('jobDate').value = dateStr || '';
  document.getElementById('jobStatus').value = job.status || 'Applied';
  
  document.getElementById('applicationModal').style.display = 'flex';
}

async function saveApplication() {
  const position = document.getElementById('jobPosition').value.trim();
  const company = document.getElementById('jobCompany').value.trim();
  const date = document.getElementById('jobDate').value;
  const status = document.getElementById('jobStatus').value;

  if (!position || !company || !date || !status) {
    showToast('Please fill all fields!', 'error');
    return;
  }

  const job = {
    userEmail: currentUser,
    company: company,
    position: position,
    appliedDate: date,
    status: status
  };

  // If editing, add the ID
  if (currentEditingJobId) {
    job.id = currentEditingJobId;
  }

  showLoading(true);
  try {
    let response;
    if (currentEditingJobId) {
      // Update existing job - send all fields
      response = await fetch(`${API_URL}/updateStatus`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });
      
      const result = await response.text();
      if (result === 'updated' || result === 'success') {
        showToast('Application updated successfully!', 'success');
        closeModal();
        loadApplications();
      } else {
        showToast('Failed to update application', 'error');
      }
    } else {
      // Add new job
      response = await fetch(`${API_URL}/addJob`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });
      
      const result = await response.text();
      if (result === 'success') {
        showToast('Application added successfully!', 'success');
        closeModal();
        loadApplications();
      } else {
        showToast('Failed to add application', 'error');
      }
    }
  } catch (error) {
    console.error('Save error:', error);
    showToast('Error saving application. Please check if backend is running.', 'error');
  } finally {
    showLoading(false);
  }
}

async function loadApplications() {
  if (!currentUser) return;
  
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/getJobs?email=${encodeURIComponent(currentUser)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }
    
    const jobs = await response.json();
    allJobs = Array.isArray(jobs) ? jobs : [];
    
    displayApplications(allJobs);
    updateStats(allJobs);
  } catch (error) {
    console.error('Load error:', error);
    showToast('Error loading applications. Please check if backend is running.', 'error');
    allJobs = [];
    displayApplications([]);
    updateStats([]);
  } finally {
    showLoading(false);
  }
}

function displayApplications(jobs) {
  const container = document.getElementById('applicationsList');
  const emptyState = document.getElementById('emptyState');
  
  if (!container) return;
  
  if (jobs.length === 0) {
    container.innerHTML = '';
    if (emptyState) {
      container.appendChild(emptyState);
      emptyState.style.display = 'block';
    }
    return;
  }
  
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  container.innerHTML = jobs.map(job => {
    const date = formatDate(job.appliedDate);
    const statusClass = job.status ? job.status.toLowerCase() : 'applied';
    
    return `
      <div class="job-card status-${statusClass}">
        <div class="job-header">
          <div>
            <div class="job-title">${escapeHtml(job.position || 'N/A')}</div>
            <div class="job-company">${escapeHtml(job.company || 'N/A')}</div>
          </div>
          <span class="status-badge ${statusClass}">${escapeHtml(job.status || 'Applied')}</span>
        </div>
        <div class="job-date">Applied: ${date}</div>
        <div class="job-actions">
          <button class="btn btn-edit" onclick="editApplication(${job.id})">Edit</button>
          <button class="btn btn-delete" onclick="deleteApplication(${job.id})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function updateStats(jobs) {
  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'Applied').length,
    interview: jobs.filter(j => j.status === 'Interview').length,
    offer: jobs.filter(j => j.status === 'Offer').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length
  };
  
  const totalEl = document.getElementById('totalJobs');
  const appliedEl = document.getElementById('appliedCount');
  const interviewEl = document.getElementById('interviewCount');
  const offerEl = document.getElementById('offerCount');
  const rejectedEl = document.getElementById('rejectedCount');
  
  if (totalEl) totalEl.textContent = stats.total;
  if (appliedEl) appliedEl.textContent = stats.applied;
  if (interviewEl) interviewEl.textContent = stats.interview;
  if (offerEl) offerEl.textContent = stats.offer;
  if (rejectedEl) rejectedEl.textContent = stats.rejected;
}

async function deleteApplication(jobId) {
  if (!confirm('Are you sure you want to delete this application?')) {
    return;
  }
  
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/deleteJob/${jobId}`, {
      method: 'DELETE'
    });
    
    const result = await response.text();
    if (result === 'deleted' || result === 'success') {
      showToast('Application deleted successfully!', 'success');
      loadApplications();
    } else {
      showToast('Failed to delete application', 'error');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Error deleting application. Please check if backend is running.', 'error');
  } finally {
    showLoading(false);
  }
}

function refreshApplications() {
  loadApplications();
  showToast('Applications refreshed!', 'success');
}

// Utility Functions
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    let date = dateString;
    if (date.includes('T')) {
      date = date.split('T')[0];
    }
    
    const d = new Date(date + 'T00:00:00');
    if (isNaN(d.getTime())) {
      return dateString;
    }
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

function isValidEmail(email) {
  return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/.test(email);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showLoading(show) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = show ? 'flex' : 'none';
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function forgotPassword() {
  showToast('Password reset functionality coming soon!', 'error');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('applicationModal');
  if (modal && e.target === modal) {
    closeModal();
  }
});

// Handle Enter key in forms
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('applicationModal');
    if (modal && modal.style.display !== 'none') {
      closeModal();
    }
  }
});

