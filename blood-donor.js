// API Configuration
const API_URL = 'http://localhost:3000/api';

// Initialize donors array
let donors = [];

// DOM Elements
const donorForm = document.getElementById('donor-form');
const donorNameInput = document.getElementById('donor-name');
const bloodTypeInput = document.getElementById('blood-type');
const contactTypeInput = document.getElementById('contact-type');
const contactDetailsInput = document.getElementById('contact-details');
const contactHint = document.getElementById('contact-hint');
const donorTbody = document.getElementById('donor-tbody');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const editIndexInput = document.getElementById('edit-index');
const filterBloodType = document.getElementById('filter-blood-type');
const statsGrid = document.getElementById('stats-grid');

// Load donors on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDonors();
});

// Contact type change event
contactTypeInput.addEventListener('change', () => {
    const type = contactTypeInput.value;
    if (type === 'phone') {
        contactDetailsInput.placeholder = 'Enter 10-digit phone number';
        contactHint.textContent = 'Only numbers allowed (e.g., 1234567890)';
    } else if (type === 'email') {
        contactDetailsInput.placeholder = 'Enter email ending with @gmail.com';
        contactHint.textContent = 'Must end with @gmail.com';
    } else {
        contactDetailsInput.placeholder = 'Enter phone or email';
        contactHint.textContent = '';
    }
    contactDetailsInput.value = '';
});

// Validation functions
function validateName(name) {
    // Only letters and spaces allowed
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name);
}

function validatePhone(phone) {
    // Only numbers allowed, 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

function validateEmail(email) {
    // Must end with @gmail.com
    const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    return emailRegex.test(email);
}

// Form submit event
donorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const donorName = donorNameInput.value.trim();
    const bloodType = bloodTypeInput.value;
    const contactType = contactTypeInput.value;
    const contactDetails = contactDetailsInput.value.trim();
    
    // Validate name - only characters
    if (!validateName(donorName)) {
        alert('❌ Name should only contain letters and spaces!');
        donorNameInput.focus();
        return;
    }
    
    // Validate contact based on type
    if (contactType === 'phone') {
        if (!validatePhone(contactDetails)) {
            alert('❌ Phone number must be exactly 10 digits with only numbers!');
            contactDetailsInput.focus();
            return;
        }
    } else if (contactType === 'email') {
        if (!validateEmail(contactDetails)) {
            alert('❌ Email must end with @gmail.com!');
            contactDetailsInput.focus();
            return;
        }
    }
    
    const editIndex = editIndexInput.value;
    
    if (editIndex === '') {
        // Add new donor
        addDonor(donorName, bloodType, contactType, contactDetails);
    } else {
        // Update existing donor
        updateDonor(parseInt(editIndex), donorName, bloodType, contactType, contactDetails);
    }
    
    resetForm();
});

// Cancel button event
cancelBtn.addEventListener('click', () => {
    resetForm();
});

// Filter by blood type
filterBloodType.addEventListener('change', () => {
    loadDonors();
});

// Load donors from API
async function loadDonors() {
    try {
        const filterValue = filterBloodType.value;
        const url = filterValue 
            ? `${API_URL}/donors/bloodtype/${filterValue}`
            : `${API_URL}/donors`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load donors');
        
        donors = await response.json();
        renderDonors();
        await loadStats();
    } catch (error) {
        console.error('Error loading donors:', error);
        alert('❌ Error connecting to server. Make sure the backend is running!');
    }
}

// Load statistics from API
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        if (!response.ok) throw new Error('Failed to load stats');
        
        const stats = await response.json();
        updateStats(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Add donor function
async function addDonor(name, bloodType, contactType, contact) {
    try {
        const donor = {
            name: name,
            bloodType: bloodType,
            contactType: contactType,
            contact: contact
        };
        
        const response = await fetch(`${API_URL}/donors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(donor)
        });
        
        if (!response.ok) throw new Error('Failed to add donor');
        
        alert('✅ Donor added successfully!');
        await loadDonors();
    } catch (error) {
        console.error('Error adding donor:', error);
        alert('❌ Error adding donor!');
    }
}

// Update donor function
async function updateDonor(index, name, bloodType, contactType, contact) {
    try {
        const donorId = donors[index]._id;
        const updatedData = {
            name: name,
            bloodType: bloodType,
            contactType: contactType,
            contact: contact
        };
        
        const response = await fetch(`${API_URL}/donors/${donorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });
        
        if (!response.ok) throw new Error('Failed to update donor');
        
        alert('✅ Donor updated successfully!');
        await loadDonors();
    } catch (error) {
        console.error('Error updating donor:', error);
        alert('❌ Error updating donor!');
    }
}

// Edit donor function
function editDonor(index) {
    const donor = donors[index];
    
    donorNameInput.value = donor.name;
    bloodTypeInput.value = donor.bloodType;
    contactTypeInput.value = donor.contactType || 'phone';
    
    // Trigger contact type change to update placeholder
    contactTypeInput.dispatchEvent(new Event('change'));
    
    contactDetailsInput.value = donor.contact;
    editIndexInput.value = index;
    
    formTitle.textContent = 'Edit Donor';
    submitBtn.textContent = 'Update Donor';
    cancelBtn.style.display = 'inline-block';
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete donor function
async function deleteDonor(index) {
    const donor = donors[index];
    if (confirm(`Are you sure you want to delete ${donor.name} (${donor.bloodType})?`)) {
        try {
            const response = await fetch(`${API_URL}/donors/${donor._id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete donor');
            
            alert('✅ Donor deleted successfully!');
            await loadDonors();
        } catch (error) {
            console.error('Error deleting donor:', error);
            alert('❌ Error deleting donor!');
        }
    }
}

// Render donors table
function renderDonors() {
    donorTbody.innerHTML = '';
    
    if (donors.length === 0) {
        donorTbody.innerHTML = `<tr><td colspan="4" class="no-data">No donors added yet</td></tr>`;
        return;
    }
    
    donors.forEach((donor, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${donor.name}</td>
            <td><span class="blood-type-badge">${donor.bloodType}</span></td>
            <td>${donor.contact}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editDonor(${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteDonor(${index})">Delete</button>
            </td>
        `;
        donorTbody.appendChild(row);
    });
}

// Update statistics
function updateStats(stats) {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    // Generate stats HTML
    let statsHTML = `
        <div class="stat-card">
            <div class="stat-number">${stats.total || 0}</div>
            <div class="stat-label">Total Donors</div>
        </div>
    `;
    
    bloodTypes.forEach(type => {
        if (stats.bloodTypes && stats.bloodTypes[type] > 0) {
            statsHTML += `
                <div class="stat-card">
                    <div class="stat-number">${stats.bloodTypes[type]}</div>
                    <div class="stat-label">${type}</div>
                </div>
            `;
        }
    });
    
    statsGrid.innerHTML = statsHTML;
}

// Reset form
function resetForm() {
    donorForm.reset();
    editIndexInput.value = '';
    formTitle.textContent = 'Add New Donor';
    submitBtn.textContent = 'Add Donor';
    cancelBtn.style.display = 'none';
}


