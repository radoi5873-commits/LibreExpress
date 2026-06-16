document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. Core State & Mock Database
    // ==========================================================================
    const state = {
        theme: localStorage.getItem('theme') || 'dark',
        activeWizardStep: 1,
        generatedTrackingCodes: {}, // Stores user-generated orders dynamically
        currentPrice: 2000,
        lastOrderPrice: 2000,
        lastOrderRoute: '',
        lastOrderService: 'Standard'
    };

    // Tracking database mockup
    const trackingDatabase = {
        'LE-7842-DK': {
            service: 'Express',
            statusText: 'En cours de livraison',
            step: 3,
            times: ['10:30', '11:05', 'En transit - Coursier: Moussa K.', 'En attente']
        },
        'LE-9104-DK': {
            service: 'Standard',
            statusText: 'Colis livré',
            step: 4,
            times: ['Hier, 09:15', 'Hier, 10:40', 'Hier, 14:20', 'Hier, 16:45']
        }
    };

    // ==========================================================================
    // 2. Dark/Light Theme Switcher
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const htmlElement = document.documentElement;

    function applyTheme(themeName) {
        if (themeName === 'dark') {
            htmlElement.classList.add('dark');
            htmlElement.classList.remove('light');
        } else {
            htmlElement.classList.add('light');
            htmlElement.classList.remove('dark');
        }
        localStorage.setItem('theme', themeName);
        
        const icon = themeToggleBtn.querySelector('i');
        if (themeName === 'dark') {
            icon.className = 'fas fa-sun text-yellow-400';
        } else {
            icon.className = 'fas fa-moon text-slate-700 dark:text-slate-350';
        }
    }

    // Initialize theme
    applyTheme(state.theme);

    themeToggleBtn.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(state.theme);
    });

    // ==========================================================================
    // 3. Mobile menu toggle
    // ==========================================================================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const burger1 = document.getElementById('burger-span-1');
    const burger2 = document.getElementById('burger-span-2');
    const burger3 = document.getElementById('burger-span-3');

    mobileMenuToggle.addEventListener('click', () => {
        const isClosed = navMenu.classList.contains('hidden');
        if (isClosed) {
            navMenu.classList.remove('hidden');
            // Animate burger to 'X'
            burger1.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 rotate-45 translate-y-1 transition-all duration-300';
            burger2.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 opacity-0 transition-all duration-300';
            burger3.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 -rotate-45 -translate-y-1 transition-all duration-300';
        } else {
            navMenu.classList.add('hidden');
            // Reset burger lines
            burger1.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 transition-all duration-300';
            burger2.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 transition-all duration-300';
            burger3.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 transition-all duration-300';
        }
    });

    // Close menu when clicking nav links
    document.querySelectorAll('#nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.add('hidden');
            burger1.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 transition-all duration-300';
            burger2.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 transition-all duration-300';
            burger3.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 transition-all duration-300';
        });
    });

    // ==========================================================================
    // 4. Delivery Cost Estimator logic
    // ==========================================================================
    const estPickup = document.getElementById('est-pickup');
    const estDelivery = document.getElementById('est-delivery');
    const estSize = document.getElementById('est-size');
    const estSpeed = document.getElementById('est-speed');
    const estimatorPrice = document.getElementById('estimator-price');
    const estimatorTime = document.getElementById('estimator-time');

    function calculateEstimate() {
        if (!estPickup || !estDelivery || !estSize || !estSpeed) return;

        const pZone = parseInt(estPickup.value);
        const dZone = parseInt(estDelivery.value);
        const sizeFactor = parseFloat(estSize.value);
        const speedVal = estSpeed.value;

        // Base price calculation
        const basePrice = 1500;
        const zoneDiff = Math.abs(pZone - dZone);
        
        let subtotal = basePrice;
        if (zoneDiff > 0) {
            subtotal += zoneDiff * 800;
        }

        // Apply weight multiplier
        let price = subtotal * sizeFactor;

        // Speed addition
        if (speedVal === 'express') {
            price += 1000;
        }

        // Format result and update UI
        const roundedPrice = Math.round(price / 100) * 100; // Round to nearest 100 FCFA
        state.currentPrice = roundedPrice;

        // Animate price numbers
        animatePriceNumber(roundedPrice);

        // Update estimated delivery time
        if (speedVal === 'express') {
            const now = new Date();
            now.setHours(now.getHours() + 3);
            const formattedTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            estimatorTime.innerHTML = `<i class="far fa-clock text-cyan-600 dark:text-cyan-400"></i> Livraison prévue avant ${formattedTime} (Express)`;
        } else {
            estimatorTime.innerHTML = `<i class="far fa-clock text-indigo-650 dark:text-indigo-400"></i> Livraison aujourd'hui avant 18h`;
        }
    }

    function animatePriceNumber(targetPrice) {
        if (!estimatorPrice) return;
        let currentNum = parseInt(estimatorPrice.textContent.replace(/\s/g, '')) || 0;
        const duration = 300; // ms
        const steps = 12;
        const stepTime = duration / steps;
        const increment = (targetPrice - currentNum) / steps;
        let stepCount = 0;

        const timer = setInterval(() => {
            currentNum += increment;
            estimatorPrice.innerHTML = Math.round(currentNum).toLocaleString('fr-FR') + ' <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">FCFA</span>';
            stepCount++;
            
            if (stepCount >= steps) {
                clearInterval(timer);
                estimatorPrice.innerHTML = targetPrice.toLocaleString('fr-FR') + ' <span class="text-sm font-bold text-indigo-600 dark:text-indigo-300">FCFA</span>';
            }
        }, stepTime);
    }

    // Attach listeners
    [estPickup, estDelivery, estSize, estSpeed].forEach(el => {
        if (el) el.addEventListener('change', calculateEstimate);
    });

    // Run initial estimate calculation
    calculateEstimate();

    // ==========================================================================
    // 5. Booking Wizard Modal (Multi-step Booking Form)
    // ==========================================================================
    const bookingModal = document.getElementById('booking-modal');
    const openBookingBtn = document.getElementById('open-booking-btn');
    const heroBookBtn = document.getElementById('hero-book-btn');
    const estimatorBookBtn = document.getElementById('estimator-book-btn');
    const closeBookingModal = document.getElementById('close-booking-modal');
    const mobileBookBtn = document.getElementById('mobile-book-btn');

    // Wizard navigation controls
    const wizardForm = document.getElementById('booking-wizard-form');
    const next1 = document.getElementById('wizard-next-1');
    const next2 = document.getElementById('wizard-next-2');
    const prev2 = document.getElementById('wizard-prev-2');
    const prev3 = document.getElementById('wizard-prev-3');

    const stepPanels = [
        document.getElementById('step-panel-1'),
        document.getElementById('step-panel-2'),
        document.getElementById('step-panel-3')
    ];
    const stepIndicators = [
        document.getElementById('ind-1'),
        document.getElementById('ind-2'),
        document.getElementById('ind-3')
    ];

    function openBooking(prefillPrice = false) {
        state.activeWizardStep = 1;
        updateWizardUI();
        
        if (prefillPrice && estPickup && estDelivery && estSize && estSpeed) {
            // Prefill wizard elements based on estimator options
            document.getElementById('book-pickup-zone').value = estPickup.value;
            document.getElementById('book-delivery-zone').value = estDelivery.value;
            document.getElementById('book-package-size').value = estSize.value;
            
            // Set speed radio
            const speedRadios = document.getElementsByName('book-service');
            speedRadios.forEach(radio => {
                const card = radio.closest('.service-option-card');
                if (radio.value === estSpeed.value) {
                    radio.checked = true;
                    card.classList.add('border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/10');
                    card.classList.remove('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-950');
                } else {
                    card.classList.remove('border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/10');
                    card.classList.add('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-950');
                }
            });
        }
        
        // Modal styling activation (Tailwind transition classes support)
        bookingModal.classList.remove('opacity-0', 'pointer-events-none');
        bookingModal.classList.add('opacity-100', 'pointer-events-auto');
        
        const modalContainer = bookingModal.querySelector('.modal-container');
        modalContainer.classList.remove('scale-95', 'translate-y-4');
        modalContainer.classList.add('scale-100', 'translate-y-0');
        
        document.body.style.overflow = 'hidden';
    }

    function closeBooking() {
        bookingModal.classList.add('opacity-0', 'pointer-events-none');
        bookingModal.classList.remove('opacity-100', 'pointer-events-auto');
        
        const modalContainer = bookingModal.querySelector('.modal-container');
        modalContainer.classList.add('scale-95', 'translate-y-4');
        modalContainer.classList.remove('scale-100', 'translate-y-0');
        
        document.body.style.overflow = '';
    }

    if (openBookingBtn) openBookingBtn.addEventListener('click', () => openBooking(false));
    if (heroBookBtn) heroBookBtn.addEventListener('click', () => openBooking(false));
    if (mobileBookBtn) mobileBookBtn.addEventListener('click', () => openBooking(false));
    if (estimatorBookBtn) estimatorBookBtn.addEventListener('click', () => openBooking(true));
    if (closeBookingModal) closeBookingModal.addEventListener('click', closeBooking);

    // Modal click-outside logic
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) closeBooking();
    });

    // Plan Card trigger buttons
    document.querySelectorAll('.select-plan-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const plan = e.target.getAttribute('data-plan');
            openBooking(false);
            
            // Select speed plan card
            setTimeout(() => {
                const radio = document.querySelector(`input[name="book-service"][value="${plan}"]`);
                if (radio) {
                    radio.checked = true;
                    document.querySelectorAll('.service-option-card').forEach(c => {
                        c.classList.remove('border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/10');
                        c.classList.add('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-950');
                    });
                    const parentCard = radio.closest('.service-option-card');
                    parentCard.classList.add('border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/10');
                    parentCard.classList.remove('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-950');
                }
            }, 100);
        });
    });

    // Wizard Steps Navigation
    function updateWizardUI() {
        // Toggle step panels active status
        stepPanels.forEach((panel, index) => {
            if (index + 1 === state.activeWizardStep) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Toggle step indicators styles using Tailwind classes
        stepIndicators.forEach((ind, index) => {
            const num = index + 1;
            ind.className = 'step-indicator w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 ';
            
            if (num === state.activeWizardStep) {
                ind.classList.add('border-indigo-550', 'bg-indigo-600', 'text-white', 'shadow-md', 'shadow-indigo-550/20');
                ind.textContent = num;
            } else if (num < state.activeWizardStep) {
                ind.classList.add('border-emerald-500', 'bg-emerald-500', 'text-white');
                ind.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                ind.classList.add('border-slate-200', 'dark:border-slate-800', 'bg-slate-50', 'dark:bg-slate-950', 'text-slate-500');
                ind.textContent = num;
            }
        });

        // Handle lines between steps
        const lines = document.querySelectorAll('.modal-steps-indicator .step-line');
        lines.forEach((line, index) => {
            if (line) {
                if (index + 1 < state.activeWizardStep) {
                    line.className = 'step-line w-12 h-0.5 bg-indigo-500 transition-all duration-300';
                } else {
                    line.className = 'step-line w-12 h-0.5 bg-slate-200 dark:bg-slate-800 transition-all duration-300';
                }
            }
        });

        // Update recap on step 3
        if (state.activeWizardStep === 3) {
            updateRecapData();
        }
    }

    function updateRecapData() {
        const pSelect = document.getElementById('book-pickup-zone');
        const dSelect = document.getElementById('book-delivery-zone');
        const pZoneText = pSelect.options[pSelect.selectedIndex].text.split(' / ')[0];
        const dZoneText = dSelect.options[dSelect.selectedIndex].text.split(' / ')[0];

        const pTypeSelect = document.getElementById('book-package-type');
        const pTypeText = pTypeSelect.options[pTypeSelect.selectedIndex].text;

        const selectedServiceRadio = document.querySelector('input[name="book-service"]:checked');
        const serviceVal = selectedServiceRadio.value;
        const serviceText = serviceVal === 'express' ? 'Express (Moins de 3h)' : 'Standard (Dans la journée)';

        // Calculate summary price
        const pZone = parseInt(pSelect.value);
        const dZone = parseInt(dSelect.value);
        const sizeFactor = parseFloat(document.getElementById('book-package-size').value);
        
        const basePrice = 1500;
        const zoneDiff = Math.abs(pZone - dZone);
        let subtotal = basePrice;
        if (zoneDiff > 0) {
            subtotal += zoneDiff * 800;
        }

        let price = subtotal * sizeFactor;
        if (serviceVal === 'express') {
            price += 1000;
        }
        const finalPrice = Math.round(price / 100) * 100;

        // Write to DOM
        document.getElementById('sum-route').textContent = `${pZoneText} ➔ ${dZoneText}`;
        document.getElementById('sum-package').textContent = pTypeText;
        document.getElementById('sum-service').textContent = serviceText;
        document.getElementById('sum-total-price').textContent = finalPrice.toLocaleString('fr-FR') + ' FCFA';
        
        // Save price in state for success order screen
        state.lastOrderPrice = finalPrice;
        state.lastOrderRoute = `${pZoneText} ➔ ${dZoneText}`;
        state.lastOrderService = serviceVal === 'express' ? 'Express' : 'Standard';
    }

    // Step validation helper
    function validateStep(stepNum) {
        if (stepNum === 1) {
            return true; // Simple dropdowns, always valid
        }
        if (stepNum === 2) {
            const pickupPhone = document.getElementById('book-pickup-phone');
            const pickupAddr = document.getElementById('book-pickup-addr');
            const deliveryPhone = document.getElementById('book-delivery-phone');
            const deliveryAddr = document.getElementById('book-delivery-addr');

            let isValid = true;

            [pickupPhone, pickupAddr, deliveryPhone, deliveryAddr].forEach(input => {
                if (!input.value.trim()) {
                    input.classList.remove('border-slate-200', 'dark:border-slate-850');
                    input.classList.add('border-red-500');
                    isValid = false;
                } else {
                    input.classList.remove('border-red-500');
                    input.classList.add('border-slate-200', 'dark:border-slate-850');
                }
            });

            // Basic Senegal Phone verification (9 digits starting with 7)
            const phoneRegex = /^(77|78|76|75|70)\d{7}$/;
            [pickupPhone, deliveryPhone].forEach(phoneInput => {
                const cleaned = phoneInput.value.replace(/\s+/g, '');
                if (cleaned && !phoneRegex.test(cleaned)) {
                    phoneInput.classList.remove('border-slate-200', 'dark:border-slate-850');
                    phoneInput.classList.add('border-red-500');
                    isValid = false;
                    phoneInput.setAttribute('title', 'Numéro invalide (ex: 771234567)');
                }
            });

            return isValid;
        }
        return true;
    }

    // Wizard listeners
    next1.addEventListener('click', () => {
        if (validateStep(1)) {
            state.activeWizardStep = 2;
            updateWizardUI();
        }
    });

    next2.addEventListener('click', () => {
        if (validateStep(2)) {
            state.activeWizardStep = 3;
            updateWizardUI();
        }
    });

    prev2.addEventListener('click', () => {
        state.activeWizardStep = 1;
        updateWizardUI();
    });

    prev3.addEventListener('click', () => {
        state.activeWizardStep = 2;
        updateWizardUI();
    });

    // Wizard service card selection switcher
    document.querySelectorAll('.service-option-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.service-option-card').forEach(c => {
                c.classList.remove('border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/10');
                c.classList.add('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-950');
            });
            this.classList.add('border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/10');
            this.classList.remove('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-950');
            
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            updateRecapData();
        });
    });

    // ==========================================================================
    // 6. Booking Wizard Form Submit & Success Modal
    // ==========================================================================
    const successModal = document.getElementById('success-modal');
    const generatedTrackingCodeEl = document.getElementById('generated-tracking-code');
    const copyCodeBtn = document.getElementById('copy-code-btn');
    const successTrackNowBtn = document.getElementById('success-track-now-btn');
    const successCloseBtn = document.getElementById('success-close-btn');

    wizardForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('wizard-submit');
        const originalBtnHTML = submitBtn.innerHTML;
        
        // Disable button & show simulated loading spinner
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Traitement...';

        setTimeout(() => {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;

            // Generate unique random tracking number
            const randNum = Math.floor(1000 + Math.random() * 9000);
            const code = `LE-${randNum}-DK`;

            // Save state in dynamic DB
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            state.generatedTrackingCodes[code] = {
                service: state.lastOrderService,
                statusText: 'Attribution du coursier',
                step: 1,
                times: [timeStr, 'En attente', 'En attente', 'En attente']
            };

            // Setup success modal
            generatedTrackingCodeEl.textContent = code;
            
            // Swap modals
            closeBooking();
            
            // Open success modal
            successModal.classList.remove('opacity-0', 'pointer-events-none');
            successModal.classList.add('opacity-100', 'pointer-events-auto');
            
            const successContainer = successModal.querySelector('.modal-container');
            successContainer.classList.remove('scale-95', 'translate-y-4');
            successContainer.classList.add('scale-100', 'translate-y-0');

            document.body.style.overflow = 'hidden';

            // Reset form fields
            wizardForm.reset();
            state.activeWizardStep = 1;
            
            // Remove active classes from inputs
            document.querySelectorAll('#booking-wizard-form input, #booking-wizard-form select, #booking-wizard-form textarea').forEach(el => {
                el.classList.remove('border-red-500');
                el.classList.add('border-slate-200', 'dark:border-slate-850');
            });
        }, 1200);
    });

    // Close success modal
    function closeSuccess() {
        successModal.classList.add('opacity-0', 'pointer-events-none');
        successModal.classList.remove('opacity-100', 'pointer-events-auto');
        
        const successContainer = successModal.querySelector('.modal-container');
        successContainer.classList.add('scale-95', 'translate-y-4');
        successContainer.classList.remove('scale-100', 'translate-y-0');

        document.body.style.overflow = '';
    }

    if (successCloseBtn) successCloseBtn.addEventListener('click', closeSuccess);
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) closeSuccess();
    });

    // Copy to clipboard
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', () => {
            const code = generatedTrackingCodeEl.textContent;
            navigator.clipboard.writeText(code).then(() => {
                const icon = copyCodeBtn.querySelector('i');
                icon.className = 'fas fa-check text-emerald-500';
                
                setTimeout(() => {
                    icon.className = 'far fa-copy text-slate-400';
                }, 2000);
            }).catch(err => {
                console.error("Impossible de copier", err);
            });
        });
    }

    // Direct Track from success page
    if (successTrackNowBtn) {
        successTrackNowBtn.addEventListener('click', () => {
            const code = generatedTrackingCodeEl.textContent;
            closeSuccess();
            
            // Scroll to tracking section
            const trackingSec = document.getElementById('suivi');
            if (trackingSec) {
                trackingSec.scrollIntoView({ behavior: 'smooth' });
            }

            // Input and trigger search
            const trackingInput = document.getElementById('tracking-input');
            if (trackingInput) {
                trackingInput.value = code;
                setTimeout(() => {
                    document.getElementById('track-btn').click();
                }, 400);
            }
        });
    }

    // ==========================================================================
    // 7. Interactive Tracking Tool
    // ==========================================================================
    const trackingInput = document.getElementById('tracking-input');
    const trackBtn = document.getElementById('track-btn');
    const resultPanel = document.getElementById('tracking-result-panel');
    const errorPanel = document.getElementById('tracking-error-panel');

    function performTracking(code) {
        const cleanedCode = code.trim().toUpperCase();
        
        // Find in mock DB or dynamically created user orders
        const trackData = trackingDatabase[cleanedCode] || state.generatedTrackingCodes[cleanedCode];

        if (trackData) {
            // Hide errors, display result
            errorPanel.classList.add('hidden');
            resultPanel.classList.remove('hidden');

            // Populate text fields
            document.getElementById('res-tracking-code').textContent = cleanedCode;
            document.getElementById('res-service-type').textContent = trackData.service;
            
            const statusLabel = document.getElementById('res-status-text');
            statusLabel.textContent = trackData.statusText;

            // Highlight steps
            const totalSteps = 4;
            const currentStep = trackData.step;

            for (let i = 1; i <= totalSteps; i++) {
                const stepElement = document.getElementById(`step-${i}`);
                if (stepElement) {
                    const circle = stepElement.querySelector('.step-circle');
                    const title = stepElement.querySelector('h4');
                    const timeEl = stepElement.querySelector('.step-time');

                    // Reset styling classes using dual mode variants
                    circle.className = 'step-circle absolute -left-8 top-0.5 w-6.5 h-6.5 rounded-full border-2 flex items-center justify-center text-[10px] transition-all duration-300';
                    title.className = 'text-sm font-bold transition-colors';

                    if (i < currentStep) {
                        // Completed step
                        circle.classList.add('bg-emerald-500', 'border-emerald-500', 'text-white');
                        title.classList.add('text-slate-900', 'dark:text-white');
                    } else if (i === currentStep) {
                        // Active step
                        circle.classList.add('bg-indigo-600', 'border-indigo-600', 'text-white', 'ring-4', 'ring-indigo-600/20');
                        title.classList.add('text-indigo-600', 'dark:text-indigo-400', 'font-extrabold');
                    } else {
                        // Uncompleted step
                        circle.classList.add('bg-white', 'dark:bg-slate-950', 'border-slate-200', 'dark:border-slate-800', 'text-slate-400', 'dark:text-slate-500');
                        title.classList.add('text-slate-400', 'dark:text-slate-500');
                    }
                    
                    // Update step time text if available
                    if (timeEl && trackData.times[i - 1]) {
                        timeEl.textContent = trackData.times[i - 1];
                    }
                }
            }

            // Update status pulse color
            const statusDot = document.getElementById('res-status-dot');
            if (cleanedCode.includes('9104') || trackData.step === 4) {
                statusDot.className = 'w-2 h-2 rounded-full bg-emerald-500'; // Finished
            } else {
                statusDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse'; // Pulse active
            }

            // Calculate progress bar line height for stepper progress
            let progressHeight = '0%';
            if (currentStep === 1) progressHeight = '0%';
            else if (currentStep === 2) progressHeight = '33%';
            else if (currentStep === 3) progressHeight = '66%';
            else if (currentStep === 4) progressHeight = '100%';

            const progressLine = document.getElementById('stepper-progress-line');
            if (progressLine) {
                progressLine.style.height = progressHeight;
            }

        } else {
            // Show error panel, hide result panel
            resultPanel.classList.add('hidden');
            errorPanel.classList.remove('hidden');
            errorPanel.classList.add('flex');
        }
    }

    if (trackBtn) {
        trackBtn.addEventListener('click', () => {
            if (trackingInput.value.trim()) {
                performTracking(trackingInput.value);
            }
        });
    }

    if (trackingInput) {
        trackingInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && trackingInput.value.trim()) {
                performTracking(trackingInput.value);
            }
        });
    }

    // Badge buttons trigger search
    document.querySelectorAll('.badge-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            trackingInput.value = code;
            performTracking(code);
        });
    });

    // ==========================================================================
    // 8. FAQ Accordion dropdowns
    // ==========================================================================
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const isActive = faqItem.classList.contains('active');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // If it wasn't active, open it
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });

    // ==========================================================================
    // 9. Animated Statistics Counter (Intersection Observer)
    // ==========================================================================
    const statsSection = document.getElementById('stat-1')?.closest('section');
    const statNums = [
        document.getElementById('stat-1'),
        document.getElementById('stat-2'),
        document.getElementById('stat-3'),
        document.getElementById('stat-4')
    ].filter(el => el !== null);

    let observerStarted = false;

    if (statsSection && statNums.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            const [entry] = entries;
            
            if (entry.isIntersecting && !observerStarted) {
                observerStarted = true;
                
                statNums.forEach(numElement => {
                    const targetVal = parseInt(numElement.getAttribute('data-val'));
                    animateCount(numElement, targetVal);
                });

                // Unobserve once animation runs
                statsObserver.unobserve(statsSection);
            }
        }, {
            root: null,
            threshold: 0.1
        });

        statsObserver.observe(statsSection);
    }

    function animateCount(element, target) {
        let current = 0;
        const duration = 1200; // Total count duration (1.2s)
        const increment = target / (duration / 16); // ~60fps
        
        const countInterval = setInterval(() => {
            current += increment;
            
            if (element.getAttribute('data-val') === '99') {
                element.textContent = Math.round(current) + '%';
            } else if (element.getAttribute('data-val') === '15') {
                element.textContent = Math.round(current) + 'k+';
            } else {
                element.textContent = Math.round(current);
            }

            if (current >= target) {
                clearInterval(countInterval);
                if (target === 99) {
                    element.textContent = target + '%';
                } else if (target === 15) {
                    element.textContent = target + 'k+';
                } else {
                    element.textContent = target + '+';
                }
            }
        }, 16);
    }

    // ==========================================================================
    // 10. Preloader
    // ==========================================================================
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const dismissPreloader = () => {
            preloader.classList.add('fade-out');
            setTimeout(() => preloader.remove(), 500);
        };
        // Dismiss after progress bar animation (1.8s) + small buffer
        setTimeout(dismissPreloader, 2200);
        // Safety: also dismiss on window load
        window.addEventListener('load', () => setTimeout(dismissPreloader, 600));
    }

    // ==========================================================================
    // 11. Back to Top Button
    // ==========================================================================
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==========================================================================
    // 12. Toast Notification System
    // ==========================================================================
    const toastContainer = document.getElementById('toast-container');

    function showToast(message, type = 'success', duration = 3500) {
        if (!toastContainer) return;

        const iconMap = {
            success: 'fa-check-circle text-emerald-500',
            error: 'fa-circle-exclamation text-red-500',
            info: 'fa-circle-info text-indigo-500',
            warning: 'fa-triangle-exclamation text-amber-500'
        };

        const toast = document.createElement('div');
        toast.className = 'toast bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 min-w-[280px] max-w-sm';
        toast.innerHTML = `
            <i class="fas ${iconMap[type] || iconMap.info} text-lg"></i>
            <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 flex-1">${message}</span>
            <button class="toast-close text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer text-sm">
                <i class="fas fa-xmark"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        const dismiss = () => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        };
        closeBtn.addEventListener('click', dismiss);
        setTimeout(dismiss, duration);
    }

    // Override copy button to use toast
    if (copyCodeBtn) {
        copyCodeBtn.replaceWith(copyCodeBtn.cloneNode(true));
        const newCopyBtn = document.getElementById('copy-code-btn');
        newCopyBtn.addEventListener('click', () => {
            const code = document.getElementById('generated-tracking-code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                const icon = newCopyBtn.querySelector('i');
                icon.className = 'fas fa-check text-emerald-500';
                setTimeout(() => { icon.className = 'far fa-copy text-slate-400'; }, 2000);
                showToast('Code de suivi copié !', 'success');
            }).catch(() => showToast('Impossible de copier', 'error'));
        });
    }

    // ==========================================================================
    // 13. Scroll Reveal Animations
    // ==========================================================================
    const revealSelectors = [
        '#fonctionnement .grid > div',
        '#tarifs .grid > div',
        'section:not(#newsletter) .grid.grid-cols-1.md\\:grid-cols-3 > div',
        '#suivi .max-w-2xl',
        '#faq .max-w-2xl .faq-item',
        '#localisation .max-w-4xl',
        '#newsletter .max-w-xl'
    ];

    const revealElements = document.querySelectorAll(revealSelectors.join(', '));
    revealElements.forEach(el => el.classList.add('scroll-reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { root: null, threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // ==========================================================================
    // 14. Newsletter Form
    // ==========================================================================
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const submitBtn = document.getElementById('newsletter-submit');
            const email = emailInput.value.trim();

            if (!email) return;

            // Simulate sending
            const originalHTML = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Envoi...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
                emailInput.value = '';
                showToast(`${email} inscrit avec succès !`, 'success');
            }, 1000);
        });
    }

    // ==========================================================================
    // 15. Order History (localStorage)
    // ==========================================================================
    const historyModal = document.getElementById('history-modal');
    const openHistoryBtn = document.getElementById('open-history-btn');
    const closeHistoryBtn = document.getElementById('close-history-modal');
    const historyList = document.getElementById('history-list');
    const historyEmpty = document.getElementById('history-empty');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    function getOrderHistory() {
        try {
            return JSON.parse(localStorage.getItem('libreexpress_orders') || '[]');
        } catch { return []; }
    }

    function saveOrderHistory(orders) {
        localStorage.setItem('libreexpress_orders', JSON.stringify(orders));
    }

    function addOrderToHistory(order) {
        const orders = getOrderHistory();
        orders.unshift(order);
        if (orders.length > 20) orders.pop();
        saveOrderHistory(orders);
    }

    function renderOrderHistory() {
        const orders = getOrderHistory();
        // Clear all cards except the empty placeholder
        historyList.querySelectorAll('.history-card').forEach(c => c.remove());

        if (orders.length === 0) {
            historyEmpty.classList.remove('hidden');
            clearHistoryBtn.classList.add('hidden');
            return;
        }

        historyEmpty.classList.add('hidden');
        clearHistoryBtn.classList.remove('hidden');

        orders.forEach((order, idx) => {
            const card = document.createElement('div');
            card.className = 'history-card bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-left';
            card.style.animationDelay = `${idx * 0.05}s`;

            const serviceColor = order.service === 'Express'
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20'
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20';

            card.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <strong class="text-sm font-heading font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">${order.code}</strong>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${serviceColor}">${order.service}</span>
                </div>
                <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span><i class="fas fa-route mr-1 text-slate-400"></i>${order.route}</span>
                    <span>${order.price} FCFA</span>
                </div>
                <div class="text-[10px] text-slate-400 dark:text-slate-600 mt-2">
                    <i class="far fa-clock mr-1"></i>${order.date}
                </div>
            `;
            historyList.appendChild(card);
        });
    }

    function openHistory() {
        renderOrderHistory();
        historyModal.classList.remove('opacity-0', 'pointer-events-none');
        historyModal.classList.add('opacity-100', 'pointer-events-auto');
        const container = historyModal.querySelector('.modal-container');
        container.classList.remove('scale-95', 'translate-y-4');
        container.classList.add('scale-100', 'translate-y-0');
        document.body.style.overflow = 'hidden';
    }

    function closeHistory() {
        historyModal.classList.add('opacity-0', 'pointer-events-none');
        historyModal.classList.remove('opacity-100', 'pointer-events-auto');
        const container = historyModal.querySelector('.modal-container');
        container.classList.add('scale-95', 'translate-y-4');
        container.classList.remove('scale-100', 'translate-y-0');
        document.body.style.overflow = '';
    }

    if (openHistoryBtn) openHistoryBtn.addEventListener('click', openHistory);
    if (closeHistoryBtn) closeHistoryBtn.addEventListener('click', closeHistory);
    if (historyModal) historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) closeHistory();
    });

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            localStorage.removeItem('libreexpress_orders');
            renderOrderHistory();
            showToast('Historique vidé', 'info');
        });
    }

    // Patch booking submit to also save order to history
    const origSubmitHandler = wizardForm.onsubmit;
    wizardForm.addEventListener('submit', () => {
        // Runs after the existing handler sets up the setTimeout
        // We hook into the success modal display to capture order data
        const checkInterval = setInterval(() => {
            if (!successModal.classList.contains('opacity-0')) {
                clearInterval(checkInterval);
                const code = generatedTrackingCodeEl.textContent;
                const now = new Date();
                const dateStr = now.toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                addOrderToHistory({
                    code: code,
                    service: state.lastOrderService,
                    route: state.lastOrderRoute,
                    price: state.lastOrderPrice.toLocaleString('fr-FR'),
                    date: dateStr
                });
                showToast('Commande enregistrée dans votre historique', 'success');
            }
        }, 200);
        // Safety: clear after 5s
        setTimeout(() => clearInterval(checkInterval), 5000);
    });

    // ==========================================================================
    // 16. PWA Service Worker Registration
    // ==========================================================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(() => {});
        });
    }

    // PWA install prompt
    let deferredInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;

        // Show install toast after 5 seconds
        setTimeout(() => {
            if (deferredInstallPrompt) {
                const installToast = document.createElement('div');
                installToast.className = 'toast bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 min-w-[280px] max-w-sm';
                installToast.innerHTML = `
                    <i class="fas fa-download text-lg text-indigo-500"></i>
                    <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 flex-1">Installer LibreExpress ?</span>
                    <button id="pwa-install-accept" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg cursor-pointer">Installer</button>
                    <button class="toast-close text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer text-sm">
                        <i class="fas fa-xmark"></i>
                    </button>
                `;
                if (toastContainer) {
                    toastContainer.appendChild(installToast);
                    document.getElementById('pwa-install-accept').addEventListener('click', () => {
                        deferredInstallPrompt.prompt();
                        deferredInstallPrompt = null;
                        installToast.classList.add('toast-exit');
                        setTimeout(() => installToast.remove(), 300);
                    });
                    installToast.querySelector('.toast-close').addEventListener('click', () => {
                        installToast.classList.add('toast-exit');
                        setTimeout(() => installToast.remove(), 300);
                    });
                }
            }
        }, 5000);
    });

    // ==========================================================================
    // 17. Command Palette (Ctrl+K)
    // ==========================================================================
    const cmdPalette = document.getElementById('cmd-palette');
    const cmdInput = document.getElementById('cmd-input');
    const cmdItems = document.querySelectorAll('.cmd-item');
    let cmdActiveIdx = -1;

    function openCmd() {
        cmdPalette.classList.add('active');
        cmdInput.value = '';
        cmdInput.focus();
        cmdActiveIdx = -1;
        cmdItems.forEach(i => { i.classList.remove('active'); i.style.display = ''; });
    }
    function closeCmd() { cmdPalette.classList.remove('active'); }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); cmdPalette.classList.contains('active') ? closeCmd() : openCmd(); }
        if (e.key === 'Escape' && cmdPalette.classList.contains('active')) closeCmd();
        if (!cmdPalette.classList.contains('active')) return;
        const visible = [...cmdItems].filter(i => i.style.display !== 'none');
        if (e.key === 'ArrowDown') { e.preventDefault(); cmdActiveIdx = Math.min(cmdActiveIdx + 1, visible.length - 1); visible.forEach((v, i) => v.classList.toggle('active', i === cmdActiveIdx)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); cmdActiveIdx = Math.max(cmdActiveIdx - 1, 0); visible.forEach((v, i) => v.classList.toggle('active', i === cmdActiveIdx)); }
        if (e.key === 'Enter' && cmdActiveIdx >= 0 && visible[cmdActiveIdx]) { visible[cmdActiveIdx].click(); }
    });

    cmdInput.addEventListener('input', () => {
        const q = cmdInput.value.toLowerCase();
        cmdItems.forEach(item => {
            const text = item.querySelector('span').textContent.toLowerCase();
            item.style.display = text.includes(q) ? '' : 'none';
        });
        cmdActiveIdx = -1;
    });

    cmdItems.forEach(item => {
        item.addEventListener('click', () => {
            closeCmd();
            const href = item.dataset.href;
            const action = item.dataset.action;
            if (href) { document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); }
            if (action === 'booking') openBooking(false);
            if (action === 'history') openHistory();
            if (action === 'theme') { state.theme = state.theme === 'light' ? 'dark' : 'light'; applyTheme(state.theme); }
        });
    });

    cmdPalette.addEventListener('click', (e) => { if (e.target === cmdPalette) closeCmd(); });

    // ==========================================================================
    // 18. Navbar Shrink on Scroll
    // ==========================================================================
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) navbar.classList.add('shrink');
        else navbar.classList.remove('shrink');
    }, { passive: true });

    // ==========================================================================
    // 19. Promo Code System
    // ==========================================================================
    const promoCodes = { 'BIENVENUE': 15, 'LIBRE10': 10, 'VIP25': 25, 'DAKAR20': 20 };
    let appliedPromo = null;

    const promoToggle = document.getElementById('promo-toggle');
    const promoField = document.getElementById('promo-field');
    const promoChevron = document.getElementById('promo-chevron');
    const promoApply = document.getElementById('promo-apply');
    const promoInput = document.getElementById('promo-input');
    const promoResult = document.getElementById('promo-result');

    if (promoToggle) {
        promoToggle.addEventListener('click', () => {
            promoField.classList.toggle('hidden');
            promoChevron.style.transform = promoField.classList.contains('hidden') ? '' : 'rotate(180deg)';
        });
    }

    if (promoApply) {
        promoApply.addEventListener('click', () => {
            const code = promoInput.value.trim().toUpperCase();
            promoResult.classList.remove('hidden');
            if (promoCodes[code]) {
                appliedPromo = { code, discount: promoCodes[code] };
                promoResult.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400"><i class="fas fa-check-circle mr-1"></i>-${promoCodes[code]}% appliqué (${code})</span>`;
                showToast(`Code promo ${code} appliqué : -${promoCodes[code]}%`, 'success');
                updateRecapData();
            } else {
                appliedPromo = null;
                promoResult.innerHTML = `<span class="text-red-500"><i class="fas fa-xmark mr-1"></i>Code invalide</span>`;
                showToast('Code promo invalide', 'error');
            }
        });
    }

    // Patch updateRecapData to apply promo discount
    const _origUpdateRecap = updateRecapData;
    updateRecapData = function() {
        _origUpdateRecap();
        if (appliedPromo) {
            const totalEl = document.getElementById('sum-total-price');
            const current = parseInt(totalEl.textContent.replace(/\s/g, ''));
            if (!isNaN(current)) {
                const discounted = Math.round(current * (1 - appliedPromo.discount / 100) / 100) * 100;
                totalEl.innerHTML = `<span class="line-through text-slate-400 text-sm mr-2">${current.toLocaleString('fr-FR')}</span>${discounted.toLocaleString('fr-FR')} FCFA`;
                state.lastOrderPrice = discounted;
            }
        }
    };

    // ==========================================================================
    // 20. Rating System
    // ==========================================================================
    const ratingModal = document.getElementById('rating-modal');
    const closeRating = document.getElementById('close-rating');
    const ratingStars = document.querySelectorAll('.rate-star');
    const submitRating = document.getElementById('submit-rating');
    let selectedRating = 0;

    function openRating() {
        selectedRating = 0;
        ratingStars.forEach(s => s.classList.remove('selected'));
        document.getElementById('rating-comment').value = '';
        ratingModal.classList.remove('opacity-0', 'pointer-events-none');
        ratingModal.classList.add('opacity-100', 'pointer-events-auto');
        ratingModal.querySelector('.modal-container').classList.remove('scale-95', 'translate-y-4');
        ratingModal.querySelector('.modal-container').classList.add('scale-100', 'translate-y-0');
    }
    function closeRatingModal() {
        ratingModal.classList.add('opacity-0', 'pointer-events-none');
        ratingModal.classList.remove('opacity-100', 'pointer-events-auto');
        ratingModal.querySelector('.modal-container').classList.add('scale-95', 'translate-y-4');
        ratingModal.querySelector('.modal-container').classList.remove('scale-100', 'translate-y-0');
    }

    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.val);
            ratingStars.forEach(s => s.classList.toggle('selected', parseInt(s.dataset.val) <= selectedRating));
        });
        star.addEventListener('mouseenter', () => {
            const v = parseInt(star.dataset.val);
            ratingStars.forEach(s => s.classList.toggle('selected', parseInt(s.dataset.val) <= v));
        });
    });
    document.getElementById('rating-stars')?.addEventListener('mouseleave', () => {
        ratingStars.forEach(s => s.classList.toggle('selected', parseInt(s.dataset.val) <= selectedRating));
    });

    if (closeRating) closeRating.addEventListener('click', closeRatingModal);
    if (ratingModal) ratingModal.addEventListener('click', (e) => { if (e.target === ratingModal) closeRatingModal(); });
    if (submitRating) submitRating.addEventListener('click', () => {
        if (selectedRating === 0) { showToast('Veuillez sélectionner une note', 'warning'); return; }
        closeRatingModal();
        showToast(`Merci pour votre avis (${selectedRating}/5) !`, 'success');
    });

    // Trigger rating after viewing a delivered order
    const origPerformTracking = performTracking;
    performTracking = function(code) {
        origPerformTracking(code);
        const data = trackingDatabase[code.trim().toUpperCase()] || state.generatedTrackingCodes[code.trim().toUpperCase()];
        if (data && data.step === 4) { setTimeout(openRating, 1500); }
    };

    // ==========================================================================
    // 21. Multilingual FR/EN
    // ==========================================================================
    const translations = {
        en: {
            'Simulateur': 'Simulator', 'Suivi Colis': 'Track Package', 'Comment ça marche': 'How it works',
            'Offres': 'Plans', 'FAQ': 'FAQ', 'Commander': 'Order Now', 'Réserver un coursier': 'Book a courier',
            'Suivre mon colis': 'Track my package', 'Estimer le tarif': 'Estimate price',
            'Questions fréquentes': 'Frequently asked', 'Nos formules de livraison': 'Our delivery plans',
            'Restez informé': 'Stay informed', 'Retrouvez-nous à Dakar': 'Find us in Dakar',
            'Parrainez, gagnez !': 'Refer & earn!', 'Nos zones de livraison': 'Our delivery zones',
            'Localiser': 'Locate', 'Fermer': 'Close'
        }
    };
    let currentLang = 'fr';
    const langToggles = document.querySelectorAll('#lang-toggle, #mobile-lang-toggle');
    const mobileLangText = document.getElementById('mobile-lang-text');

    langToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            currentLang = currentLang === 'fr' ? 'en' : 'fr';
            
            langToggles.forEach(t => {
                if (t.id === 'mobile-lang-toggle' && mobileLangText) {
                    mobileLangText.textContent = currentLang === 'fr' ? 'Langue: FR' : 'Language: EN';
                } else {
                    t.textContent = currentLang.toUpperCase();
                }
            });

            applyLang();
            showToast(currentLang === 'en' ? 'Switched to English' : 'Langue française activée', 'info');
        });
    });

    const mobileHistoryBtn = document.getElementById('mobile-history-btn');
    if (mobileHistoryBtn) {
        mobileHistoryBtn.addEventListener('click', () => {
            // Close mobile menu
            navMenu.classList.add('hidden');
            burger1.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 transition-all duration-300';
            burger2.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 transition-all duration-300';
            burger3.className = 'w-5 h-0.5 bg-slate-700 dark:bg-slate-200 transition-all duration-300';
            openHistory();
        });
    }

    function applyLang() {
        if (currentLang === 'fr') {
            document.querySelectorAll('[data-i18n-original]').forEach(el => {
                el.textContent = el.dataset.i18nOriginal;
            });
            return;
        }
        const dict = translations.en;
        // Find text nodes to translate
        document.querySelectorAll('h1, h2, h3, a, button, span').forEach(el => {
            const text = el.childNodes[0]?.nodeValue?.trim();
            if (text && dict[text]) {
                if (!el.dataset.i18nOriginal) el.dataset.i18nOriginal = text;
                el.childNodes[0].nodeValue = el.childNodes[0].nodeValue.replace(text, dict[text]);
            }
        });
    }

    // ==========================================================================
    // 22. Live Chat Widget
    // ==========================================================================
    const chatPanel = document.getElementById('chat-panel');
    const chatToggleBtn = document.getElementById('chat-toggle');
    const closeChatBtn = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    const botReplies = [
        'Nos coursiers couvrent tout Dakar et sa banlieue !',
        'Le temps moyen de livraison Express est de 35 minutes.',
        'Vous pouvez suivre votre colis en temps réel depuis la section Suivi.',
        'Pour les envois volumineux, contactez-nous via WhatsApp.',
        'Nos tarifs commencent à 1 500 FCFA pour les zones centrales.',
        'Je vous invite à utiliser notre simulateur pour estimer le coût.',
    ];

    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', () => {
            chatPanel.classList.add('open');
            chatToggleBtn.style.display = 'none';
            chatInput.focus();
        });
    }
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            chatPanel.classList.remove('open');
            chatToggleBtn.style.display = '';
        });
    }

    function sendChatMsg() {
        const msg = chatInput.value.trim();
        if (!msg) return;
        // User message
        const userBubble = document.createElement('div');
        userBubble.className = 'chat-msg flex gap-2 justify-end';
        userBubble.innerHTML = `<div class="bg-indigo-600 text-white rounded-xl rounded-tr-none px-3 py-2 text-xs max-w-[85%]">${msg}</div>`;
        chatMessages.appendChild(userBubble);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Bot reply
        setTimeout(() => {
            const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
            const botBubble = document.createElement('div');
            botBubble.className = 'chat-msg flex gap-2';
            botBubble.innerHTML = `<div class="w-6 h-6 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-[10px] shrink-0"><i class="fas fa-headset"></i></div><div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl rounded-tl-none px-3 py-2 text-xs text-slate-700 dark:text-slate-300 max-w-[85%]">${reply}</div>`;
            chatMessages.appendChild(botBubble);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 800 + Math.random() * 700);
    }

    if (chatSend) chatSend.addEventListener('click', sendChatMsg);
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMsg(); });

    // ==========================================================================
    // 23. Referral System
    // ==========================================================================
    const refCode = 'LIBRE-' + Math.floor(1000 + Math.random() * 9000);
    const refCodeEl = document.getElementById('referral-code');
    const copyRefBtn = document.getElementById('copy-referral');
    const refBox = document.getElementById('referral-box');

    if (refCodeEl) refCodeEl.textContent = refCode;

    // Set share links
    const refMsg = encodeURIComponent(`Utilise mon code ${refCode} sur LibreExpress pour une réduction ! 🚀`);
    const refWA = document.getElementById('ref-whatsapp');
    const refFB = document.getElementById('ref-facebook');
    const refTW = document.getElementById('ref-twitter');
    if (refWA) refWA.href = `https://wa.me/?text=${refMsg}`;
    if (refFB) refFB.href = `https://www.facebook.com/sharer/sharer.php?quote=${refMsg}`;
    if (refTW) refTW.href = `https://twitter.com/intent/tweet?text=${refMsg}`;

    if (copyRefBtn) {
        copyRefBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(refCode).then(() => {
                refBox.classList.add('copied');
                copyRefBtn.innerHTML = '<i class="fas fa-check text-sm"></i>';
                showToast('Code de parrainage copié !', 'success');
                setTimeout(() => { refBox.classList.remove('copied'); copyRefBtn.innerHTML = '<i class="far fa-copy text-sm"></i>'; }, 2000);
            });
        });
    }

    // ==========================================================================
    // 24. Live Dashboard Auto-update
    // ==========================================================================
    function updateDashboard() {
        const dashActive = document.getElementById('dash-active');
        const dashCouriers = document.getElementById('dash-couriers');
        const dashToday = document.getElementById('dash-today');
        const dashAvg = document.getElementById('dash-avg');
        if (!dashActive) return;

        const active = 8 + Math.floor(Math.random() * 12);
        const couriers = 30 + Math.floor(Math.random() * 18);
        const today = 75 + Math.floor(Math.random() * 30);
        const avg = 22 + Math.floor(Math.random() * 15);

        dashActive.innerHTML = `${active} <span class="dash-dot w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>`;
        dashCouriers.textContent = couriers;
        dashToday.textContent = today;
        dashAvg.textContent = `${avg} min`;
    }
    setInterval(updateDashboard, 8000);

    // ==========================================================================
    // 25. Push Notification Permission
    // ==========================================================================
    if ('Notification' in window && Notification.permission === 'default') {
        setTimeout(() => {
            showToast('Activer les notifications pour suivre vos colis ?', 'info', 6000);
            // Request after interaction
            document.addEventListener('click', function reqNotif() {
                if (Notification.permission === 'default') {
                    Notification.requestPermission().then(perm => {
                        if (perm === 'granted') showToast('Notifications activées !', 'success');
                    });
                }
                document.removeEventListener('click', reqNotif);
            }, { once: true });
        }, 10000);
    }

    // ==========================================================================
    // 26. Coverage zones scroll reveal (auto-handled by section 13)
    // ==========================================================================
    document.querySelectorAll('#zones .zone-card, #dashboard .dash-card, #parrainage .max-w-2xl').forEach(el => {
        el.classList.add('scroll-reveal');
        revealObserver.observe(el);
    });



    // ==========================================================================
    // 28. Confetti Animation (Canvas-based)
    // ==========================================================================
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let animationId = null;

    function resizeConfetti() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    window.addEventListener('resize', resizeConfetti);
    resizeConfetti();

    class ConfettiParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = -10 - Math.random() * 20;
            this.size = 6 + Math.random() * 8;
            this.color = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 5)];
            this.speedX = -1.5 + Math.random() * 3;
            this.speedY = 3 + Math.random() * 4;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = -2 + Math.random() * 4;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    function triggerConfetti() {
        resizeConfetti();
        particles = [];
        for (let i = 0; i < 120; i++) {
            particles.push(new ConfettiParticle());
        }
        if (animationId) cancelAnimationFrame(animationId);
        tickConfetti();

    }

    function tickConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        particles = particles.filter(p => p.y < canvas.height);
        if (particles.length > 0) {
            animationId = requestAnimationFrame(tickConfetti);
        }
    }

    // Trigger confetti on successful booking
    const originalShowSuccess = showSuccessModal;
    showSuccessModal = function(code) {
        originalShowSuccess(code);
        setTimeout(triggerConfetti, 100);
    };

    // ==========================================================================
    // 29. SMS Simulator Notification (iOS-style push)
    // ==========================================================================
    const smsContainer = document.getElementById('sms-simulator-container');

    function triggerSMS(message) {
        if (!smsContainer) return;
        const sms = document.createElement('div');
        sms.className = 'sms-notification bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl flex gap-3 pointer-events-auto max-w-sm mb-3';
        sms.innerHTML = `
            <div class="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 text-xs">
                <i class="fas fa-comment-sms"></i>
            </div>
            <div class="flex-1 text-left">
                <div class="flex justify-between items-center mb-0.5">
                    <strong class="text-xs font-bold text-slate-800 dark:text-white">LibreExpress SMS</strong>
                    <span class="text-[9px] text-slate-450 dark:text-slate-500">À l'instant</span>
                </div>
                <p class="text-xs text-slate-650 dark:text-slate-350 leading-snug">${message}</p>
            </div>
        `;
        smsContainer.appendChild(sms);


        setTimeout(() => {
            sms.classList.add('sms-exit');
            setTimeout(() => sms.remove(), 400);
        }, 5500);
    }

    // ==========================================================================
    // 30. Courier / Admin Simulator Panel
    // ==========================================================================
    const adminPortal = document.getElementById('admin-portal');
    const closeAdminBtn = document.getElementById('close-admin');
    const adminSelect = document.getElementById('admin-package-select');
    const adminActions = document.getElementById('admin-package-actions');
    const adminEmpty = document.getElementById('admin-empty-orders');
    const adminRoute = document.getElementById('admin-route');
    const adminStatus = document.getElementById('admin-status');

    // Add Command Palette link trigger
    cmdItems.forEach(item => {
        if (item.dataset.action === 'admin') {
            item.remove(); // clear duplicate if any
        }
    });
    // Add command to list
    const cmdList = document.getElementById('cmd-list');
    if (cmdList) {
        const adminLi = document.createElement('li');
        adminLi.className = 'cmd-item flex items-center gap-3 px-5 py-2.5 cursor-pointer';
        adminLi.dataset.action = 'admin';
        adminLi.innerHTML = '<i class="fas fa-user-gear text-indigo-500 w-5 text-center"></i><span class="text-sm text-slate-700 dark:text-slate-300">Portail Admin / Coursier</span>';
        cmdList.appendChild(adminLi);
        adminLi.addEventListener('click', () => { closeCmd(); openAdmin(); });
    }

    function openAdmin() {
        populateAdminPackages();
        adminPortal.classList.remove('opacity-0', 'pointer-events-none');
        adminPortal.classList.add('opacity-100', 'pointer-events-auto');
        adminPortal.querySelector('.modal-container').classList.remove('scale-95', 'translate-y-4');
        adminPortal.querySelector('.modal-container').classList.add('scale-100', 'translate-y-0');
        document.body.style.overflow = 'hidden';
    }

    function closeAdminPortal() {
        adminPortal.classList.add('opacity-0', 'pointer-events-none');
        adminPortal.classList.remove('opacity-100', 'pointer-events-auto');
        adminPortal.querySelector('.modal-container').classList.add('scale-95', 'translate-y-4');
        adminPortal.querySelector('.modal-container').classList.remove('scale-100', 'translate-y-0');
        document.body.style.overflow = '';
    }

    if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdminPortal);
    if (adminPortal) adminPortal.addEventListener('click', (e) => { if (e.target === adminPortal) closeAdminPortal(); });

    function populateAdminPackages() {
        // Clear previous options except first
        adminSelect.innerHTML = '<option value="">-- Sélectionner un colis actif --</option>';
        const allPackages = Object.keys(state.generatedTrackingCodes);

        if (allPackages.length === 0) {
            adminActions.classList.add('hidden');
            adminEmpty.classList.remove('hidden');
            return;
        }

        adminEmpty.classList.add('hidden');
        allPackages.forEach(code => {
            const opt = document.createElement('option');
            opt.value = code;
            opt.textContent = `${code} (vers ${state.generatedTrackingCodes[code].toZone})`;
            adminSelect.appendChild(opt);
        });
    }

    if (adminSelect) {
        adminSelect.addEventListener('change', () => {
            const code = adminSelect.value;
            if (!code) {
                adminActions.classList.add('hidden');
                return;
            }
            adminActions.classList.remove('hidden');
            const data = state.generatedTrackingCodes[code];
            adminRoute.textContent = `${data.fromZone} ➔ ${data.toZone}`;
            adminStatus.textContent = getStatusName(data.step);
            updateAdminButtonsState(data.step);
        });
    }

    function getStatusName(step) {
        switch (step) {
            case 1: return 'Reçu';
            case 2: return 'Colis collecté';
            case 3: return 'En cours de livraison';
            case 4: return 'Livré';
            default: return 'Inconnu';
        }
    }

    function updateAdminButtonsState(currentStep) {
        document.querySelectorAll('.admin-status-btn').forEach(btn => {
            const step = parseInt(btn.dataset.step);
            if (step === currentStep) {
                btn.className = 'admin-status-btn px-4 py-2.5 bg-indigo-600 text-white text-[10px] font-bold rounded-xl cursor-default';
            } else {
                btn.className = 'admin-status-btn px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-xl cursor-pointer transition-all';
            }
        });
    }

    document.querySelectorAll('.admin-status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = adminSelect.value;
            if (!code) return;
            const newStep = parseInt(btn.dataset.step);
            const p = state.generatedTrackingCodes[code];
            if (p.step === newStep) return;

            p.step = newStep;
            adminStatus.textContent = getStatusName(newStep);
            updateAdminButtonsState(newStep);

            // Trigger SMS Simulation
            const msgMap = {
                1: `Votre envoi ${code} a été reçu par notre centre logistique.`,
                2: `Le coursier a collecté votre colis ${code}. Livraison estimée sous peu !`,
                3: `Le colis ${code} est en cours de livraison par notre coursier.`,
                4: `Votre colis ${code} a été livré avec succès. Merci de votre confiance !`
            };
            triggerSMS(msgMap[newStep]);

            // Sync with tracking view if active
            const currentTrackedCode = document.getElementById('res-tracking-code')?.textContent;
            if (currentTrackedCode && currentTrackedCode.trim() === code) {
                performTracking(code);
            }
        });
    });

    // ==========================================================================
    // 31. GPS Route/Couriers Live Movement Simulation
    // ==========================================================================
    const gpsBox = document.getElementById('gps-simulation-box');
    const gpsFrom = document.getElementById('gps-from-zone');
    const gpsTo = document.getElementById('gps-to-zone');
    const gpsEta = document.getElementById('gps-eta-text');
    const gpsActiveBar = document.getElementById('gps-active-bar');
    const gpsBike = document.getElementById('gps-bike');
    let gpsInterval = null;

    // Patch performTracking to show/update GPS simulation
    const origPerformTrackingGPS = performTracking;
    performTracking = function(code) {
        origPerformTrackingGPS(code);
        const data = trackingDatabase[code.trim().toUpperCase()] || state.generatedTrackingCodes[code.trim().toUpperCase()];

        if (gpsInterval) clearInterval(gpsInterval);

        if (!data || data.step === 4) {
            gpsBox.classList.add('hidden');
            return;
        }

        gpsBox.classList.remove('hidden');
        gpsFrom.textContent = data.fromZone;
        gpsTo.textContent = data.toZone;

        // Animate motorcycle movement based on step
        let targetPct = 0;
        let eta = '35 min';

        if (data.step === 1) { targetPct = 10; eta = '45 min'; }
        else if (data.step === 2) { targetPct = 40; eta = '25 min'; }
        else if (data.step === 3) { targetPct = 75; eta = '10 min'; }

        gpsActiveBar.style.width = `${targetPct}%`;
        gpsBike.style.left = `${targetPct}%`;
        gpsEta.textContent = eta;

        // Active simulation wiggle / small updates
        let pct = targetPct;
        gpsInterval = setInterval(() => {
            if (data.step === 4) {
                clearInterval(gpsInterval);
                gpsBox.classList.add('hidden');
                return;
            }
            // Add a small jitter simulating real-time GPS progress
            const jitter = -1.5 + Math.random() * 3;
            const simulatedPct = Math.max(0, Math.min(95, pct + jitter));
            gpsActiveBar.style.width = `${simulatedPct}%`;
            gpsBike.style.left = `${simulatedPct}%`;
        }, 3000);
    };


});
