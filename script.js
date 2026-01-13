/* script.js */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth Scroll (Lenis)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. SPA Navigation & Smooth Anchors
    const viewHome = document.getElementById('view-home');
    const viewAbout = document.getElementById('view-about');

    const switchView = (viewName) => {
        // Simple toggle
        if (viewName === 'about') {
            viewHome.classList.add('hidden');
            viewHome.classList.remove('active');
            viewAbout.classList.remove('hidden');
            viewAbout.classList.add('active');
            lenis.scrollTo(0, { immediate: true });
        } else {
            viewAbout.classList.add('hidden');
            viewAbout.classList.remove('active');
            viewHome.classList.remove('hidden');
            viewHome.classList.add('active');
            // If switching to home, we might want to stay at top or not. 
            // Usually scroll to top feels best for a "page change"
            lenis.scrollTo(0, { immediate: true });
        }
    };

    // Click Handler for Links
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (e) {
            const dataLink = this.getAttribute('data-link'); // 'home', 'about', 'section'
            const href = this.getAttribute('href');

            if (dataLink === 'about') {
                e.preventDefault();
                switchView('about');
            } else if (dataLink === 'home') {
                e.preventDefault();
                switchView('home');
            } else if (dataLink === 'section') {
                // If on About page, go Home first, then scroll
                if (viewAbout.classList.contains('active')) {
                    e.preventDefault();
                    switchView('home');
                    // Wait for view swap then scroll
                    setTimeout(() => {
                        const target = document.querySelector(href);
                        if (target) lenis.scrollTo(target);
                    }, 100);
                } else {
                    // Already on home, just smooth scroll
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) lenis.scrollTo(target);
                }
            } else if (href === '#top') {
                e.preventDefault();
                lenis.scrollTo(0);
            }
        });
    });

    // 3. Splash Screen & Quotes
    const splash = document.getElementById('splash');
    const enterBtn = document.getElementById('enter-site-btn');
    const splashLogo = document.querySelector('.splash-logo');
    let startMusic = () => { };
    // Quotes Logic (Inline to avoid CORS issues on local file://)
    const quoteEl = document.getElementById('splash-quote');
    const quotes = [
        "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
        "The future rewards those who press on. I don’t have time to feel sorry for myself.",
        "It always seems impossible until it’s done.",
        "Do the best you can until you know better. Then when you know better, do better.",
        "In the middle of difficulty lies opportunity.",
        "Keep your face to the sunshine and you cannot see a shadow.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "You have power over your mind — not outside events. Realize this, and you will find strength.",
        "One child, one teacher, one book, one pen can change the world.",
        "Your time is limited, so don’t waste it living someone else’s life.",
        "All we have to decide is what to do with the time that is given to us.",
        "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
        "It does not matter how slowly you go as long as you do not stop.",
        "The most difficult thing is the decision to act, the rest is merely tenacity.",
        "Faith is taking the first step even when you don’t see the whole staircase.",
        "How wonderful it is that nobody need wait a single moment before starting to improve the world.",
        "Believe you can and you’re halfway there.",
        "Turn your wounds into wisdom.",
        "You are never too old to set another goal or to dream a new dream.",
        "Learning never exhausts the mind."
    ];

    if (quoteEl && quotes.length > 0) {
        let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        // Add quotes if missing from the string itself
        if (!randomQuote.startsWith('"')) randomQuote = `"${randomQuote}"`;

        quoteEl.textContent = randomQuote;

        // Fade in
        setTimeout(() => {
            quoteEl.style.opacity = '1';
        }, 500);
    }

    // Reveal enter button after loading
    setTimeout(() => {
        if (splash) {
            splash.classList.add('ready');
        }
    }, 2600); // short wait for the loading cue

    // 4. Video Start Time
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        const setTime = () => {
            // Only set if close to 0 to avoid resetting loop
            if (heroVideo.currentTime < 1) heroVideo.currentTime = 75;
        };

        heroVideo.addEventListener('loadedmetadata', () => {
            heroVideo.currentTime = 75;
        });
        if (heroVideo.readyState >= 1) {
            heroVideo.currentTime = 75;
        }
    }

    // 5. Scroll Reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 6. Music Player (Unchanged logic, just ensure persistent)
    const audio = document.getElementById('bg-music');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const togglePlayerBtn = document.getElementById('toggle-player-btn');
    const playerExpanded = document.querySelector('.player-expanded');
    const playerUI = document.getElementById('player-ui');
    const trackNameEl = document.getElementById('track-name');
    const artistNameEl = document.getElementById('artist-name');
    const disk = document.querySelector('.disk');

    const playlist = [
        { name: "VYBE", artist: "A Masterpiece", file: "songs/music.mp3" },
    ];
    let currentTrackIndex = 0;

    // Volume logic
    const volContainer = document.getElementById('vol-slider-container');
    const volFill = document.getElementById('vol-fill');
    const volThumb = document.getElementById('vol-thumb');

    if (audio) {
        audio.volume = 0.4;
        if (volFill) {
            volFill.style.width = '40%';
            volThumb.style.left = '40%';
        }
    }

    // Volume dragging
    let isDraggingVol = false;
    const setVolumeFromEvent = (e) => {
        if (!volContainer) return;
        const rect = volContainer.getBoundingClientRect();
        let pct = (e.clientX - rect.left) / rect.width;
        if (pct < 0) pct = 0; if (pct > 1) pct = 1;
        audio.volume = pct;
        volFill.style.width = `${pct * 100}%`;
        volThumb.style.left = `${pct * 100}%`;
    };
    if (volContainer) {
        volContainer.addEventListener('mousedown', (e) => { isDraggingVol = true; setVolumeFromEvent(e); });
        document.addEventListener('mousemove', (e) => { if (isDraggingVol) setVolumeFromEvent(e); });
        document.addEventListener('mouseup', () => { isDraggingVol = false; });
    }


    const loadTrack = (index) => {
        if (!audio) return;
        if (index < 0) index = playlist.length - 1;
        if (index >= playlist.length) index = 0;
        currentTrackIndex = index;
        const track = playlist[index];
        audio.src = track.file;
        if (trackNameEl) trackNameEl.textContent = track.name;
        if (artistNameEl) artistNameEl.textContent = track.artist;
        if (playBtn && playBtn.classList.contains('hidden')) audio.play().catch(e => { });
    };
    if (audio) {
        loadTrack(0);
        startMusic = () => {
            audio.play().then(() => {
                // Started successfully
                playBtn.classList.add('hidden');
                pauseBtn.classList.remove('hidden');
                disk.classList.add('playing');
                disk.style.animationPlayState = 'running';
            }).catch(() => {
                // Autoplay blocked - wait for interaction
                const unlockAudio = () => {
                    audio.play().then(() => {
                        playBtn.classList.add('hidden');
                        pauseBtn.classList.remove('hidden');
                        disk.classList.add('playing');
                        disk.style.animationPlayState = 'running';
                    });
                    document.removeEventListener('click', unlockAudio);
                    document.removeEventListener('keydown', unlockAudio);
                };
                document.addEventListener('click', unlockAudio);
                document.addEventListener('keydown', unlockAudio);
            });
        };
        if (!splash) startMusic();
    }

    if (splash && enterBtn) {
        enterBtn.addEventListener('click', () => {
            if (enterBtn.disabled) return;
            enterBtn.disabled = true;
            splash.classList.add('warp-jump');
            if (splashLogo) splashLogo.classList.add('enter-anim');
            startMusic();
            setTimeout(() => {
                document.body.classList.remove('site-hidden');
                document.body.classList.add('site-ready');
                splash.classList.add('exit');
            }, 650);
            setTimeout(() => {
                splash.style.display = 'none';
            }, 1300);
        });
    } else {
        document.body.classList.remove('site-hidden');
        document.body.classList.add('site-ready');
    }

    const togglePlay = () => {
        if (!audio) return;
        if (audio.paused) {
            audio.play().then(() => {
                playBtn.classList.add('hidden'); pauseBtn.classList.remove('hidden');
                disk.classList.add('playing'); disk.style.animationPlayState = 'running';
            }).catch(console.error);
        } else {
            audio.pause();
            playBtn.classList.remove('hidden'); pauseBtn.classList.add('hidden');
            disk.classList.remove('playing'); disk.style.animationPlayState = 'paused';
        }
    };
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (pauseBtn) pauseBtn.addEventListener('click', togglePlay);
    if (nextBtn) nextBtn.addEventListener('click', () => { loadTrack(currentTrackIndex + 1); if (audio.paused) togglePlay(); else audio.play(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { loadTrack(currentTrackIndex - 1); if (audio.paused) togglePlay(); else audio.play(); });

    // Expand/Collapse
    let isExpanded = false;
    if (togglePlayerBtn) {
        togglePlayerBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                playerExpanded.classList.remove('hidden');
                togglePlayerBtn.style.transform = 'rotate(180deg)';
                playerUI.style.width = "280px";
            } else {
                playerExpanded.classList.add('hidden');
                togglePlayerBtn.style.transform = 'rotate(0deg)';
                playerUI.style.width = "250px";
            }
        });
    }

    // Draggable Logic
    if (playerUI) {
        let isDraggingPlayer = false;
        let startX, startY, initialLeft, initialTop;
        playerUI.addEventListener('mousedown', (e) => {
            if (e.target.closest('button') || e.target.closest('.custom-slider')) return;
            isDraggingPlayer = true;
            startX = e.clientX; startY = e.clientY;
            const rect = playerUI.getBoundingClientRect();
            initialLeft = rect.left; initialTop = rect.top;
            playerUI.style.bottom = 'auto'; playerUI.style.left = `${initialLeft}px`; playerUI.style.top = `${initialTop}px`;
            playerUI.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', (e) => {
            if (isDraggingPlayer) {
                e.preventDefault();
                playerUI.style.left = `${initialLeft + (e.clientX - startX)}px`;
                playerUI.style.top = `${initialTop + (e.clientY - startY)}px`;
            }
        });
        document.addEventListener('mouseup', () => { isDraggingPlayer = false; playerUI.style.cursor = 'grab'; });
    }

    // Card Interactions
    const interactiveCards = Array.from(document.querySelectorAll('.card.interactive'));
    interactiveCards.forEach(card => {
        card.addEventListener('click', () => {
            interactiveCards.forEach(other => {
                if (other !== card) other.classList.remove('expanded');
            });
            card.classList.toggle('expanded');
        });
    });
    document.querySelectorAll('.team-member').forEach(el => {
        el.addEventListener('click', () => el.classList.toggle('active'));
    });

    // Reactive Background
    initReactiveBackground();

    // Nav Scroll
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.style.background = 'rgba(10, 10, 12, 0.55)'; nav.style.padding = '10px 0';
            } else {
                nav.style.background = 'rgba(10, 10, 12, 0.2)'; nav.style.padding = '20px 0';
            }
        });
    }
});

