document.addEventListener('DOMContentLoaded', function() {
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const compactViewBtn = document.getElementById('compactViewBtn');
    const expandedViewBtn = document.getElementById('expandedViewBtn');
    const dayViewBtn = document.getElementById('dayViewBtn');
    const weekViewBtn = document.getElementById('weekViewBtn');
    const monthViewBtn = document.getElementById('monthViewBtn');
    const testNotificationBtn = document.getElementById('testNotificationBtn');

    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        darkThemeBtn.classList.add('active');
        darkThemeBtn.classList.remove('btn-outline-secondary');
        darkThemeBtn.classList.add('btn-secondary');
    } else {
        lightThemeBtn.classList.add('active');
        lightThemeBtn.classList.remove('btn-outline-secondary');
        lightThemeBtn.classList.add('btn-secondary');
    }

    lightThemeBtn.addEventListener('click', function() {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        
        lightThemeBtn.classList.remove('btn-outline-secondary');
        lightThemeBtn.classList.add('btn-secondary');
        darkThemeBtn.classList.remove('btn-secondary');
        darkThemeBtn.classList.add('btn-outline-secondary');
        
        showToast('Theme changed to Light mode', 'success');
    });

    darkThemeBtn.addEventListener('click', function() {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        
        darkThemeBtn.classList.remove('btn-outline-secondary');
        darkThemeBtn.classList.add('btn-secondary');
        lightThemeBtn.classList.remove('btn-secondary');
        lightThemeBtn.classList.add('btn-outline-secondary');
        
        showToast('Theme changed to Dark mode', 'success');
    });

    const taskView = localStorage.getItem('taskView') || 'grid';
    if (taskView === 'grid') {
        gridViewBtn.classList.add('active', 'btn-secondary');
        gridViewBtn.classList.remove('btn-outline-secondary');
    } else {
        listViewBtn.classList.add('active', 'btn-secondary');
        listViewBtn.classList.remove('btn-outline-secondary');
    }

    gridViewBtn.addEventListener('click', function() {
        localStorage.setItem('taskView', 'grid');
        gridViewBtn.classList.remove('btn-outline-secondary');
        gridViewBtn.classList.add('btn-secondary');
        listViewBtn.classList.remove('btn-secondary');
        listViewBtn.classList.add('btn-outline-secondary');
        showToast('Task view changed to Grid', 'success');
    });

    listViewBtn.addEventListener('click', function() {
        localStorage.setItem('taskView', 'list');
        listViewBtn.classList.remove('btn-outline-secondary');
        listViewBtn.classList.add('btn-secondary');
        gridViewBtn.classList.remove('btn-secondary');
        gridViewBtn.classList.add('btn-outline-secondary');
        showToast('Task view changed to List', 'success');
    });

    const displayMode = localStorage.getItem('displayMode') || 'expanded';
    if (displayMode === 'compact') {
        compactViewBtn.classList.add('active', 'btn-secondary');
        compactViewBtn.classList.remove('btn-outline-secondary');
    } else {
        expandedViewBtn.classList.add('active', 'btn-secondary');
        expandedViewBtn.classList.remove('btn-outline-secondary');
    }

    compactViewBtn.addEventListener('click', function() {
        localStorage.setItem('displayMode', 'compact');
        compactViewBtn.classList.remove('btn-outline-secondary');
        compactViewBtn.classList.add('btn-secondary');
        expandedViewBtn.classList.remove('btn-secondary');
        expandedViewBtn.classList.add('btn-outline-secondary');
        showToast('Display mode changed to Compact', 'success');
    });

    expandedViewBtn.addEventListener('click', function() {
        localStorage.setItem('displayMode', 'expanded');
        expandedViewBtn.classList.remove('btn-outline-secondary');
        expandedViewBtn.classList.add('btn-secondary');
        compactViewBtn.classList.remove('btn-secondary');
        compactViewBtn.classList.add('btn-outline-secondary');
        showToast('Display mode changed to Expanded', 'success');
    });

    const calendarView = localStorage.getItem('calendarView') || 'month';
    const calendarButtons = [dayViewBtn, weekViewBtn, monthViewBtn];
    calendarButtons.forEach(btn => {
        if (btn.id === `${calendarView}ViewBtn`) {
            btn.classList.add('active', 'btn-secondary');
            btn.classList.remove('btn-outline-secondary');
        }
    });

    dayViewBtn.addEventListener('click', function() {
        setCalendarView('day', calendarButtons);
    });

    weekViewBtn.addEventListener('click', function() {
        setCalendarView('week', calendarButtons);
    });

    monthViewBtn.addEventListener('click', function() {
        setCalendarView('month', calendarButtons);
    });

    function setCalendarView(view, buttons) {
        localStorage.setItem('calendarView', view);
        buttons.forEach(btn => {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-outline-secondary');
        });
        const activeBtn = document.getElementById(`${view}ViewBtn`);
        activeBtn.classList.remove('btn-outline-secondary');
        activeBtn.classList.add('btn-secondary');
        showToast(`Calendar view changed to ${view.charAt(0).toUpperCase() + view.slice(1)}`, 'success');
    }

    testNotificationBtn.addEventListener('click', function() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('Daily Planner', {
                    body: 'This is a test notification!',
                    icon: '/static/images/icon.png'
                });
                showToast('Test notification sent!', 'success');
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('Daily Planner', {
                            body: 'Notifications enabled successfully!',
                            icon: '/static/images/icon.png'
                        });
                        showToast('Notifications enabled!', 'success');
                    }
                });
            } else {
                showToast('Notifications are blocked. Please enable them in your browser settings.', 'error');
            }
        } else {
            showToast('Your browser does not support notifications.', 'error');
        }
    });

    function showToast(message, type) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast show align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
    
    // --- TIMEZONE AUTO-SAVE LOGIC ---
    const timezoneSelect = document.getElementById('timezoneSelect');
    if (timezoneSelect) {
        timezoneSelect.addEventListener('change', function() {
            const tzSpinner = document.getElementById('tz-spinner');
            const tzSuccess = document.getElementById('tz-success');
            
            tzSpinner.classList.remove('d-none');
            tzSuccess.classList.add('d-none');
            
            const formData = new FormData();
            formData.append('timezone', this.value);
            
            fetch('/settings/update_timezone', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                tzSpinner.classList.add('d-none');
                if (data.success) {
                    tzSuccess.classList.remove('d-none');
                    setTimeout(() => tzSuccess.classList.add('d-none'), 3000);
                } else {
                    showToast('Failed to save timezone: ' + data.message, 'error');
                }
            })
            .catch(error => {
                tzSpinner.classList.add('d-none');
                showToast('Network error while saving timezone.', 'error');
                console.error('Error:', error);
            });
        });
    }

    // --- CHANGE PASSWORD LOGIC ---
    const pwdForm = document.getElementById('passwordChangeForm');
    if (pwdForm) {
        pwdForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPwd = document.getElementById('currentPassword').value;
            const newPwd = document.getElementById('newPassword').value;
            const confirmPwd = document.getElementById('confirmPassword').value;
            const alertBox = document.getElementById('pwd-alert');
            const submitBtn = document.getElementById('pwd-submit');
            
            // Basic validation
            if (newPwd !== confirmPwd) {
                alertBox.className = 'alert alert-danger';
                alertBox.textContent = 'New passwords do not match!';
                alertBox.classList.remove('d-none');
                return;
            }
            if (newPwd.length < 6) {
                alertBox.className = 'alert alert-warning';
                alertBox.textContent = 'Password must be at least 6 characters.';
                alertBox.classList.remove('d-none');
                return;
            }
            
            // Lock form down
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
            alertBox.classList.add('d-none');
            
            // Prepare package
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
                submitBtn.disabled = false;
                submitBtn.textContent = 'Change Password';
                
                alertBox.classList.remove('d-none');
                if (data.success) {
                    alertBox.className = 'alert alert-success';
                    alertBox.textContent = data.message;
                    pwdForm.reset(); // clear the inputs
                    setTimeout(() => alertBox.classList.add('d-none'), 4000); // hide success message eventually
                } else {
                    alertBox.className = 'alert alert-danger';
                    alertBox.textContent = data.message;
                }
            })
            .catch(error => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Change Password';
                alertBox.className = 'alert alert-danger';
                alertBox.textContent = 'Network error while contacting server.';
                alertBox.classList.remove('d-none');
                console.error('Error:', error);
            });
        });
    }

    // --- AVATAR SELECTION LOGIC ---
    const avatarOptions = document.querySelectorAll('.avatar-option');
    
    // Check both sessionStorage and data-selected attribute from server
    avatarOptions.forEach(option => {
        if (option.dataset.selected === 'true') {
            option.classList.add('selected');
        }
        
        option.addEventListener('click', function() {
            avatarOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            
            const avatar = this.dataset.avatar;
            sessionStorage.setItem('currentAvatar', avatar);
            
            // Update navbar avatar
            document.getElementById('navbarAvatar').src = `/static/images/${avatar}.svg`;
            
            // Save to server
            const formData = new FormData();
            formData.append('avatar', avatar);
            
            fetch('/settings/update_avatar', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Avatar updated successfully!', 'success');
                } else {
                    showToast('Failed to update avatar', 'error');
                }
            })
            .catch(error => {
                showToast('Error updating avatar', 'error');
                console.error('Error:', error);
            });
        });
    });

    // --- BACKGROUND COLOR LOGIC ---
    const bgColorPicker = document.getElementById('bgColorPicker');
    const bgColorValue = document.getElementById('bgColorValue');
    
    if (bgColorPicker) {
        const savedColor = sessionStorage.getItem('bgColor') || '#e8ecf1';
        bgColorPicker.value = savedColor;
        bgColorValue.value = savedColor;
        document.body.style.backgroundColor = savedColor;
        
        bgColorPicker.addEventListener('change', function() {
            const color = this.value;
            bgColorValue.value = color;
            document.body.style.backgroundColor = color;
            sessionStorage.setItem('bgColor', color);
            
            // Save to server
            const formData = new FormData();
            formData.append('bg_color', color);
            
            fetch('/settings/update_bg_color', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Background color updated!', 'success');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    // --- DISPLAY MODE LOGIC (Enhanced) ---
    if (compactViewBtn && expandedViewBtn) {
        const displayMode = sessionStorage.getItem('displayMode') || 'expanded';
        
        if (displayMode === 'compact') {
            document.body.classList.add('compact-mode');
        }
        
        compactViewBtn.addEventListener('click', function() {
            document.body.classList.add('compact-mode');
            sessionStorage.setItem('displayMode', 'compact');
            showToast('Switched to Compact Mode', 'success');
        });
        
        expandedViewBtn.addEventListener('click', function() {
            document.body.classList.remove('compact-mode');
            sessionStorage.setItem('displayMode', 'expanded');
            showToast('Switched to Expanded Mode', 'success');
        });
    }
});
