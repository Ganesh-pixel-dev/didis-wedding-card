// 1. Initialize Lenis Smooth Scroll
gsap.registerPlugin(ScrollTrigger);

// FIX: Explicitly bind Lenis to window/documentElement so it does NOT
// attach pointer-event-consuming listeners to #smooth-wrapper div,
// which was silently swallowing all click events on child buttons.
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  wrapper: window,
  content: document.documentElement
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Initially prevent scrolling until curtain is raised
lenis.stop();

// 2. Left/Right Curtain Reveal Logic
const openBtn = document.getElementById('openBtn');
const curtainLeft = document.querySelector('.curtain-left');
const curtainRight = document.querySelector('.curtain-right');
const curtainLock = document.getElementById('curtain-lock');

openBtn.addEventListener('click', () => {
    const bgm = document.getElementById('wedding-bgm');
    const musicCtrl = document.getElementById('music-control');

    if (bgm) {
        bgm.volume = 0.4;
        bgm.play().then(() => {
            if(musicCtrl) {
                musicCtrl.classList.remove('hidden');
                musicCtrl.classList.add('playing');
            }
        }).catch(e => console.log('Audio autoplay blocked', e));
    }

    gsap.to(curtainLock, { opacity: 0, y: -50, duration: 0.8, ease: "power2.inOut" });
    gsap.to('.curtain-seam', { opacity: 0, duration: 1.5, ease: "power2.inOut" });

    gsap.to(curtainLeft, {
        duration: 2.5,
        xPercent: -105, // Slight extra push to hide shadows
        skewX: -5,      // Subtle fabric tilt
        ease: "power3.inOut"
    });

    gsap.to(curtainRight, {
        duration: 2.5,
        xPercent: 105,
        skewX: 5,
        ease: "power3.inOut"
    });

    setTimeout(() => {
        document.body.classList.remove('locked');
        const curtainContainer = document.getElementById('curtain-container');
        curtainContainer.style.pointerEvents = 'none';
        curtainContainer.style.visibility = 'hidden';

        lenis.start();
        initDiorama();
        
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);
    }, 2600);
});

// 3. Music Control Toggle
const musicCtrl = document.getElementById('music-control');
if (musicCtrl) {
    musicCtrl.addEventListener('click', () => {
        const bgm = document.getElementById('wedding-bgm');
        if (bgm.paused) {
            bgm.play();
            musicCtrl.classList.add('playing');
        } else {
            bgm.pause();
            musicCtrl.classList.remove('playing');
        }
    });
}

// 4. The Diorama Parallax Engine
function initDiorama() {
    const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
    const parallaxLayers = document.querySelectorAll('.js-parallax-layer');

    if (!isMobile) {
        // Desktop only: full parallax
        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) * 200;
            gsap.set(layer, { xPercent: -50, yPercent: -50 });
            gsap.to(layer, {
                yPercent: -50 - speed,
                ease: "none",
                force3D: true,
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true
                }
            });
        });
    } else {
        // Mobile: skip parallax entirely, just center layers statically
        parallaxLayers.forEach(layer => {
            gsap.set(layer, { xPercent: -50, yPercent: -50 });
        });
    }

    const sections = document.querySelectorAll('.st-section');
    sections.forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    });

    startCountdown();
}

// 5. Countdown Timer
function startCountdown() {
    const targetDate = new Date('April 29, 2026 00:00:00').getTime();

    const update = setInterval(() => {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff < 0) {
            clearInterval(update);
            document.getElementById('days').innerText = '00';
            document.getElementById('hours').innerText = '00';
            document.getElementById('minutes').innerText = '00';
            document.getElementById('seconds').innerText = '00';
            const countdown = document.getElementById('countdown');
            if (countdown) {
                const msg = document.createElement('p');
                msg.style.cssText = "font-family:'Cinzel',serif; font-size:1.1rem; color:var(--gold-glow); margin-top:20px; letter-spacing:3px;";
                msg.innerText = "✦ The Celebration Begins! ✦";
                countdown.insertAdjacentElement('afterend', msg);
            }
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').innerText    = d < 10 ? '0' + d : d;
        document.getElementById('hours').innerText   = h < 10 ? '0' + h : h;
        document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;
        document.getElementById('seconds').innerText = s < 10 ? '0' + s : s;
    }, 1000);
}

// 6. Epic Blessing Shower
const blessBtn = document.getElementById('blessBtn');
if (blessBtn) {
    blessBtn.addEventListener('click', () => {
        createBlessingShower();
        
        // Haptic-like feedback: button scale pulse
        gsap.to(blessBtn, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
    });
}

function createBlessingShower() {
    const types = ['petal-rose', 'petal-marigold', 'petal-gold'];
    const count = 60;

    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        const type = types[Math.floor(Math.random() * types.length)];
        petal.classList.add('custom-petal', type);
        
        // Random starting position above the screen
        const startX = Math.random() * window.innerWidth;
        const startY = -50 - (Math.random() * 200);
        
        petal.style.left = startX + 'px';
        petal.style.top = startY + 'px';
        
        // Random size/scale
        const scale = 0.5 + Math.random() * 1.2;
        petal.style.transform = `scale(${scale})`;
        
        document.body.appendChild(petal);

        // GSAP Animation: Falling with drift and rotation
        gsap.to(petal, {
            y: window.innerHeight + 200,
            x: startX + (Math.random() - 0.5) * 400, // horizontal drift
            rotation: Math.random() * 720,
            duration: 4 + Math.random() * 4,
            ease: "none",
            onComplete: () => petal.remove()
        });

        // Extra "flutter" effect for rotationX and rotationY
        gsap.to(petal, {
            rotationX: Math.random() * 360,
            rotationY: Math.random() * 360,
            duration: 1 + Math.random() * 2,
            repeat: -1,
            ease: "sine.inOut"
        });
    }
}