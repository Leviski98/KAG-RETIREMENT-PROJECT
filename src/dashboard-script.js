/**
 * KAG Retirement Project - Dashboard Script
 * Handles dashboard functionality, district and section management
 */

// Store data in localStorage
const STORAGE_KEYS = {
    DISTRICTS: 'kag_districts',
    SECTIONS: 'kag_sections',
    USER: 'kag_user'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    initializeDashboard();
});

// Simple REST API helpers for districts
const API_BASE = 'http://localhost:5000/api/v1';
async function apiListDistricts() {
    const r = await fetch(`${API_BASE}/districts`);
    if (!r.ok) throw new Error('Failed to load districts');
    return r.json();
}
async function apiCreateDistrict(payload) {
    const r = await fetch(`${API_BASE}/districts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('Failed to create district');
    return r.json();
}
async function apiUpdateDistrict(id, payload) {
    const r = await fetch(`${API_BASE}/districts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('Failed to update district');
    return r.json();
}
async function apiDeleteDistrict(id) {
    const r = await fetch(`${API_BASE}/districts/${id}`, { method: 'DELETE' });
    if (!(r.ok || r.status === 204)) throw new Error('Failed to delete district');
}

/**
 * Check if user is authenticated
 */
function checkAuthentication() {
    const user = sessionStorage.getItem(STORAGE_KEYS.USER);
    
    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    } else {
        const nameEl = document.getElementById('usernamePlaceholder');
        if (nameEl) {
            nameEl.textContent = user;
        }
    }
}

/**
 * Initialize dashboard functionality
 */
function initializeDashboard() {
    setupEventListeners();
    // Migrate any legacy storage keys to current ones
    migrateLegacyDistricts();
    loadDistricts();
    setupNavigation();
    log('Dashboard initialized');
}

/**
 * Setup event listeners for buttons and forms
 */
function setupEventListeners() {
    // District Modal
    document.getElementById('addDistrictBtn').addEventListener('click', openDistrictModal);
    document.getElementById('closeDistrictModal').addEventListener('click', closeDistrictModal);
    document.getElementById('districtForm').addEventListener('submit', handleAddDistrict);

    // Sections removed

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const districtModal = document.getElementById('districtModal');
        const sectionModal = document.getElementById('sectionModal');

        if (event.target === districtModal) {
            closeDistrictModal();
        }
        if (event.target === sectionModal) {
            closeSectionModal();
        }
    });
    // District search
    const searchBtn = document.getElementById('districtSearchBtn');
    const clearBtn = document.getElementById('districtClearSearchBtn');
    const searchInput = document.getElementById('districtSearchInput');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            const term = (searchInput.value || '').trim().toLowerCase();
            performDistrictSearch(term);
        });
    }
    if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            loadDistricts();
        });
    }
    // Trigger search on Enter key and add input debounce
    if (searchInput) {
        // Enter key triggers search
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const term = (searchInput.value || '').trim().toLowerCase();
                performDistrictSearch(term);
            }
        });
        // Debounced input search
        let debounceTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const term = (searchInput.value || '').trim().toLowerCase();
                if (term) {
                    performDistrictSearch(term);
                } else {
                    loadDistricts();
                }
            }, 300);
        });
    }
}

/**
 * Setup navigation link highlighting
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.classList.contains('logout-link')) {
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

/* ===== DISTRICT FUNCTIONS ===== */

/**
 * Load and display districts
 */
async function loadDistricts() {
    let districts = [];
    try {
        districts = await apiListDistricts();
    } catch (e) {
        // Fallback to localStorage if API not available
        districts = getDistricts();
    }
    const grid = document.getElementById('districtsGrid');
    
    grid.innerHTML = '';

    if (districts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-state-icon">📍</div>
                <h3>No Districts Yet</h3>
                <p>Click "Add District" to create your first district</p>
            </div>
        `;
    } else {
        districts.forEach(district => {
            const card = createDistrictCard(district);
            grid.appendChild(card);
        });
    }

    updateStats();
}

/**
 * Perform district search and render only matching district(s)
 * @param {string} term - lowercase name to search
 */
function performDistrictSearch(term) {
    const grid = document.getElementById('districtsGrid');
    grid.innerHTML = '';

    if (!term) {
        loadDistricts();
        return;
    }

    const matches = getDistricts().filter(d => (d.name || '').toLowerCase().includes(term));

    if (matches.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-state-icon">🔎</div>
                <h3>No matching districts</h3>
                <p>Try a different search term or Clear</p>
            </div>
        `;
        return;
    }

    matches.forEach(district => {
        const card = createDistrictCard(district);
        grid.appendChild(card);
    });
}

