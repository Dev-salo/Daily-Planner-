// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.settings-tab-btn');
    const tabContents = document.querySelectorAll('.settings-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and its content
            this.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');
        });
    });

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
                    location.reload(); // Reload for email change
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

    // ===== AVATAR SELECTION =====
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.addEventListener('click', function() {
            avatarOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            
            const avatar = this.dataset.avatar;
            const formData = new FormData();
            formData.append('avatar', avatar);
            
            fetch('/settings/update_avatar', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('navbarAvatar').src = `/static/images/${avatar}.svg`;
                    showToast('Avatar updated!', 'success');
                }
            })
            .catch(error => showToast('Error updating avatar', 'error'));
        });
    });

    // ===== APPEARANCE SECTION =====
    const bgColorPicker = document.getElementById('bgColorPicker');
    const bgColorValue = document.getElementById('bgColorValue');
    
    if (bgColorPicker) {
        bgColorPicker.addEventListener('change', function() {
            const color = this.value;
            bgColorValue.value = color;
            document.body.style.backgroundColor = color;
            
            const formData = new FormData();
            formData.append('bg_color', color);
            
            fetch('/settings/update_bg_color', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Background color saved!', 'success');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    // ===== THEME =====
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

    // ===== TASK VIEW =====
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    const taskView = localStorage.getItem('taskView') || 'grid';
    if (taskView === 'list') {
        listViewBtn?.classList.add('active');
    } else {
        gridViewBtn?.classList.add('active');
    }

    gridViewBtn?.addEventListener('click', function() {
        localStorage.setItem('taskView', 'grid');
        this.classList.add('active');
        listViewBtn?.classList.remove('active');
        showToast('Task view changed to Grid', 'success');
    });

    listViewBtn?.addEventListener('click', function() {
        localStorage.setItem('taskView', 'list');
        this.classList.add('active');
        gridViewBtn?.classList.remove('active');
        showToast('Task view changed to List', 'success');
    });

    // ===== NOTIFICATION SETTINGS =====
    const browserNotifToggle = document.getElementById('browserNotifToggle');
    const emailRemindToggle = document.getElementById('emailRemindToggle');
    const soundToggle = document.getElementById('soundToggle');
    const reminderTime = document.getElementById('reminderTime');

    [browserNotifToggle, emailRemindToggle, soundToggle, reminderTime].forEach(el => {
        if (el) {
            el.addEventListener('change', function() {
                const formData = new FormData();
                formData.append('notifications_enabled', browserNotifToggle?.checked ? 1 : 0);
                formData.append('email_reminders', emailRemindToggle?.checked ? 1 : 0);
                formData.append('sound_enabled', soundToggle?.checked ? 1 : 0);
                formData.append('reminder_time', reminderTime?.value || 10);
                
                fetch('/settings/update_notifications', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast('Notification settings saved!', 'success');
                    }
                })
                .catch(error => console.error('Error:', error));
            });
        }
    });

    // ===== TASK PREFERENCES =====
    const defaultPriority = document.getElementById('defaultPriority');
    const autoTimerToggle = document.getElementById('autoTimerToggle');
    const showCompletedToggle = document.getElementById('showCompletedToggle');

    [defaultPriority, autoTimerToggle, showCompletedToggle].forEach(el => {
        if (el) {
            el.addEventListener('change', function() {
                const formData = new FormData();
                formData.append('default_priority', defaultPriority?.value || 'medium');
                formData.append('auto_start_timer', autoTimerToggle?.checked ? 1 : 0);
                formData.append('show_completed_graph', showCompletedToggle?.checked ? 1 : 0);
                
                fetch('/settings/update_task_prefs', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast('Task preferences saved!', 'success');
                    }
                })
                .catch(error => console.error('Error:', error));
            });
        }
    });

    // ===== PRODUCTIVITY SETTINGS =====
    const savePomodoroBtn = document.getElementById('savePomodoroBtn');
    if (savePomodoroBtn) {
        savePomodoroBtn.addEventListener('click', function() {
            const formData = new FormData();
            formData.append('pomodoro_enabled', document.getElementById('pomodoroToggle').checked ? 1 : 0);
            formData.append('work_duration', document.getElementById('workDuration').value);
            formData.append('break_duration', document.getElementById('breakDuration').value);
            formData.append('animations_enabled', document.getElementById('animationsToggle').checked ? 1 : 0);
            
            fetch('/settings/update_productivity', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Productivity settings saved!', 'success');
                }
            })
            .catch(error => showToast('Error saving settings', 'error'));
        });
    }

    // ===== DATA MANAGEMENT =====
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.addEventListener('click', function() {
            showToast('Creating backup...', 'info');
            fetch('/settings/backup_data', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Backup created successfully!', 'success');
                    // Download the backup file
                    const element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data.backup, null, 2)));
                    element.setAttribute('download', `backup_${new Date().toISOString().split('T')[0]}.json`);
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }
            })
            .catch(error => showToast('Error creating backup', 'error'));
        });
    }

    const deleteCompletedBtn = document.getElementById('deleteCompletedBtn');
    if (deleteCompletedBtn) {
        deleteCompletedBtn.addEventListener('click', function(e) {
            if (confirm('Delete all completed tasks? This action cannot be undone.')) {
                fetch('/settings/delete_completed_tasks', {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast(`Deleted ${data.deleted} completed tasks`, 'success');
                    }
                })
                .catch(error => showToast('Error deleting tasks', 'error'));
            }
        });
    }

    // ===== SECURITY SETTINGS =====
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

    const logoutAllBtn = document.getElementById('logoutAllBtn');
    if (logoutAllBtn) {
        logoutAllBtn.addEventListener('click', function() {
            if (confirm('Logout from all devices?')) {
                fetch('/settings/logout_all', {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast('Logged out from all devices', 'success');
                        setTimeout(() => window.location.href = '/login', 1500);
                    }
                })
                .catch(error => showToast('Error', 'error'));
            }
        });
    }

    // ===== APP PREFERENCES =====
    const saveAppPrefBtn = document.getElementById('saveAppPrefBtn');
    if (saveAppPrefBtn) {
        saveAppPrefBtn.addEventListener('click', function() {
            const formData = new FormData();
            formData.append('default_homepage', document.getElementById('homepage').value);
            formData.append('language', document.getElementById('language').value);
            formData.append('timezone', document.getElementById('timezoneSelect').value);
            formData.append('calendar_view', document.getElementById('calendarViewSelect').value);
            
            fetch('/settings/update_app_prefs', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('App preferences saved!', 'success');
                }
            })
            .catch(error => showToast('Error saving preferences', 'error'));
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

    function deleteAccount() {
        const password = prompt('Enter your password to confirm account deletion:');
        if (password) {
            const formData = new FormData();
            formData.append('password', password);
            
            fetch('/settings/delete_account', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Account deleted. Redirecting...', 'success');
                    setTimeout(() => window.location.href = '/', 2000);
                } else {
                    showToast(data.message, 'error');
                }
            })
            .catch(error => showToast('Error deleting account', 'error'));
        }
    }

    window.deleteAccount = deleteAccount;

    function exportTasks(format) {
        const link = document.createElement('a');
        link.href = `/tasks/export/${format}`;
        link.download = `tasks.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    window.exportTasks = exportTasks;
});
