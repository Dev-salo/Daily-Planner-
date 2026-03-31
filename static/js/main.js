const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function setTheme(theme) {
    if (!html) return;
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'bi bi-sun';
            } else {
                icon.className = 'bi bi-moon-stars';
            }
        }
    }
}

const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

setTimeout(requestNotificationPermission, 2000);

function showNotification(title, options) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
    }
}

// Store notified tasks to avoid duplicate notifications within same page visit
const notifiedTasks = JSON.parse(localStorage.getItem('notifiedTasks') || '{}');
// Track page visit sessions to reset notifications when user returns after leaving
const pageVisitSession = sessionStorage.getItem('pageVisitSession') || Math.random().toString(36);
sessionStorage.setItem('pageVisitSession', pageVisitSession);

function saveNotifiedTasks() {
    localStorage.setItem('notifiedTasks', JSON.stringify(notifiedTasks));
}

function playBellSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        // Create multiple bell tones with animation-like effect
        const frequencies = [800, 600, 800, 600, 800];
        let currentTime = now;
        
        frequencies.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            const startTime = currentTime + (index * 0.15);
            const duration = 0.15;
            
            gain.gain.setValueAtTime(0.5, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    } catch (e) {
        console.log('Audio not available');
    }
}

function playNotificationSound(notificationType) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        
        if (notificationType === 'alarm' || notificationType === 'timed') {
            // Create animated bell-like sound for alarm with animation class
            playBellSound();
            // Add visual animation to task card
            const taskCards = document.querySelectorAll('.task-card');
            taskCards.forEach(card => {
                card.style.animation = 'bell-ring 0.5s ease-in-out';
            });
        }
    } catch (e) {
        console.log('Audio not available');
    }
}

function checkTaskReminders() {
    // Only check on pages where tasks exist
    if (!document.querySelector('[data-task-id][data-task-time]')) {
        return;
    }
    
    fetch('/tasks/notifications')
        .then(response => response.json())
        .then(notifications => {
            notifications.forEach(notification => {
                const notificationKey = `task_${notification.id}_${pageVisitSession}`;
                
                // Get the task element to check notification type
                const taskElement = document.querySelector(`[data-task-id="${notification.id}"]`);
                const notificationType = taskElement ? taskElement.dataset.taskNotification : 'silent';
                
                // Check if we've already notified about this task in current session
                if (!notifiedTasks[notificationKey]) {
                    showTaskNotification(notification, notificationType);
                    notifiedTasks[notificationKey] = true;
                    saveNotifiedTasks();
                }
            });
        })
        .catch(error => console.log('Task reminder check failed:', error));
}

function showTaskNotification(notification, notificationType = 'silent') {
    let title = `📋 ${notification.name}`;
    let soundPlayed = false;
    
    if (notification.type === 'time_due') {
        title = `⏰ ${notification.name} - Time Now!`;
        
        // Only handle based on selected notification type
        if (notificationType === 'silent') {
            // Silent: Only notification in the UI, no sound, no browser notification
            showQuietNotification(title, `Time to work on this task!`);
        } else if (notificationType === 'alarm') {
            // Bell Ring Alarm: Play bell sound with animation, no browser notification
            playBellSound();
            addBellAnimation();
            soundPlayed = true;
        } else if (notificationType === 'timed') {
            // On-Time Bell Ring: Browser notification only, no sound
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body: 'Time to work on this task!',
                    icon: '/static/images/task-icon.png',
                    badge: '/static/images/task-badge.png',
                    tag: `task_${notification.id}`,
                    requireInteraction: true
                });
            }
        }
    } else if (notification.type === 'day_reminder') {
        title = `📌 ${notification.name}`;
        if (notificationType === 'silent') {
            showQuietNotification(title, `You have this task scheduled for today.`);
        } else if (notificationType === 'alarm') {
            playBellSound();
            addBellAnimation();
        } else if (notificationType === 'timed') {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body: 'You have this task scheduled for today.',
                    icon: '/static/images/task-icon.png',
                    badge: '/static/images/task-badge.png',
                    tag: `task_${notification.id}`
                });
            }
        }
    } else if (notification.type === 'overdue') {
        title = `⚠️ ${notification.name} - OVERDUE!`;
        if (notificationType === 'silent') {
            showQuietNotification(title, `This task is overdue. Please complete it as soon as possible.`);
        } else if (notificationType === 'alarm') {
            playBellSound();
            addBellAnimation();
        } else if (notificationType === 'timed') {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body: 'This task is overdue. Please complete it as soon as possible.',
                    icon: '/static/images/task-icon.png',
                    badge: '/static/images/task-badge.png',
                    tag: `task_${notification.id}`,
                    requireInteraction: true
                });
            }
        }
    }
}

