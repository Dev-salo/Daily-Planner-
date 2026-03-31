// Simplified Settings Page Controller
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== PROFILE SECTION =====
    const updateUsernameBtn = document.getElementById('updateUsernameBtn');
    if (updateUsernameBtn) {
        updateUsernameBtn.addEventListener('click', function() {
            const newUsername = document.getElementById('newUsername').value;
            if (!newUsername) {
                showToast('Please enter a username', 'warning');
                return;
            }
            updateProfile('username', newUsername);
        });
    }

    const updateEmailBtn = document.getElementById('updateEmailBtn');
    if (updateEmailBtn) {
        updateEmailBtn.addEventListener('click', function() {
            const newEmail = document.getElementById('newEmail').value;
            if (!newEmail) {
                showToast('Please enter an email', 'warning');
                return;
            }
            updateProfile('email', newEmail);
        });
    }

    function updateProfile(field, value) {
        const formData = new FormData();
        formData.append(field, value);
        
        fetch('/settings/update_profile', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`, 'success');
                if (field === 'username') {
                    document.getElementById('newUsername').value = value;
                } else {
                    location.reload();
                }
            } else {
                showToast(data.message || 'Error updating profile', 'error');
            }
        })
        .catch(error => {
            showToast('Error updating profile', 'error');
            console.error('Error:', error);
        });
    }

    // ===== APPEARANCE SECTION =====
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        darkThemeBtn?.classList.add('active');
    } else {
        lightThemeBtn?.classList.add('active');
    }

    lightThemeBtn?.addEventListener('click', function() {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        this.classList.add('active');
        darkThemeBtn?.classList.remove('active');
        showToast('Switched to Light mode', 'success');
    });

    darkThemeBtn?.addEventListener('click', function() {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        this.classList.add('active');
        lightThemeBtn?.classList.remove('active');
        showToast('Switched to Dark mode', 'success');
    });

    // ===== DISPLAY MODE =====
    const compactViewBtn = document.getElementById('compactViewBtn');
    const expandedViewBtn = document.getElementById('expandedViewBtn');
    
    const displayMode = localStorage.getItem('displayMode') || 'expanded';
    if (displayMode === 'compact') {
        compactViewBtn?.classList.add('active');
        document.body.classList.add('compact-mode');
    } else {
        expandedViewBtn?.classList.add('active');
    }

    compactViewBtn?.addEventListener('click', function() {
        document.body.classList.add('compact-mode');
        localStorage.setItem('displayMode', 'compact');
        this.classList.add('active');
        expandedViewBtn?.classList.remove('active');
        showToast('Switched to Compact mode', 'success');
    });

    expandedViewBtn?.addEventListener('click', function() {
        document.body.classList.remove('compact-mode');
        localStorage.setItem('displayMode', 'expanded');
        this.classList.add('active');
        compactViewBtn?.classList.remove('active');
        showToast('Switched to Expanded mode', 'success');
    });

    // ===== CALENDAR VIEW =====
    const calendarViewSelect = document.getElementById('calendarViewSelect');
    if (calendarViewSelect) {
        calendarViewSelect.addEventListener('change', function() {
            const formData = new FormData();
            formData.append('calendar_view', this.value);
            
            fetch('/settings/update_timezone', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Calendar view updated!', 'success');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    // ===== TIMEZONE =====
    const timezoneSelect = document.getElementById('timezoneSelect');
    if (timezoneSelect) {
        timezoneSelect.addEventListener('change', function() {
            const formData = new FormData();
            formData.append('timezone', this.value);
            
            fetch('/settings/update_timezone', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Timezone updated!', 'success');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    // ===== SESSION TIMEOUT =====
    const sessionTimeoutSelect = document.getElementById('sessionTimeoutSelect');
    if (sessionTimeoutSelect) {
        sessionTimeoutSelect.addEventListener('change', function() {
            const formData = new FormData();
            formData.append('session_timeout', this.value);
            
            fetch('/settings/update_session_timeout', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(`Session timeout set to ${this.value} minutes`, 'success');
                } else {
                    showToast(data.message || 'Error updating session timeout', 'error');
                }
            })
            .catch(error => {
                showToast('Error updating session timeout', 'error');
                console.error('Error:', error);
            });
        });
    }

    // ===== PASSWORD CHANGE =====
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPwd = document.getElementById('currentPassword').value;
            const newPwd = document.getElementById('newPassword').value;
            const confirmPwd = document.getElementById('confirmPassword').value;
            
            if (newPwd !== confirmPwd) {
                showToast('Passwords do not match!', 'error');
                return;
            }
            
            const formData = new FormData();
            formData.append('current_password', currentPwd);
            formData.append('new_password', newPwd);
            formData.append('confirm_password', confirmPwd);
            
            fetch('/settings/change_password', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Password changed successfully!', 'success');
                    passwordChangeForm.reset();
                } else {
                    showToast(data.message, 'error');
                }
            })
            .catch(error => showToast('Error changing password', 'error'));
        });
    }

    // ===== BACKGROUND COLOR =====
    const bgColorRadios = document.querySelectorAll('.bg-color-radio');
    const bgCustom = document.getElementById('bgCustom');
    
    const savedBgColor = localStorage.getItem('bgColor') || 'light';
    
    function applyBackgroundColor(color) {
        const bgColorMap = {
            'light': '#e8ecf1',
            'dark': '#1a1d23',
            'blue': '#e3f2fd',
            'green': '#e8f5e9',
            'purple': '#f3e5f5'
        };
        
        const bgColor = bgColorMap[color] || color;
        document.documentElement.style.setProperty('--light-bg', bgColor);
        document.body.style.backgroundColor = bgColor;
        localStorage.setItem('bgColor', color);
        
        // Update radio button active state
        bgColorRadios.forEach(radio => {
            radio.checked = radio.value === color;
        });
    }
    
    // Apply saved background color on load
    if (savedBgColor && savedBgColor !== 'light') {
        applyBackgroundColor(savedBgColor);
        document.getElementById('bg' + savedBgColor.charAt(0).toUpperCase() + savedBgColor.slice(1))?.click();
    }
    
    // Handle preset color selections
    bgColorRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value !== 'custom') {
                applyBackgroundColor(this.value);
                showToast(`Background color changed to ${this.value.charAt(0).toUpperCase() + this.value.slice(1)}`, 'success');
            }
        });
    });
    
    // Handle custom color selection
    if (bgCustom) {
        bgCustom.addEventListener('change', function() {
            const color = this.value;
            document.documentElement.style.setProperty('--light-bg', color);
            document.body.style.backgroundColor = color;
            localStorage.setItem('bgColor', color);
            showToast('Background color customized', 'success');
        });
    }

    // ===== UTILITY FUNCTIONS =====
    function showToast(message, type) {
        const toastContainer = document.getElementById('toast-container') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast show align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        setTimeout(() => toast.remove(), 4000);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }
});