// Re-declare initParticles (abbreviated for brevity as it's same logic)
function initReactiveBackground() {
    // ... Existing particle logic ...
    const canvas = document.getElementById('bg-canvas') || document.createElement('canvas');
    if (!document.body.contains(canvas)) { canvas.id = 'bg-canvas'; document.body.prepend(canvas); }
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    const mouse = { x: -1000, y: -1000 };
    const resize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; initParticlesLocal(); };
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

    class Particle {
        constructor() { this.reset(); this.x = Math.random() * width; this.y = Math.random() * height; }
        reset() {
            this.x = Math.random() * width; this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.baseX = this.x; this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            this.alpha = Math.random() * 0.4 + 0.05;
            this.driftX = (Math.random() - 0.5) * 0.3;
            this.driftY = (Math.random() - 0.5) * 0.3;
            this.isPurple = Math.random() < 0.12;
        }
        update() {
            this.baseX += this.driftX;
            this.baseY += this.driftY;
            if (this.baseX < 0 || this.baseX > width) {
                this.driftX *= -1;
                this.baseX = Math.max(0, Math.min(width, this.baseX));
            }
            if (this.baseY < 0 || this.baseY > height) {
                this.driftY *= -1;
                this.baseY = Math.max(0, Math.min(height, this.baseY));
            }
            let dx = mouse.x - this.x; let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let maxDist = 250;
            if (distance < maxDist) {
                const force = (maxDist - distance) / maxDist;
                if (distance > 0) {
                    this.x -= (dx / distance) * force * this.density;
                    this.y -= (dy / distance) * force * this.density;
                }
            } else {
                if (this.x !== this.baseX) this.x += (this.baseX - this.x) / 40;
                if (this.y !== this.baseY) this.y += (this.baseY - this.y) / 40;
            }
        }
        draw() {
            const color = this.isPurple
                ? `rgba(143,107,255,${this.alpha})`
                : `rgba(255,255,255,${this.alpha})`;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticlesLocal() {
        particles = [];
        for (let i = 0; i < (width * height) / 10000; i++) particles.push(new Particle());
    }
    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    resize(); animate();
}

// Helper for team toggle (exposed)
function toggleBio(el) { /* Handled in event listener above now for better scope access or can leave here */ }
