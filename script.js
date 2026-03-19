/**
 * script.js
 * Handles countdown timer and scroll animations
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. COUNTDOWN TIMER ---
    // Target date: Reception on Monday 27 April 2026, 17:00:00 (5:00 PM)
    const targetDate = new Date("April 27, 2026 17:00:00").getTime();

    const dEl = document.getElementById("days");
    const hEl = document.getElementById("hours");
    const mEl = document.getElementById("minutes");
    const sEl = document.getElementById("seconds");

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            // Already passed
            dEl.innerText = "00";
            hEl.innerText = "00";
            mEl.innerText = "00";
            sEl.innerText = "00";
            return;
        }

        // Time calculations
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update DOM with leading zeros
        if (dEl) dEl.innerText = days < 10 ? "0" + days : days;
        if (hEl) hEl.innerText = hours < 10 ? "0" + hours : hours;
        if (mEl) mEl.innerText = minutes < 10 ? "0" + minutes : minutes;
        if (sEl) sEl.innerText = seconds < 10 ? "0" + seconds : seconds;
    }

    // Run immediately, then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);


    // --- 2. SCROLL ANIMATIONS (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible if you only want it to fade in once
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-element, .hero-content');
    scrollElements.forEach(el => observer.observe(el));

    // --- 3. SPLASH SCREEN & AUDIO ---
    const splashScreen = document.getElementById('splash-screen');
    const btnOpenInvite = document.getElementById('btn-open-invite');
    const musicToggleBtn = document.getElementById('music-toggle');
    const musicIcon = musicToggleBtn ? musicToggleBtn.querySelector('i') : null;
    const bgMusic = document.getElementById('bgMusic');

    let isMusicPlaying = false;

    // Fade in audio function
    function fadeInAudio() {
        if (!bgMusic) return;
        bgMusic.volume = 0;
        
        let playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                isMusicPlaying = true;
                if (musicIcon) {
                    musicIcon.classList.remove('fa-volume-xmark');
                    musicIcon.classList.add('fa-music');
                }
                
                // Gradually increase volume to 0.5 over 2.5 seconds
                let vol = 0;
                let fadeInterval = setInterval(() => {
                    vol += 0.02;
                    if (vol >= 0.5) {
                        vol = 0.5;
                        clearInterval(fadeInterval);
                    }
                    bgMusic.volume = vol;
                }, 100);
            }).catch(error => {
                console.log("Audio playback was prevented:", error);
            });
        }
    }

    if (btnOpenInvite && splashScreen) {
        document.body.style.overflow = 'hidden';

        btnOpenInvite.addEventListener('click', () => {
            // Fade out the button instantly
            btnOpenInvite.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            btnOpenInvite.style.opacity = '0';
            btnOpenInvite.style.transform = 'translateZ(100px)';

            // Wait exactly 1 second for silent black screen pause
            setTimeout(() => {
                btnOpenInvite.style.display = 'none';
                
                // --- T = 0s ---
                // Start Audio
                fadeInAudio();
                
                // Start center glow
                const centerGlow = document.getElementById('center-glow');
                if (centerGlow) centerGlow.classList.add('active');

                // Trigger Parallax Drift
                const scene3d = document.getElementById('scene-3d');
                if (scene3d) scene3d.classList.add('animate-camera');

                // Generate Intro Particles (Dust)
                const introParticlesLayer = document.getElementById('intro-particles');
                if (introParticlesLayer) {
                    for(let i=0; i<40; i++) {
                        let p = document.createElement('div');
                        p.className = 'intro-particle';
                        p.style.left = Math.random() * 100 + '%';
                        p.style.top = Math.random() * 100 + '%';
                        let size = Math.random() * 4 + 1;
                        p.style.width = size + 'px';
                        p.style.height = size + 'px';
                        p.style.opacity = Math.random() * 0.4 + 0.1;
                        introParticlesLayer.appendChild(p);
                    }
                }

                // Start petals with depth
                startPetals();

                const text1 = document.getElementById('cinematic-text-1');
                const text2 = document.getElementById('cinematic-text-2');
                const text3 = document.getElementById('cinematic-text-3');

                // Step 1: 0s - 2s (Fade in 'You are invited...')
                text1.classList.remove('hidden');
                requestAnimationFrame(() => requestAnimationFrame(() => text1.classList.add('active')));
                
                // Step 2: 2s - 4s
                setTimeout(() => {
                    text1.classList.remove('active');
                    text1.classList.add('fade-out');
                    
                    text2.classList.remove('hidden');
                    requestAnimationFrame(() => requestAnimationFrame(() => text2.classList.add('active')));
                    
                    // Step 3: 4s - 8s (Hold name reveal)
                    setTimeout(() => {
                        text2.classList.remove('active');
                        text2.classList.add('fade-out');
                        
                        text3.classList.remove('hidden');
                        requestAnimationFrame(() => requestAnimationFrame(() => text3.classList.add('active')));
                        
                        // Step 4: 8s - 10.5s (Dissolve intro screen slowly)
                        setTimeout(() => {
                            splashScreen.classList.add('fade-out-blur');
                            
                            // Step 5: 10.5s (Reveal main site completely)
                            setTimeout(() => {
                                document.body.style.overflow = ''; 
                                splashScreen.style.display = 'none';
                                window.dispatchEvent(new Event('scroll'));
                            }, 2500);
                            
                        }, 4000); // Wait 4s on the name reveal
                        
                    }, 2000); // 4s (2s after Step 2 start)
                    
                }, 2000); // 2s mark
                
            }, 1000); // 1s initial pause offset
        });
    }

    if (musicToggleBtn && bgMusic) {
        musicToggleBtn.addEventListener('click', () => {
            if (isMusicPlaying) {
                bgMusic.pause();
                isMusicPlaying = false;
                if (musicIcon) {
                    musicIcon.classList.remove('fa-music');
                    musicIcon.classList.add('fa-volume-xmark');
                }
            } else {
                bgMusic.play();
                isMusicPlaying = true;
                if (musicIcon) {
                    musicIcon.classList.remove('fa-volume-xmark');
                    musicIcon.classList.add('fa-music');
                }
            }
        });
    }

    // --- 4. FLOATING PETALS ---
    function startPetals() {
        const petalContainer = document.getElementById('petal-container');
        if (!petalContainer) return;

        function createPetal() {
            const petal = document.createElement('div');
            petal.classList.add('petal');

            // Randomize size, position, depth, and duration
            const isFront = Math.random() > 0.7; // 30% chance to be foreground
            const size = isFront ? (Math.random() * 12 + 16) : (Math.random() * 8 + 8); 
            petal.style.width = `${size}px`;
            petal.style.height = `${size}px`;

            if (isFront) {
                petal.classList.add('front');
            } else {
                petal.classList.add('mid');
            }

            // Randomly position across the entire viewport width
            petal.style.left = `${Math.random() * 100}vw`;
            const duration = isFront ? (Math.random() * 4 + 6) : (Math.random() * 6 + 8);
            petal.style.animationDuration = `${duration}s`;

            petalContainer.appendChild(petal);

            // Remove petal after it falls
            setTimeout(() => {
                petal.remove();
            }, duration * 1000);
        }

        // Create a new petal every 350ms
        setInterval(createPetal, 350);
    }

    // --- 5. RSVP FORM SUBMISSION (Hidden IFrame Method) ---
    const rsvpForm = document.getElementById('rsvp-form');
    let rsvpSubmitted = false;

    if (rsvpForm) {
        const attendanceSelect = rsvpForm.querySelector('select[name="attendance"]');
        const guestCountInput = rsvpForm.querySelector('input[name="guestCount"]');

        // Toggle guest count requirement based on attendance selection
        if (attendanceSelect && guestCountInput) {
            attendanceSelect.addEventListener('change', (e) => {
                if (e.target.value === "No - Not Attending") {
                    guestCountInput.required = false;
                    guestCountInput.value = ""; // Clear any entered number
                    guestCountInput.disabled = true; // Optional: visually disable it
                } else {
                    guestCountInput.required = true;
                    guestCountInput.disabled = false;
                }
            });
        }

        rsvpForm.addEventListener('submit', () => {
            rsvpSubmitted = true;

            const btn = rsvpForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Sending RSVP...";
            btn.disabled = true;

            // Wait 2 seconds assuming the POST to Google Apps Script succeeded
            setTimeout(() => {
                btn.innerText = "RSVP Sent! Thank You.";
                btn.style.backgroundColor = "var(--color-gold)";

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    rsvpForm.reset();
                    rsvpSubmitted = false;
                }, 4000);
            }, 2000);
        });
    }

});
