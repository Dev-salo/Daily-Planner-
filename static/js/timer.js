// Timer functionality for the Daily Planner
class TaskTimer {
    constructor() {
        this.timers = new Map();
        this.alarmAudio = null;
    }

    initializeAlarmAudio() {
        // Create an audio context for generating bell-like sounds
        if (!this.alarmAudio) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.audioContext = audioContext;
                this.playBellSound = this.createBellSound(audioContext);
            } catch (e) {
                console.log('Audio not supported, using notification fallback');
            }
        }
    }

    createBellSound(audioContext) {
        return function playBell(durationMs = 500) {
            try {
                const now = audioContext.currentTime;
                const duration = durationMs / 1000;
                
                // Create oscillators for bell-like harmonics
                const osc1 = audioContext.createOscillator();
                const osc2 = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                // Bell-like frequencies
                osc1.frequency.value = 800;  // Higher note
                osc2.frequency.value = 600;  // Lower note
                
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(audioContext.destination);
                
                // Ramp down volume (bell decay)
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                
                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + duration);
                osc2.stop(now + duration);
            } catch (e) {
                console.log('Bell sound error:', e);
            }
        };
    }

    playAlarm(times = 5, interval = 500) {
        this.initializeAlarmAudio();
        
        if (this.playBellSound) {
            let count = 0;
            const ring = () => {
                if (count < times) {
                    this.playBellSound(interval);
                    count++;
                    setTimeout(ring, interval + 100);
                }
            };
            ring();
        }
    }

    startTaskTimer(taskId, taskName, targetTime, notificationType = 'silent') {
        if (this.timers.has(taskId)) {
            this.stopTaskTimer(taskId);
        }

        const timerObj = {
            taskId: taskId,
            taskName: taskName,
            targetTime: new Date(targetTime),
            notificationType: notificationType,
            intervalId: null,
            notified: false
        };

        const updateTimer = () => {
            const now = new Date();
            const diff = timerObj.targetTime - now;

            // Update timer display
            this.updateTimerDisplay(taskId, diff);

            // Check if task time has been reached
            if (diff <= 0 && !timerObj.notified) {
                // SINGLE notification at exact task time
                this.triggerNotification(taskId, taskName, notificationType);
                timerObj.notified = true;
                
                // Stop timer after notification
                setTimeout(() => {
                    this.stopTaskTimer(taskId);
                }, 5 * 60 * 1000); // Keep timer for 5 minutes after notification
            }
        };

        timerObj.intervalId = setInterval(updateTimer, 1000);
        this.timers.set(taskId, timerObj);
        
        // Initial update
        updateTimer();
    }

    stopTaskTimer(taskId) {
        if (this.timers.has(taskId)) {
            const timer = this.timers.get(taskId);
            if (timer.intervalId) {
                clearInterval(timer.intervalId);
            }
            this.timers.delete(taskId);
        }
    }

    triggerNotification(taskId, taskName, notificationType) {
        // Use tag to prevent duplicate notifications in the browser
        const notificationTag = `task_${taskId}_notification`;
        
        if (notificationType === 'silent') {
            // SILENT: Only notification, no sound
            this.showBrowserNotification(`⏱️ ${taskName}`, {
                body: 'Time to work on this task!',
                tag: notificationTag,
                requireInteraction: false
            });
        } else if (notificationType === 'alarm') {
            // ALARM: Bell rings + notification (5 times)
            this.playAlarm(5, 600);
            
            this.showBrowserNotification(`🔔 ALARM: ${taskName}`, {
                body: 'Time to work on this task NOW!',
                tag: notificationTag,
                requireInteraction: true
            });
        } else if (notificationType === 'timed') {
            // TIMED/RING: Bell rings + notification (3 times)
            this.playAlarm(3, 500);
            
            this.showBrowserNotification(`🔔 ${taskName}`, {
                body: 'Your task time has arrived!',
                tag: notificationTag,
                requireInteraction: true
            });
        }
        
        // Log for debugging
        console.log(`[${new Date().toLocaleTimeString()}] Notification sent for task "${taskName}" - Type: ${notificationType}`);
    }

    showBrowserNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, options);
        }
    }

    updateTimerDisplay(taskId, timeRemainingMs) {
        const timerElement = document.getElementById(`timer-${taskId}`);
        if (!timerElement) return;
        
        // Don't update display for completed tasks
        const taskStatus = timerElement.getAttribute('data-task-status');
        if (taskStatus === 'complete') {
            timerElement.textContent = '✓ Done';
            timerElement.style.backgroundColor = '#28a745';
            return;
        }
        
        const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);

        // Format display
        let displayText = '';
        if (days > 0) {
            displayText = `${days}d ${hours}h`;
        } else if (hours > 0) {
            displayText = `${hours}h ${minutes}m`;
        } else if (timeRemainingMs > 0) {
            displayText = `${minutes}m ${seconds}s`;
        } else {
            displayText = '00:00';
        }
        
        timerElement.textContent = displayText;
        
        // Change color based on time remaining
        if (timeRemainingMs <= 0) {
            timerElement.style.backgroundColor = '#dc3545'; // Red - time reached
        } else if (timeRemainingMs <= 5 * 60 * 1000) {
            timerElement.style.backgroundColor = '#dc3545'; // Red - less than 5 min
        } else if (timeRemainingMs <= 30 * 60 * 1000) {
            timerElement.style.backgroundColor = '#ffc107'; // Yellow - 5-30 min
        } else {
            timerElement.style.backgroundColor = '#28a745'; // Green - more than 30 min
        }
    }

    getFormattedTimeRemaining(timeRemainingMs) {
        const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);

        if (days > 0) {
            return `${days}d ${hours}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m ${seconds}s`;
        }
    }

    startAllTaskTimers() {
        // Get all tasks from DOM and start timers
        const taskElements = document.querySelectorAll('[data-task-id][data-task-time][data-task-date][data-task-notification]');
        
        taskElements.forEach(element => {
            const taskId = element.getAttribute('data-task-id');
            const taskName = element.getAttribute('data-task-name');
            const taskDate = element.getAttribute('data-task-date');
            const taskTime = element.getAttribute('data-task-time');
            const notificationType = element.getAttribute('data-task-notification');
            const taskStatus = element.getAttribute('data-task-status');
            
            // Skip completed tasks - don't send notifications for them
            if (taskStatus === 'complete') {
                return;
            }
            
            if (taskDate && taskTime) {
                const targetDateTime = `${taskDate}T${taskTime}`;
                this.startTaskTimer(taskId, taskName, targetDateTime, notificationType);
            }
        });
    }
}

// Initialize global timer
const taskTimer = new TaskTimer();

// Request notification permission on load
document.addEventListener('DOMContentLoaded', function() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Start all task timers
    taskTimer.startAllTaskTimers();
});
