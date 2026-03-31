document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Effect
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Removed old bento map interactivity

    // 3. Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');
    
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 4. GSAP Animations & Scrollytelling
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    // Hero Text Parallax
    gsap.to('.hero-title', {
        y: 100,
        opacity: 0,
        scrollTrigger: {
            trigger: '.hero-section',
            start: "top top",
            end: "bottom top",
            scrub: 1
        }
    });

    gsap.to('.hero-bg', {
        y: 200,
        scrollTrigger: {
            trigger: '.hero-section',
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // Canvas Scrollytelling - Water Splash Effect
    const canvas = document.getElementById('water-splash-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        const initCanvas = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = document.querySelector('.transition-container').offsetHeight;
            createParticles();
        };

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 3 + 1;
                this.baseSpeed = Math.random() * 0.5 + 0.1;
                this.speed = this.baseSpeed;
                // Colors representing water (cyan to deep blue)
                this.color = `rgba(15, 140, ${Math.floor(Math.random() * 100) + 155}, ${Math.random() * 0.5 + 0.2})`;
            }
            update(scrollDelta) {
                // Base upward float, scroll pushes them down
                this.y -= this.speed;
                this.y += scrollDelta * (this.size * 0.5); // Parallax factor

                // Wrap around
                if (this.y < -10) this.y = height + 10;
                if (this.y > height + 10) this.y = -10;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const createParticles = () => {
            particles = [];
            let count = width > 768 ? 150 : 50;
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        };

        window.addEventListener('resize', initCanvas);
        initCanvas();

        let currentScroll = window.scrollY;
        let scrollDelta = 0;

        // Render Loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Calculate scroll speed for interaction
            let newScroll = window.scrollY;
            scrollDelta = (newScroll - currentScroll) * 0.1;
            scrollDelta = Math.max(-5, Math.min(scrollDelta, 5)); // Cap the impact
            
            // Decay delta
            if (scrollDelta > 0) scrollDelta -= 0.1;
            else if (scrollDelta < 0) scrollDelta += 0.1;

            currentScroll = newScroll;

            // Optional: When transition area is reached, apply a continuous downward force
            const transitionTop = document.querySelector('.transition-container').offsetTop;
            if (currentScroll > transitionTop - window.innerHeight) {
                const progress = (currentScroll - (transitionTop - window.innerHeight)) / window.innerHeight;
                if (progress > 0 && progress < 1.5) {
                    scrollDelta += progress * 1.5; // Acceleration downwards
                }
            }

            particles.forEach(p => {
                p.update(scrollDelta);
                p.draw();
            });

            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Scrollytelling Map Section
    const mapSection = document.querySelector('.scroll-map-section');
    if (mapSection) {
        const trailSvg = document.querySelector('.trail-path');
        const trailLength = trailSvg.getTotalLength();
        
        // Setup initial dash offset to hide the trail and make it a solid line for drawing
        gsap.set(trailSvg, {
            strokeDasharray: trailLength,
            strokeDashoffset: trailLength,
            opacity: 1
        });

        // Initialize points offscreen slightly
        gsap.set('.milestone', { opacity: 0, scale: 0.8, y: 50 });
        
        // Initialize car marker
        gsap.set('#family-car', { opacity: 0, scale: 0.8, transformOrigin: "50% 50%" });

        let mapTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: mapSection,
                start: "top top",
                end: "+=3000", // 3000px of scrolling for a relaxed scroll speed
                pin: true,
                scrub: 1
            }
        });

        // 1. Fade out the title overlay
        mapTimeline.to('.map-overlay-title', { opacity: 0, y: -50, duration: 1 });

        // 2. Fade in Family Car
        mapTimeline.to('#family-car', { opacity: 1, scale: 1, duration: 0.5 }, 0.5);

        // 3. Gradually draw the path AND move the car
        mapTimeline.to(trailSvg, { strokeDashoffset: 0, duration: 10 }, 1);
        mapTimeline.to('#family-car', {
            motionPath: {
                path: '#adventure-trail',
                align: '#adventure-trail',
                alignOrigin: [0.5, 0.5],
                autoRotate: true
            },
            duration: 10,
            ease: "none"
        }, 1);

        // 4. Reveal milestones concurrently with the car moving
        mapTimeline.to('.m-rafting', { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: "back.out(1.7)" }, 3);
        mapTimeline.to('.m-trekking', { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: "back.out(1.7)" }, 6.5);
        mapTimeline.to('.m-camping', { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: "back.out(1.7)" }, 10);
    }

    // --- MOMENTS IN THE WILD AUTO-SLIDER ---
    const galleryTrack = document.querySelector('#gallery-track');
    if (galleryTrack) {
        // Create the constant infinite loop
        const sliderTween = gsap.to(galleryTrack, {
            xPercent: -50, // Move by exactly one set of items
            duration: 15,  // Increased speed (lower is faster)
            ease: "none",
            repeat: -1
        });

        // Smooth Pause on hover using timeScale
        galleryTrack.addEventListener('mouseenter', () => {
            gsap.to(sliderTween, { timeScale: 0, duration: 1, ease: "power2.out" });
        });

        // Smooth Resume on leave
        galleryTrack.addEventListener('mouseleave', () => {
            gsap.to(sliderTween, { timeScale: 1, duration: 1, ease: "power2.in" });
        });
    }

    // Night Safari Eye Animations
    const nightSection = document.querySelector('#night-safari');
    if (nightSection) {
        const eyes = document.querySelectorAll('.eye-glow');
        
        // Random blinking
        eyes.forEach(eye => {
            gsap.timeline({ repeat: -1, repeatDelay: Math.random() * 5 + 2 })
                .to(eye, { opacity: 1, duration: 0.1 })
                .to(eye, { opacity: 0, duration: 0.1, delay: 0.2 })
                .to(eye, { opacity: 1, duration: 0.1, delay: 0.1 })
                .to(eye, { opacity: 0, duration: 0.1, delay: 3 });
        });

        // Parallax eyes on scroll
        gsap.to('.eye-1', {
            y: -100, x: 50,
            scrollTrigger: { trigger: nightSection, start: "top bottom", end: "bottom top", scrub: 2 }
        });
        gsap.to('.eye-2', {
            y: 150, x: -100,
            scrollTrigger: { trigger: nightSection, start: "top bottom", end: "bottom top", scrub: 2 }
        });
        gsap.to('.eye-3', {
            y: -50, x: -80,
            scrollTrigger: { trigger: nightSection, start: "top bottom", end: "bottom top", scrub: 2 }
        });

        // Text reveal
        gsap.from('.night-text', {
            opacity: 0,
            y: 100,
            duration: 1.5,
            scrollTrigger: {
                trigger: nightSection,
                start: "top 60%",
                toggleActions: "play none none reverse"
            }
        });
    }

    // Hero Title Entrance Animation
    const heroTl = gsap.timeline({ defaults: { ease: "power4.out", duration: 2 } });
    
    heroTl.from('.title-main', {
        y: 100,
        opacity: 0,
        scale: 1.1,
        filter: "blur(20px)",
        delay: 0.5
    })
    .from('.title-accent', {
        opacity: 0,
        letterSpacing: "0px",
        duration: 2.5
    }, "-=1.5")
    .from('.hero-subtitle', {
        opacity: 0,
        y: 20
    }, "-=2");

    // Header reveal
    gsap.from('#main-header', {
        y: -100,
        opacity: 0,
        duration: 1.2,
        delay: 0.2
    });

    // Safety Badges Animation
    gsap.from('.badge-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
            trigger: '.safety-section',
            start: "top 75%",
        }
    });

    // --- UNIVERSAL ACTIVITY ENGINE ---
    const initActivityEffects = (config) => {
        const section = document.querySelector(config.sectionId);
        const canvas = document.querySelector(config.canvasId);
        if (!section || !canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height, animationFrame;
        let particles = [];
        let isActive = false;

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                
                if (config.type === 'water') {
                    this.y = -20;
                    this.size = Math.random() * 2 + 1;
                    this.speed = Math.random() * 0.5 + 0.2;
                    this.opacity = Math.random() * 0.3 + 0.2;
                    this.isDripping = Math.random() > 0.8;
                } else if (config.type === 'dust') {
                    this.size = Math.random() * 1.5 + 0.5;
                    this.speedX = (Math.random() - 0.5) * 0.5;
                    this.speedY = (Math.random() - 0.5) * 0.5;
                    this.opacity = Math.random() * 0.2 + 0.1;
                } else if (config.type === 'clouds') {
                    this.x = width + 100;
                    this.size = Math.random() * 100 + 50;
                    this.speedX = -(Math.random() * 2 + 1);
                    this.speedY = (Math.random() - 0.5) * 0.5;
                    this.opacity = Math.random() * 0.1 + 0.05;
                }
            }
            update() {
                if (config.type === 'water') {
                    if (this.isDripping) { this.y += this.speed * 5; this.size += 0.01; }
                    else { this.y += this.speed; }
                    if (this.y > height) this.reset();
                } else if (config.type === 'dust') {
                    this.x += this.speedX;
                    this.y += this.speedY;
                    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
                } else if (config.type === 'clouds') {
                    this.x += this.speedX;
                    this.y += this.speedY;
                    if (this.x < -200) this.reset();
                }
            }
            draw() {
                ctx.beginPath();
                if (config.type === 'clouds') {
                    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    ctx.fillStyle = gradient;
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                } else {
                    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                }
                ctx.fill();
            }
        }

        function resize() {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        }

        function animate() {
            if (!isActive) return;
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            animationFrame = requestAnimationFrame(animate);
        }

        resize();
        window.addEventListener('resize', resize);
        for (let i = 0; i < (config.count || 50); i++) particles.push(new Particle());

        ScrollTrigger.create({
            trigger: section,
            start: "top 80%",
            onEnter: () => { isActive = true; animate(); },
            onLeave: () => isActive = false,
            onEnterBack: () => { isActive = true; animate(); },
            onLeaveBack: () => isActive = false
        });
    };

    // Initialize all Activity Engines
    initActivityEffects({ sectionId: '#rafting', canvasId: '#wet-lens-canvas', type: 'water', count: 60 });
    initActivityEffects({ sectionId: '#kayaking', canvasId: '#kayak-wet-lens-canvas', type: 'water', count: 40 });
    initActivityEffects({ sectionId: '#safari', canvasId: '#dust-lens-canvas', type: 'dust', count: 100 });
    initActivityEffects({ sectionId: '#paragliding', canvasId: '#cloud-lens-canvas', type: 'clouds', count: 15 });

    // Universal Audio for all activities (recycling the rafting audio for now with volume logic)
    const raftingAudio = document.querySelector('#rafting-audio');
    if (raftingAudio) {
        document.querySelectorAll('.journey-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                raftingAudio.play();
                gsap.to(raftingAudio, { volume: 0.3, duration: 1.5 });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(raftingAudio, {
                    volume: 0,
                    duration: 1.5,
                    onComplete: () => { if (raftingAudio.volume === 0) raftingAudio.pause(); }
                });
            });
        });
    }

    // --- DAY IN THE LIFE TIMELINE ENGINE ---
    const timelineSection = document.querySelector('#life-of-adventurer');
    const timelineLine = document.querySelector('.timeline-line-progress');
    const timelineItems = document.querySelectorAll('.timeline-item');

    if (timelineSection && timelineLine) {
        // 1. Line Progress Animation
        gsap.to(timelineLine, {
            height: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: ".timeline-wrapper",
                start: "top center",
                end: "bottom center",
                scrub: true
            }
        });

        // 2. Individual Item Entrance & Background Shift
        timelineItems.forEach((item, index) => {
            // Initial State for entrance effect
            gsap.set(item, { 
                opacity: 0, 
                x: item.classList.contains('left') ? -70 : 70,
                y: 50 
            });

            // Entrance Animation
            gsap.to(item, {
                opacity: 1,
                x: 0,
                y: 0,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });

            // Background Color Shifting (Ambient Atmosphere)
            ScrollTrigger.create({
                trigger: item,
                start: "top center",
                end: "bottom center",
                onEnter: () => {
                    timelineSection.classList.remove('bg-dawn', 'bg-midday', 'bg-midnight');
                    if (index === 0) timelineSection.classList.add('bg-dawn');
                    if (index === 1) timelineSection.classList.add('bg-midday');
                    if (index === 3) timelineSection.classList.add('bg-midnight');
                },
                onEnterBack: () => {
                    timelineSection.classList.remove('bg-dawn', 'bg-midday', 'bg-midnight');
                    if (index === 0) timelineSection.classList.add('bg-dawn');
                    if (index === 1) timelineSection.classList.add('bg-midday');
                    if (index === 3) timelineSection.classList.add('bg-midnight');
                }
            });
        });
    }

    // --- WALL OF JOY TESTIMONIAL MARQUEE ---
    const testimonialTrack = document.querySelector('#testimonial-track');
    if (testimonialTrack) {
        // Create the constant infinite loop for trust
        const marqueeTween = gsap.to(testimonialTrack, {
            xPercent: -50, // Move by half
            duration: 35,  // Relaxed "Trust-Building" speed
            ease: "none",
            repeat: -1
        });

        // Smooth Pause on hover for reading
        testimonialTrack.addEventListener('mouseenter', () => {
            gsap.to(marqueeTween, { timeScale: 0, duration: 1.2, ease: "power2.out" });
        });

        // Smooth Resume on leave
        testimonialTrack.addEventListener('mouseleave', () => {
            gsap.to(marqueeTween, { timeScale: 1, duration: 1.2, ease: "power2.in" });
        });
    }
});
