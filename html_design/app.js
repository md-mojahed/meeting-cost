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
        
        // Voice input
        isListening: false,
        transcript: '',
        voiceError: '',
        speechSupported: false,
        recognition: null,
        
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
            this.initSpeechRecognition();
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

        // Enhanced Speech Recognition
        initSpeechRecognition() {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                this.speechSupported = true;
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.recognition = new SpeechRecognition();
                
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.lang = 'en-US';
                this.recognition.maxAlternatives = 1;

                this.recognition.onstart = () => {
                    this.isListening = true;
                    this.voiceError = '';
                    this.transcript = '';
                };

                this.recognition.onresult = (event) => {
                    const result = event.results[0][0];
                    this.transcript = result.transcript;
                    this.processVoiceInput(this.transcript);
                };

                this.recognition.onerror = (event) => {
                    this.voiceError = this.getVoiceErrorMessage(event.error);
                    this.isListening = false;
                };

                this.recognition.onend = () => {
                    this.isListening = false;
                };
            }
        },

        getVoiceErrorMessage(error) {
            const errorMessages = {
                'no-speech': 'No speech detected. Please try again.',
                'audio-capture': 'Microphone not available.',
                'not-allowed': 'Microphone access denied.',
                'network': 'Network error occurred.',
                'service-not-allowed': 'Speech service not allowed.'
            };
            return errorMessages[error] || `Speech recognition error: ${error}`;
        },

        toggleVoiceInput() {
            if (this.isListening) {
                this.recognition.stop();
            } else {
                this.recognition.start();
            }
        },

        // Enhanced voice processing with better pattern matching
        processVoiceInput(transcript) {
            const text = transcript.toLowerCase();
            
            // Multiple patterns for salary extraction
            const patterns = [
                /(\d{4,7})/g, // Basic 4-7 digit numbers
                /(\d{1,3}(?:,\d{3})*)/g, // Numbers with commas
                /(\d+)\s*(?:thousand|k)/gi, // "50 thousand" or "50k"
                /(\d+)\s*(?:million|m)/gi // "1 million" or "1m"
            ];
            
            const salaries = new Set(); // Use Set to avoid duplicates
            
            patterns.forEach(pattern => {
                const matches = text.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        let salary = parseInt(match.replace(/[,\s]/g, ''), 10);
                        
                        // Handle thousands and millions
                        if (text.includes('thousand') || text.includes('k')) {
                            salary *= 1000;
                        } else if (text.includes('million') || text.includes('m')) {
                            salary *= 1000000;
                        }
                        
                        // Filter reasonable salary ranges
                        if (salary >= 10000 && salary <= 10000000) {
                            salaries.add(salary);
                        }
                    });
                }
            });
            
            // Add attendees for each unique salary found
            Array.from(salaries).forEach(salary => {
                this.addAttendeeWithSalary(salary);
            });
            
            if (salaries.size > 0) {
                this.saveToStorage();
                this.showNotification(`Added ${salaries.size} attendee(s)`, 'success');
            } else {
                this.showNotification('No valid salaries detected. Try saying specific amounts.', 'warning');
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
            if (this.isListening) {
                return 'Listening... Speak clearly and mention salary amounts.';
            }
            return 'Click the microphone to add attendees by voice. Try: "Add three people with salaries 80k, 120k, and 150k"';
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