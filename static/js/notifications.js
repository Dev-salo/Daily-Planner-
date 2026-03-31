/**
 * Advanced Notification System
 * Supports: Silent, Bell, and Alarm notifications with proper sound handling
 * Prevents duplicate notifications when user visits task section multiple times
 */

class NotificationManager {
    constructor() {
        this.notifiedTasks = new Set();
        this.checkNotificationsInterval = null;
        this.lastNotificationTime = {};
        this.init();
    }

    /**
     * Initialize notification manager
     */
    init() {
        // Request notification permission if not already granted
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Start checking for task notifications
        this.startNotificationCheck();

        // Load previously notified tasks from localStorage
        this.loadNotifiedTasks();
    }

    /**
     * Start periodic check for task notifications
     */
    startNotificationCheck() {
        // Check every minute for upcoming tasks
        this.checkNotificationsInterval = setInterval(() => {
            this.checkUpcomingTasks();
        }, 60000); // Check every minute

        // Also do an immediate check
        this.checkUpcomingTasks();
    }

    /**
     * Load notified tasks from localStorage to prevent duplicate notifications
     */
    loadNotifiedTasks() {
        const today = new Date().toISOString().split('T')[0];
        const stored = localStorage.getItem(`notifiedTasks_${today}`);
        if (stored) {
            this.notifiedTasks = new Set(JSON.parse(stored));
        }
    }

    /**
     * Save notified tasks to localStorage
     */
    saveNotifiedTasks() {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`notifiedTasks_${today}`, JSON.stringify([...this.notifiedTasks]));
    }

    /**
     * Check upcoming tasks and send notifications if needed
     */
    async checkUpcomingTasks() {
        try {
            const response = await fetch('/api/next-task');
            if (!response.ok) return;

            const task = await response.json();
            if (!task.id || !task.time) return;

            const taskKey = `${task.id}_${task.date}`;

            // Skip if already notified for this task today
            if (this.notifiedTasks.has(taskKey)) {
                return;
            }

            // Check if task is due now (within 2 minutes)
            const now = new Date();
            const taskDateTime = new Date(`${task.date}T${task.time}`);
            const timeDiff = taskDateTime - now;
            const minutesUntilTask = timeDiff / (1000 * 60);

            // Only notify if task is due within 2 minutes (give some buffer)
            if (minutesUntilTask > -1 && minutesUntilTask <= 2) {
                // Get task details with notification type
                const taskDetails = await this.getTaskDetails(task.id);
                if (taskDetails) {
                    this.sendNotification(taskDetails);
                    this.notifiedTasks.add(taskKey);
                    this.saveNotifiedTasks();
                }
            }
        } catch (error) {
            console.error('Error checking upcoming tasks:', error);
        }
    }

    /**
     * Get full task details including notification type
     */
    async getTaskDetails(taskId) {
        try {
            const response = await fetch(`/api/task/${taskId}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching task details:', error);
        }
        return null;
    }

    /**
     * Send notification with appropriate sound based on notification type
     */
    sendNotification(task) {
        if (!('Notification' in window)) {
            console.warn('Browser does not support notifications');
            return;
        }

        if (Notification.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }

        const notificationType = task.notification_type || 'silent';
        const title = `📋 Task Due: ${task.name}`;
        const options = {
            icon: '/static/images/favicon.ico',
            tag: `task_${task.id}`, // Prevent duplicate notifications
            requireInteraction: notificationType === 'alarm', // Keep alarm notifications visible until dismissed
            badge: '/static/images/badge.png'
        };

        // Create notification
        const notification = new Notification(title, options);

        // Play sound based on notification type
        this.playNotificationSound(notificationType);

        // Click handler
        notification.onclick = () => {
            window.open('/tasks', '_self');
            notification.close();
        };

        // Close after 10 seconds (unless it's an alarm)
        if (notificationType !== 'alarm') {
            setTimeout(() => notification.close(), 10000);
        }
    }

    /**
     * Play notification sound based on type
     */
    playNotificationSound(notificationType) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        switch (notificationType) {
            case 'silent':
                // No sound for silent notifications
                break;

            case 'bell':
                this.playBellSound(audioContext);
                break;

            case 'alarm':
                this.playAlarmSound(audioContext);
                break;

            default:
                // Silent by default
                break;
        }
    }

    /**
     * Play bell notification sound
     */
    playBellSound(audioContext) {
        try {
            const now = audioContext.currentTime;
            const duration = 0.5;

            // Create a simple bell sound with multiple frequencies
            const frequencies = [800, 1000, 1200];

            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();

                oscillator.connect(gain);
                gain.connect(audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = 'sine';

                // Stagger the start times for a bell effect
                const startTime = now + (index * 0.1);
                gain.gain.setValueAtTime(0.3, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            });
        } catch (error) {
            console.error('Error playing bell sound:', error);
        }
    }

    /**
     * Play alarm notification sound (loud and repetitive)
     */
    playAlarmSound(audioContext) {
        try {
            const now = audioContext.currentTime;
            const alarmDuration = 2; // Play for 2 seconds
            const pulseFrequency = 2; // Pulse twice per second

            for (let i = 0; i < pulseFrequency * alarmDuration; i++) {
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();

                oscillator.connect(gain);
                gain.connect(audioContext.destination);

                oscillator.frequency.value = 800; // Alarm frequency
                oscillator.type = 'square';

                const pulseDuration = 0.5 / pulseFrequency;
                const startTime = now + (i * pulseDuration);

                gain.gain.setValueAtTime(0.5, startTime);
                gain.gain.setValueAtTime(0, startTime + pulseDuration);

                oscillator.start(startTime);
                oscillator.stop(startTime + pulseDuration);
            }
        } catch (error) {
            console.error('Error playing alarm sound:', error);
        }
    }

    /**
     * Manually trigger notification (for testing)
     */
    testNotification(type = 'bell') {
        const testTask = {
            id: 999,
            name: 'Test Task',
            notification_type: type
        };
        this.sendNotification(testTask);
    }

    /**
     * Clear all notifications for the day
     */
    clearNotifications() {
        const today = new Date().toISOString().split('T')[0];
        localStorage.removeItem(`notifiedTasks_${today}`);
        this.notifiedTasks.clear();
    }

    /**
     * Destroy notification manager
     */
    destroy() {
        if (this.checkNotificationsInterval) {
            clearInterval(this.checkNotificationsInterval);
        }
    }
}

// Initialize notification manager when DOM is ready
let notificationManager;

document.addEventListener('DOMContentLoaded', () => {
    if (!notificationManager) {
        notificationManager = new NotificationManager();
    }
});

// Clean up on page unload
window.addEventListener('unload', () => {
    if (notificationManager) {
        notificationManager.destroy();
    }
});
