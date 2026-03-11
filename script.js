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

    let isMusicPlaying = false;
    let ytPlayer = null;
    let isPlayerReady = false;

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
        document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = function () {
        ytPlayer = new YT.Player('youtube-audio', {
            height: '0',
            width: '0',
            videoId: 'vPY_oohGR34',
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'loop': 1,
                'playlist': 'vPY_oohGR34', // Required for loop
                'origin': window.location.origin
            },
            events: {
                'onReady': onPlayerReady
            }
        });
    };

    function onPlayerReady(event) {
        isPlayerReady = true;
    }

    if (btnOpenInvite && splashScreen) {
        // Prevent scrolling while splash screen is active
        document.body.style.overflow = 'hidden';

        btnOpenInvite.addEventListener('click', () => {
            splashScreen.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling

            // Try to play music automatically when they open invitation
            if (isPlayerReady && ytPlayer && typeof ytPlayer.playVideo === 'function') {
                ytPlayer.setVolume(50); // Set volume to 50%
                ytPlayer.playVideo();
                isMusicPlaying = true;
                if (musicIcon) {
                    musicIcon.classList.remove('fa-volume-xmark');
                    musicIcon.classList.add('fa-music');
                }
            } else {
                console.log("YouTube player not ready yet when button clicked. Guest may need to click toggle manually.");
            }

            // Start petal animation after splash screen finishes fading (1s transition)
            setTimeout(startPetals, 500);
        });
    }

    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', () => {
            if (!isPlayerReady || !ytPlayer || typeof ytPlayer.playVideo !== 'function') return;

            if (isMusicPlaying) {
                ytPlayer.pauseVideo();
                isMusicPlaying = false;
                if (musicIcon) {
                    musicIcon.classList.remove('fa-music');
                    musicIcon.classList.add('fa-volume-xmark');
                }
            } else {
                ytPlayer.playVideo();
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

            // Randomize size, position, and duration
            const size = Math.random() * 8 + 8; // 8px to 16px
            petal.style.width = `${size}px`;
            petal.style.height = `${size}px`;

            // Randomly position across the entire viewport width
            petal.style.left = `${Math.random() * 100}vw`;
            const duration = Math.random() * 5 + 7; // 7s to 12s
            petal.style.animationDuration = `${duration}s`;

            petalContainer.appendChild(petal);

            // Remove petal after it falls
            setTimeout(() => {
                petal.remove();
            }, duration * 1000);
        }

        // Create a new petal every 400ms
        setInterval(createPetal, 400);
    }

    // --- 5. RSVP FORM SUBMISSION ---
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = rsvpForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Sending RSVP...";
            btn.disabled = true;

            // The deployed Google Apps Script Web App URL
            const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxcAuMBQFbY_u8mHMY8DrVq8DtIZ-a3VRqfbJ9uG_nK1IVgBYhP5jtIuvk1wFtzZB8kZA/exec";

            // If user hasn't replaced the URL yet, just simulate success to avoid breaking
            if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE") {
                console.warn("⚠️ Please update the GOOGLE_SCRIPT_URL in script.js with your Google Apps Script URL!");
                btn.innerText = "RSVP Sent! (Simulated)";
                btn.style.backgroundColor = "var(--color-gold)";

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    rsvpForm.reset();
                }, 4000);
                return;
            }

            // Create FormData from the form
            // Apps Script correctly parses standard multipart form data via e.parameter
            const formData = new FormData(rsvpForm);

            // Send Ajax request to Google Script API
            // 'no-cors' mode tells the browser to fire and forget without waiting for access control headers
            fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                body: formData
            })
                .then(async (response) => {
                    btn.innerText = "RSVP Sent! Thank You.";
                    btn.style.backgroundColor = "var(--color-gold)";

                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                        rsvpForm.reset();
                    }, 4000);
                })
                .catch(error => {
                    console.error('Network Error!', error);
                    btn.innerText = "Error. Please try again.";
                    btn.style.backgroundColor = "#e09b9b";

                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                        btn.style.backgroundColor = "var(--color-gold)";
                    }, 4000);
                });
        });
    }

});