function showQuietNotification(title, body) {
    // Show a subtle notification in the page without sound
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: white;
        border: 2px solid #28a745;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        max-width: 400px;
    `;
    
    toast.innerHTML = `
        <div style="font-weight: bold; color: #28a745; margin-bottom: 4px;">${title}</div>
        <div style="color: #555; font-size: 14px;">${body}</div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function addBellAnimation() {
    // Add visual bell ringing animation to task cards
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        card.style.animation = 'none';
        // Force reflow
        void card.offsetWidth;
        card.style.animation = 'bell-ring 0.6s ease-in-out';
    });
}

// Check task reminders more frequently to ensure timely notifications
setInterval(checkTaskReminders, 30000); // Check every 30 seconds instead of 60

document.addEventListener('DOMContentLoaded', function () {
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => {
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    });
});

const currentPath = window.location.pathname;
document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
    }
});

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function (e) {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }, 5000);
        }
    });
});

// AI Assistant Chat Logic
document.addEventListener('DOMContentLoaded', function () {
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatHistory = document.getElementById('chat-history');
    const chatPlaceholder = document.getElementById('chat-placeholder');
    const chatSpinner = document.getElementById('chat-spinner');

    if (!chatInput || !chatSend || !chatHistory) {
        console.warn('AI Assistant Chat elements not found on this page.');
        return;
    }

    function addMessage(sender, text) {
        if (chatPlaceholder) {
            chatPlaceholder.style.display = 'none';
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `p-3 rounded-3 shadow-sm ${sender === 'user' ? 'bg-info text-white align-self-end ms-4' : 'bg-light text-dark align-self-start me-4 border'}`;

        // Convert basic markdown-like response to simple HTML
        let formattedText = text;

        // Escape HTML to prevent XSS but allow our formatting map
        const temp = document.createElement('div');
        temp.textContent = formattedText;
        formattedText = temp.innerHTML;

        // Line breaks
        formattedText = formattedText.replace(/\n/g, '<br>');

        // Simple markdown formatting
        if (sender !== 'user') {
            formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

            // Format list items starting with * or -
            formattedText = formattedText.replace(/(?:^|<br>)(?:\*|-)\s(.*?)(?=$|<br>)/g, '<br>• $1');
        }

        messageDiv.innerHTML = formattedText;

        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    async function sendMessage() {
        if (chatSend.disabled) return; // Prevent double sending

        const message = chatInput.value.trim();
        if (!message) return;

        // Disable input
        chatInput.value = '';
        chatInput.disabled = true;
        chatSend.disabled = true;
        if (chatSpinner) chatSpinner.classList.remove('d-none');

        // Add user message to UI
        addMessage('user', message);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();

            if (response.ok) {
                addMessage('ai', data.response);
            } else {
                addMessage('ai', `Error: ${data.error || 'Something went wrong.'}`);
            }
        } catch (error) {
            addMessage('ai', 'Error connecting to the assistant. Please check your network connection.');
            console.error('Chat error:', error);
        } finally {
            // Re-enable input
            chatInput.disabled = false;
            chatSend.disabled = false;
            if (chatSpinner) chatSpinner.classList.add('d-none');
            chatInput.focus();
        }
    }

    // Use a direct onclick assignment instead of addEventListener to ensure it's the primary handler
    // and doesn't get messed up by other generic form handlers in the app
    chatSend.onclick = function (e) {
        e.preventDefault();
        sendMessage();
    };

    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});