/**
 * Create a district card element
 * @param {Object} district - The district object
 * @returns {HTMLElement} - The district card element
 */
function createDistrictCard(district) {
    const sectionCount = typeof district.sectionCount === 'number' ? district.sectionCount : 0;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h3>📍 ${district.name}</h3>
        <div class="card-meta">
            <div class="meta-item">
                <strong>Sections:</strong>
                <span>${sectionCount}</span>
            </div>
            <div class="meta-item">
                <strong>Created:</strong>
                <span>${new Date(district.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn btn-secondary btn-sm" onclick="editDistrict('${district.id}')">Edit</button>
            <button class="btn btn-primary btn-sm" onclick="openDistrict('${district.id}')">Open District</button>
        </div>
    `;
    return card;
}

/**
 * Open district modal
 */
function openDistrictModal() {
    document.getElementById('districtModal').classList.add('show');
    document.getElementById('districtForm').reset();
    const sectionCountEl = document.getElementById('districtSectionCount');
    if (sectionCountEl) {
        sectionCountEl.value = '0';
    }
    // Set modal title and primary button for create mode
    const modalTitle = document.querySelector('#districtModal .modal-content h2');
    if (modalTitle) modalTitle.textContent = 'Add New District';
    const submitBtn = document.querySelector('#districtForm .btn.btn-primary');
    if (submitBtn) submitBtn.textContent = 'Add District';
    const deleteBtn = document.getElementById('deleteDistrictBtn');
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
        deleteBtn.dataset.targetDistrictId = '';
    }
    const editId = document.getElementById('editDistrictId');
    if (editId) editId.value = '';
}

/**
 * Close district modal
 */
function closeDistrictModal() {
    document.getElementById('districtModal').classList.remove('show');
    document.getElementById('districtForm').reset();
}

/**
 * Handle adding a new district
 * @param {Event} event - The form submit event
 */
async function handleAddDistrict(event) {
    event.preventDefault();

    const editId = document.getElementById('editDistrictId').value;
    const isEdit = Boolean(editId);
    const name = document.getElementById('districtName').value.trim();
    const sectionCount = parseInt(document.getElementById('districtSectionCount').value, 10) || 0;

    let district = {
        name,
        sectionCount,
        createdAt: new Date().toISOString()
    };

    if (validateDistrict(district)) {
        try {
            if (isEdit) {
                await apiUpdateDistrict(editId, { name, sectionCount });
                log(`District updated: ${name}`);
            } else {
                await apiCreateDistrict({ name, sectionCount });
                log(`District added: ${name}`);
            }
        } catch (err) {
            alert(`Save failed: ${err.message}`);
            return;
        }
        closeDistrictModal();
        loadDistricts();
    }
}

/**
 * Validate district data
 * @param {Object} district - The district object
 * @returns {boolean} - True if valid
 */
function validateDistrict(district) {
    if (!district.name || district.name.length < 2) {
        alert('District name must be at least 2 characters');
        return false;
    }
    if (typeof district.sectionCount !== 'number' || isNaN(district.sectionCount) || district.sectionCount < 0) {
        alert('Number of sections must be a non-negative integer');
        return false;
    }
    if (!Number.isInteger(district.sectionCount)) {
        alert('Number of sections must be an integer');
        return false;
    }
    return true;
}

/**
 * Delete a district
 * @param {string} id - The district ID
 */
async function deleteDistrict(id) {
    if (confirm('Are you sure you want to delete this district?')) {
        try {
            await apiDeleteDistrict(id);
        } catch (err) {
            alert(`Delete failed: ${err.message}`);
            return;
        }
        await loadDistricts();
        // If the edit modal is open, close it after successful deletion
        closeDistrictModal();
        log(`District deleted: ${id}`);
        showToast('District deleted successfully', 'success');
    }
}

/**
 * Edit a district (placeholder for future implementation)
 * @param {string} id - The district ID
 */
async function editDistrict(id) {
    let district;
    try {
        const districts = await apiListDistricts();
        district = districts.find(d => d.id === id);
    } catch (e) {
        const districts = getDistricts();
        district = districts.find(d => d.id === id);
    }
    
    if (district) {
        document.getElementById('districtName').value = district.name;
        const sectionCountEl = document.getElementById('districtSectionCount');
        if (sectionCountEl) {
            const count = typeof district.sectionCount === 'number' ? district.sectionCount : 0;
            sectionCountEl.value = String(count);
        }
        const editId = document.getElementById('editDistrictId');
        if (editId) editId.value = district.id;
        // Switch modal to edit mode: title and primary button
        const modalTitle = document.querySelector('#districtModal .modal-content h2');
        if (modalTitle) modalTitle.textContent = 'Edit District';
        const submitBtn = document.querySelector('#districtForm .btn.btn-primary');
        if (submitBtn) submitBtn.textContent = 'Save Changes';
        const deleteBtn = document.getElementById('deleteDistrictBtn');
        if (deleteBtn) {
            deleteBtn.style.display = 'inline-block';
            deleteBtn.dataset.targetDistrictId = district.id;
            deleteBtn.onclick = function() {
                deleteDistrict(district.id);
                closeDistrictModal();
            };
        }
        // Show modal without resetting (preserve prefilled edit data and labels)
        document.getElementById('districtModal').classList.add('show');
        log(`Editing district: ${id}`);
    }
}


/* ===== STORAGE FUNCTIONS ===== */

/**
 * Get all districts from localStorage
 * @returns {Array} - Array of district objects
 */
function getDistricts() {
    try {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.DISTRICTS)) || [];
        if (current && current.length) return current;
        // Fallback to legacy key 'districts' if present
        const legacy = JSON.parse(localStorage.getItem('districts')) || [];
        return legacy;
    } catch (e) {
        return [];
    }
}

/**
 * Add a district to localStorage
 * @param {Object} district - The district object
 */
function addDistrict(district) {
    const districts = getDistricts();
    districts.push(district);
    localStorage.setItem(STORAGE_KEYS.DISTRICTS, JSON.stringify(districts));
}

/**
 * Migrate legacy localStorage keys to current STORAGE_KEYS
 */
function migrateLegacyDistricts() {
    try {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.DISTRICTS)) || [];
        const legacy = JSON.parse(localStorage.getItem('districts')) || [];
        if ((!current || current.length === 0) && legacy && legacy.length > 0) {
            localStorage.setItem(STORAGE_KEYS.DISTRICTS, JSON.stringify(legacy));
            log(`Migrated ${legacy.length} districts from legacy storage key`);
        }
    } catch (e) {
        // ignore
    }
}

/**
 * Get all sections from localStorage
 * @returns {Array} - Array of section objects
 */

/**
 * Update dashboard statistics
 */
function updateStats() {
    const districts = getDistricts();
    const districtCountEl = document.getElementById('districtCount');
    if (districtCountEl) districtCountEl.textContent = districts.length;

    // Total Sections: sum of district.sectionCount (fallback to 0)
    const totalSections = districts.reduce((sum, d) => {
        const count = typeof d.sectionCount === 'number' ? d.sectionCount : 0;
        return sum + (Number.isFinite(count) ? count : 0);
    }, 0);
    const sectionTotalEl = document.getElementById('sectionTotal');
    if (sectionTotalEl) sectionTotalEl.textContent = totalSections;

    // Total Churches: sum churchCount from sections stored under `sections:<districtId>`
    const totalChurches = districts.reduce((sum, d) => {
        try {
            const items = JSON.parse(localStorage.getItem(`sections:${d.id}`)) || [];
            const churches = items.reduce((s, it) => s + (Number.isFinite(it.churchCount) ? it.churchCount : 0), 0);
            return sum + churches;
        } catch (e) {
            return sum;
        }
    }, 0);
    const churchTotalEl = document.getElementById('churchTotal');
    if (churchTotalEl) churchTotalEl.textContent = totalChurches;
}

/* ===== UTILITY FUNCTIONS ===== */

/**
 * Generate unique ID
 * @returns {string} - Unique ID
 */
function generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Handle logout
 */
function handleLogout(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    if (confirm('Are you sure you want to logout?')) {
        try {
            sessionStorage.removeItem(STORAGE_KEYS.USER);
        } catch (e) {
            // ignore
        }
        window.location.href = 'login.html';
        log('User logged out');
    }
}

/**
 * Utility function for logging
 * @param {string} message - The message to log
 */
function log(message) {
    console.log(`[KAG Dashboard] ${message}`);
}

/**
 * Open a district (placeholder action)
 * @param {string} id - The district ID
 */
function openDistrict(id) {
    const district = getDistricts().find(d => d.id === id);
    if (!district) {
        alert('District not found');
        return;
    }
    // Navigate to district page with id param
    window.location.href = `district.html?id=${encodeURIComponent(id)}&name=${encodeURIComponent(district.name)}`;
}

/**
 * Show toast/snackbar notification
 * @param {string} message
 * @param {'success'|'error'} type
 */
function showToast(message, type = 'success') {
    let toast = document.getElementById('kagToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'kagToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}
