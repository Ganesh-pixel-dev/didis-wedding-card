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
    if (bgm) {
        bgm.volume = 0.4;
        bgm.play().catch(e => console.log('Audio autoplay blocked by browser', e));
    }

    gsap.to(curtainLock, { opacity: 0, y: -50, duration: 0.8, ease: "power2.inOut" });
    gsap.to('.curtain-seam', { opacity: 0, duration: 1.5, ease: "power2.inOut" });

    gsap.to(curtainLeft, {
        duration: 2.2,
        xPercent: -100,
        scaleX: 0.2,
        skewX: -15,
        borderBottomRightRadius: "60%",
        ease: "power3.inOut"
    });

    gsap.to(curtainRight, {
        duration: 2.2,
        xPercent: 100,
        scaleX: 0.2,
        skewX: 15,
        borderBottomLeftRadius: "60%",
        ease: "power3.inOut"
    });

    setTimeout(() => {
        document.body.classList.remove('locked');
        const curtainContainer = document.getElementById('curtain-container');
        curtainContainer.style.pointerEvents = 'none';
        curtainContainer.style.visibility = 'hidden';

        lenis.start();
        initDiorama();
        
        // Final refresh to ensure everything is aligned after reveal
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);
    }, 2400);
});

// 4. The Diorama Parallax Engine
function initDiorama() {
    const parallaxLayers = document.querySelectorAll('.js-parallax-layer');
    parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed')) * 200;
        
        // IRONCLAD CENTERING: Force layers to start at -50% offset to match top/left: 50%
        gsap.set(layer, { xPercent: -50, yPercent: -50 });

        gsap.to(layer, {
            yPercent: -50 - speed, // Parallax relative to absolute center
            ease: "none",
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.8
            }
        });
    });

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