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
});
