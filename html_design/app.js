function meetingCostApp() {
    return {
        // State
        attendees: [],
        nextId: 1,
        workingHours: {
            hoursPerDay: 8,
            daysPerWeek: 5,
            weeksPerYear: 50
        },
        meeting: {
            isRunning: false,
            startTime: null,
            duration: 0
        },
        currency: {
            symbol: '$',
            code: 'USD',
            position: 'before'
        },
        
        // UI State
        showCurrencySettings: false,
        isLoading: false,
        
        // Audio recording
        isRecording: false,
        isProcessingAudio: false,
        isProcessingText: false,
        mediaRecorder: null,
        audioChunks: [],
        transcript: '',
        voiceError: '',
        audioSupported: false,
        processingStep: '',
        
        // Currency options
        commonCurrencies: [
            { symbol: '$', code: 'USD', name: 'US Dollar' },
            { symbol: '€', code: 'EUR', name: 'Euro' },
            { symbol: '£', code: 'GBP', name: 'British Pound' },
            { symbol: '¥', code: 'JPY', name: 'Japanese Yen' },
            { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
            { symbol: '৳', code: 'BDT', name: 'Bangladeshi Taka' },
            { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
            { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
        ],
        customSymbol: '',
        customCode: '',
        
        // Timer
        timerInterval: null,

        // Initialize
        init() {
            this.loadFromStorage();
            this.initAudioRecording();
            this.startPerformanceTimer();
            
            // Add keyboard shortcuts
            this.initKeyboardShortcuts();
            
            // Auto-save every 30 seconds
            setInterval(() => {
                this.saveToStorage();
            }, 30000);
        },

        // Performance timer for real-time updates
        startPerformanceTimer() {
            setInterval(() => {
                if (this.meeting.isRunning && this.meeting.startTime) {
                    this.meeting.duration = Date.now() - this.meeting.startTime;
                }
            }, 100); // Update every 100ms for smooth animation
        },

        // Keyboard shortcuts
        initKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + Enter to start/stop meeting
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    if (this.meeting.isRunning) {
                        this.endMeeting();
                    } else if (this.hasValidAttendees) {
                        this.startMeeting();
                    }
                }
                
                // Ctrl/Cmd + N to add new attendee
                if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                    e.preventDefault();
                    this.addAttendee();
                }
                
                // Ctrl/Cmd + R to reset (with confirmation)
                if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                    e.preventDefault();
                    if (confirm('Are you sure you want to reset all data?')) {
                        this.resetAll();
                    }
                }
                
                // Escape to close settings
                if (e.key === 'Escape') {
                    this.showCurrencySettings = false;
                }
            });
        },

        // Enhanced Local Storage with compression
        saveToStorage() {
            try {
                const data = {
                    attendees: this.attendees,
                    workingHours: this.workingHours,
                    meeting: this.meeting,
                    currency: this.currency,
                    nextId: this.nextId,
                    timestamp: Date.now()
                };
                
                // Compress data by removing empty values
                const compressedData = JSON.parse(JSON.stringify(data, (key, value) => {
                    if (value === null || value === undefined || value === '') {
                        return undefined;
                    }
                    return value;
                }));
                
                localStorage.setItem('meeting-cost-app-v3', JSON.stringify(compressedData));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                this.showNotification('Failed to save data', 'error');
            }
        },

        loadFromStorage() {
            try {
                // Try to load from new version first
                let stored = localStorage.getItem('meeting-cost-app-v3');
                
                // Fallback to older versions
                if (!stored) {
                    stored = localStorage.getItem('meeting-cost-app-v2') || localStorage.getItem('meeting-cost-app');
                }
                
                if (stored) {
                    const data = JSON.parse(stored);
                    this.attendees = data.attendees || [];
                    this.workingHours = { ...this.workingHours, ...data.workingHours };
                    this.meeting = { ...this.meeting, ...data.meeting };
                    this.currency = { ...this.currency, ...data.currency };
                    this.nextId = data.nextId || 1;
                    
                    // Validate loaded data
                    this.validateData();
                }
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
                this.showNotification('Failed to load saved data', 'error');
            }
        },

        // Data validation
        validateData() {
            // Ensure attendees have valid IDs and salaries
            this.attendees = this.attendees.filter(attendee => 
                attendee.id && typeof attendee.salary === 'number' && attendee.salary >= 0
            );
            
            // Ensure working hours are valid
            if (this.workingHours.hoursPerDay < 1 || this.workingHours.hoursPerDay > 24) {
                this.workingHours.hoursPerDay = 8;
            }
            if (this.workingHours.daysPerWeek < 1 || this.workingHours.daysPerWeek > 7) {
                this.workingHours.daysPerWeek = 5;
            }
            if (this.workingHours.weeksPerYear < 1 || this.workingHours.weeksPerYear > 52) {
                this.workingHours.weeksPerYear = 50;
            }
            
            // Ensure currency is valid
            if (!this.currency.symbol || !this.currency.code) {
                this.currency = { symbol: '$', code: 'USD', position: 'before' };
            }
            
            // Reset meeting if it was running (page refresh)
            if (this.meeting.isRunning) {
                this.meeting.isRunning = false;
                this.meeting.startTime = null;
            }
        },

        // Audio Recording Setup
        async initAudioRecording() {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    this.audioSupported = true;
                } else {
                    this.audioSupported = false;
                    console.warn('Audio recording not supported in this browser');
                }
            } catch (error) {
                console.error('Error checking audio support:', error);
                this.audioSupported = false;
            }
        },

        // Start audio recording
        async startRecording() {
            if (!this.audioSupported) {
                this.showNotification('Audio recording not supported in this browser', 'error');
                return;
            }

            try {
                this.processingStep = 'Requesting microphone access...';
                this.voiceError = '';
                
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        sampleRate: 16000,
                        channelCount: 1,
                        echoCancellation: true,
                        noiseSuppression: true
                    } 
                });
                
                this.audioChunks = [];
                this.mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'audio/webm;codecs=opus'
                });

                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.audioChunks.push(event.data);
                    }
                };

                this.mediaRecorder.onstop = () => {
                    this.processAudioRecording();
                    // Stop all tracks to release microphone
                    stream.getTracks().forEach(track => track.stop());
                };

                this.mediaRecorder.start();
                this.isRecording = true;
                this.processingStep = 'Recording... Click stop when finished';
                this.showNotification('Recording started. Speak clearly about attendee salaries.', 'info');

            } catch (error) {
                console.error('Error starting recording:', error);
                this.voiceError = 'Failed to access microphone. Please check permissions.';
                this.showNotification('Failed to access microphone', 'error');
                this.processingStep = '';
            }
        },

        // Stop audio recording
        stopRecording() {
            if (this.mediaRecorder && this.isRecording) {
                this.mediaRecorder.stop();
                this.isRecording = false;
                this.processingStep = 'Processing audio...';
            }
        },

        // Toggle recording
        toggleRecording() {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        },

        // Process recorded audio
        async processAudioRecording() {
            if (this.audioChunks.length === 0) {
                this.showNotification('No audio recorded', 'warning');
                this.processingStep = '';
                return;
            }

            this.isProcessingAudio = true;
            this.processingStep = 'Converting audio to text...';

            try {
                // Create audio blob
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                
                // Convert to MP3 if possible, otherwise send as webm
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');

                // Send to speech-to-text API
                const speechResponse = await fetch('https://worker.amarecom.com/api/speech-to-text', {
                    method: 'POST',
                    body: formData
                });

                if (!speechResponse.ok) {
                    throw new Error(`Speech-to-text API failed: ${speechResponse.status} ${speechResponse.statusText}`);
                }

                const speechData = await speechResponse.json();
                
                if (!speechData.text || speechData.text.trim() === '') {
                    throw new Error('No text was extracted from the audio');
                }

                this.transcript = speechData.text;
                this.processingStep = 'Extracting attendee information...';
                
                // Process the text to extract attendees
                await this.processTextForAttendees(speechData.text);

            } catch (error) {
                console.error('Audio processing error:', error);
                this.voiceError = `Failed to process audio: ${error.message}`;
                this.showNotification('Failed to process audio. Please try again.', 'error');
            } finally {
                this.isProcessingAudio = false;
                this.processingStep = '';
            }
        },

        // Process text to extract attendees
        async processTextForAttendees(text) {
            if (!text || text.trim() === '') {
                this.showNotification('No text to process', 'warning');
                return;
            }

            this.isProcessingText = true;
            this.processingStep = 'Analyzing text for attendee data...';

            try {
                // Encode the text for URL
                const encodedText = encodeURIComponent(text.trim());
                const apiUrl = `https://worker.amarecom.com/api/get-attendees-from-text?text=${encodedText}`;
                
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Attendees API failed: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                
                // Process the API response
                if (data && Array.isArray(data) && data.length > 0) {
                    // Add attendees from API response
                    let addedCount = 0;
                    data.forEach(attendeeData => {
                        if (attendeeData.salary && attendeeData.salary > 0) {
                            this.addAttendeeWithSalary(attendeeData.salary);
                            addedCount++;
                        }
                    });
                    
                    if (addedCount > 0) {
                        this.saveToStorage();
                        this.showNotification(`Successfully added ${addedCount} attendee(s) from voice input!`, 'success');
                    } else {
                        this.showNotification('No valid salary information found in the audio.', 'warning');
                    }
                } else {
                    this.showNotification('No attendee information found. Try mentioning specific salary amounts.', 'warning');
                }

            } catch (error) {
                console.error('Text processing error:', error);
                this.voiceError = `Failed to extract attendees: ${error.message}`;
                this.showNotification('Failed to extract attendee information. Please try again.', 'error');
            } finally {
                this.isProcessingText = false;
                this.processingStep = '';
            }
        },

        // Currency functions
        selectCurrency(selectedCurrency) {
            this.currency.symbol = selectedCurrency.symbol;
            this.currency.code = selectedCurrency.code;
            this.saveToStorage();
        },

        applyCustomCurrency() {
            if (this.customSymbol.trim() && this.customCode.trim()) {
                this.currency.symbol = this.customSymbol.trim();
                this.currency.code = this.customCode.trim().toUpperCase();
                this.customSymbol = '';
                this.customCode = '';
                this.saveToStorage();
                this.showNotification('Custom currency applied', 'success');
            }
        },

        setCurrencyPosition(position) {
            this.currency.position = position;
            this.saveToStorage();
        },

        formatCurrencyPreview(amount) {
            const formattedAmount = amount.toFixed(2);
            return this.currency.position === 'before' 
                ? `${this.currency.symbol}${formattedAmount}`
                : `${formattedAmount} ${this.currency.symbol}`;
        },

        // Enhanced attendee management
        addAttendee() {
            const newAttendee = {
                id: this.nextId,
                salary: 0,
                createdAt: Date.now()
            };
            this.attendees.push(newAttendee);
            this.nextId++;
            this.saveToStorage();
            
            // Focus on the new attendee's salary input
            this.$nextTick(() => {
                const inputs = document.querySelectorAll('input[type="number"]');
                const lastInput = inputs[inputs.length - 1];
                if (lastInput) lastInput.focus();
            });
        },

        addAttendeeWithSalary(salary) {
            const newAttendee = {
                id: this.nextId,
                salary: salary,
                createdAt: Date.now()
            };
            this.attendees.push(newAttendee);
            this.nextId++;
        },

        removeAttendee(id) {
            if (confirm('Are you sure you want to remove this attendee?')) {
                this.attendees = this.attendees.filter(a => a.id !== id);
                this.saveToStorage();
                this.showNotification('Attendee removed', 'info');
            }
        },

        deleteAllAttendees() {
            if (confirm('Are you sure you want to remove all attendees? This action cannot be undone.')) {
                this.attendees = [];
                this.nextId = 1;
                this.saveToStorage();
                this.showNotification('All attendees removed', 'info');
            }
        },

        updateAttendee(id, salary) {
            const attendee = this.attendees.find(a => a.id === id);
            if (attendee) {
                attendee.salary = Math.max(0, salary || 0);
                attendee.updatedAt = Date.now();
                this.saveToStorage();
            }
        },

        // Working Hours with validation
        updateWorkingHours() {
            // Validate and constrain values
            this.workingHours.hoursPerDay = Math.max(1, Math.min(24, this.workingHours.hoursPerDay));
            this.workingHours.daysPerWeek = Math.max(1, Math.min(7, this.workingHours.daysPerWeek));
            this.workingHours.weeksPerYear = Math.max(1, Math.min(52, this.workingHours.weeksPerYear));
            
            this.saveToStorage();
        },

        // Enhanced calculations with caching
        calculateHourlyRate(salary) {
            if (!salary || salary <= 0) return 0;
            const totalHours = this.workingHours.hoursPerDay * 
                             this.workingHours.daysPerWeek * 
                             this.workingHours.weeksPerYear;
            return totalHours > 0 ? salary / totalHours : 0;
        },

        calculateMinuteRate(salary) {
            const hourlyRate = this.calculateHourlyRate(salary);
            return hourlyRate / 60;
        },

        // Enhanced meeting timer
        startMeeting() {
            if (!this.hasValidAttendees) {
                this.showNotification('Please add attendees with salaries first', 'warning');
                return;
            }
            
            this.meeting.isRunning = true;
            this.meeting.startTime = Date.now();
            this.meeting.duration = 0;
            this.saveToStorage();
            this.showNotification('Meeting started', 'success');
        },

        endMeeting() {
            this.meeting.isRunning = false;
            this.saveToStorage();
            this.showNotification(`Meeting ended. Total cost: ${this.formatCurrency(this.currentCost)}`, 'info');
        },

        resetAll() {
            if (!confirm('This will delete all data including attendees, settings, and meeting history. Are you sure?')) {
                return;
            }
            
            this.attendees = [];
            this.nextId = 1;
            this.workingHours = {
                hoursPerDay: 8,
                daysPerWeek: 5,
                weeksPerYear: 50
            };
            this.meeting = {
                isRunning: false,
                startTime: null,
                duration: 0
            };
            this.currency = {
                symbol: '$',
                code: 'USD',
                position: 'before'
            };
            this.transcript = '';
            this.voiceError = '';
            this.showCurrencySettings = false;
            this.customSymbol = '';
            this.customCode = '';
            this.isRecording = false;
            this.isProcessingAudio = false;
            this.isProcessingText = false;
            this.processingStep = '';
            
            // Clear all localStorage versions
            localStorage.removeItem('meeting-cost-app');
            localStorage.removeItem('meeting-cost-app-v2');
            localStorage.removeItem('meeting-cost-app-v3');
            
            this.showNotification('All data reset successfully', 'success');
        },

        // Notification system
        showNotification(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transform translate-x-full transition-transform duration-300 ${this.getNotificationClasses(type)}`;
            notification.innerHTML = `
                <div class="flex items-center space-x-3">
                    <i data-lucide="${this.getNotificationIcon(type)}" class="h-5 w-5"></i>
                    <span class="font-medium">${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.classList.remove('translate-x-full');
            }, 100);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
            
            // Re-initialize Lucide icons for the notification
            lucide.createIcons();
        },

        getNotificationClasses(type) {
            const classes = {
                success: 'bg-green-500 text-white',
                error: 'bg-red-500 text-white',
                warning: 'bg-yellow-500 text-white',
                info: 'bg-blue-500 text-white'
            };
            return classes[type] || classes.info;
        },

        getNotificationIcon(type) {
            const icons = {
                success: 'check-circle',
                error: 'x-circle',
                warning: 'alert-triangle',
                info: 'info'
            };
            return icons[type] || icons.info;
        },

        // Computed Properties
        get hasValidAttendees() {
            return this.attendees.length > 0 && this.attendees.some(a => a.salary > 0);
        },

        get currentCost() {
            if (this.meeting.duration === 0) return 0;
            
            const durationMinutes = this.meeting.duration / (1000 * 60);
            return this.attendees.reduce((total, attendee) => {
                const minuteRate = this.calculateMinuteRate(attendee.salary);
                return total + (minuteRate * durationMinutes);
            }, 0);
        },

        get totalCost() {
            return this.currentCost;
        },

        get voiceInputText() {
            if (this.processingStep) {
                return this.processingStep;
            }
            if (this.isRecording) {
                return 'Recording... Click stop when finished speaking.';
            }
            if (this.isProcessingAudio || this.isProcessingText) {
                return 'Processing your audio...';
            }
            return 'Click the microphone to record voice input. Mention attendee salaries clearly.';
        },

        get isProcessingVoice() {
            return this.isProcessingAudio || this.isProcessingText;
        },

        get averageSalary() {
            if (this.attendees.length === 0) return 0;
            const total = this.attendees.reduce((sum, a) => sum + a.salary, 0);
            return total / this.attendees.length;
        },

        get costPerSecond() {
            if (this.meeting.duration === 0) return 0;
            return this.currentCost / (this.meeting.duration / 1000);
        },

        // Enhanced utility functions
        formatTime(milliseconds) {
            const totalSeconds = Math.floor(milliseconds / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        },

        formatCurrency(amount) {
            if (amount === 0) return this.currency.position === 'before' ? `${this.currency.symbol}0.00` : `0.00 ${this.currency.symbol}`;
            
            const formattedAmount = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(Math.abs(amount));

            return this.currency.position === 'before' 
                ? `${this.currency.symbol}${formattedAmount}`
                : `${formattedAmount} ${this.currency.symbol}`;
        },

        formatNumber(number) {
            return new Intl.NumberFormat('en-US').format(number);
        },

        // Export functionality
        exportData() {
            const data = {
                attendees: this.attendees,
                workingHours: this.workingHours,
                meeting: this.meeting,
                currency: this.currency,
                exportDate: new Date().toISOString(),
                totalCost: this.totalCost
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meeting-cost-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showNotification('Data exported successfully', 'success');
        }
    };
}