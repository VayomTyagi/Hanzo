// Performance optimizations
let isVideoPlaying = false;
let rafId = null;
let cursorTimeout = null;
let backgroundMusic = null;
let musicWasPlayingBeforeVideo = false;

// Throttled cursor movement for better performance
let lastCursorUpdate = 0;
const cursorUpdateInterval = 16; // ~60fps

// Loading animation
window.addEventListener('load', () => {
    const loader = document.querySelector('.loading-overlay');
    setTimeout(() => {
        loader.classList.add('hidden');
        initAnimations();
        initBackgroundMusic();
    }, 1500);
});

function initAnimations() {
    initTypewriter();
    initParticles();
    initCursor();
}

document.addEventListener("click", () => {
    playBackgroundMusic();
}, { once: true });


// Background Music System
function initBackgroundMusic() {
    backgroundMusic = document.getElementById('backgroundMusic');
    const musicToggle = document.getElementById('musicToggle');
    const musicControl = document.querySelector('.music-control');
    
    if (!backgroundMusic || !musicToggle) return;

    // Set initial volume
    backgroundMusic.volume = 0.05;
    
    // Check if user has a music preference stored
    const musicPreference = localStorage.getItem('backgroundMusicEnabled');
    let shouldAutoPlay = musicPreference === null ? true : musicPreference === 'true';
    
    // Auto-play background music after a short delay
    if (shouldAutoPlay) {
        setTimeout(() => {
            playBackgroundMusic();
        }, 3000);
    }

    // Music toggle functionality
    musicToggle.addEventListener('click', toggleBackgroundMusic);
    
    // Music control hover effects for cursor
    musicToggle.addEventListener('mouseenter', () => {
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');
        if (cursor && cursorFollower) {
            cursor.classList.add('hover');
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.2)';
        }
    });
    
    musicToggle.addEventListener('mouseleave', () => {
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');
        if (cursor && cursorFollower) {
            cursor.classList.remove('hover');
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    });
    
    // Handle audio events
    backgroundMusic.addEventListener('play', () => {
        updateMusicButton(true);
        musicControl.classList.add('playing');
    });
    
    backgroundMusic.addEventListener('pause', () => {
        updateMusicButton(false);
        musicControl.classList.remove('playing');
    });
    
    backgroundMusic.addEventListener('error', (e) => {
        console.warn('Background music failed to load:', e);
        musicToggle.style.display = 'none';
    });
}

function toggleBackgroundMusic() {
    if (!backgroundMusic) return;
    
    if (backgroundMusic.paused) {
        playBackgroundMusic();
    } else {
        pauseBackgroundMusic();
    }
}

function playBackgroundMusic() {
    if (!backgroundMusic || isVideoPlaying) return;
    
    const playPromise = backgroundMusic.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            localStorage.setItem('backgroundMusicEnabled', 'true');
        }).catch((error) => {
            console.warn('Background music autoplay prevented:', error);
            // Show a subtle notification that user can click to play
            const musicToggle = document.getElementById('musicToggle');
            if (musicToggle) {
                musicToggle.style.animation = 'musicIndicator 2s ease-in-out 3';
            }
        });
    }
}

function pauseBackgroundMusic() {
    if (!backgroundMusic) return;
    
    backgroundMusic.pause();
    localStorage.setItem('backgroundMusicEnabled', 'false');
}

function updateMusicButton(isPlaying) {
    const musicToggle = document.getElementById('musicToggle');
    const icon = musicToggle.querySelector('i');
    
    if (isPlaying) {
        icon.className = 'fas fa-volume-up';
        musicToggle.classList.remove('muted');
        musicToggle.title = 'Mute Background Music';
    } else {
        icon.className = 'fas fa-volume-mute';
        musicToggle.classList.add('muted');
        musicToggle.title = 'Play Background Music';
    }
}


// Optimized Custom cursor with throttling
function initCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    if (!cursor || !cursorFollower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    // track mouse instantly
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // small dot (centered)
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

        // follower smoothly interpolates (centered)
        followerX += (mouseX - followerX) * 0.18;
        followerY += (mouseY - followerY) * 0.18;
        cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // click effect
    document.addEventListener('mousedown', () => {
        cursor.classList.add('click');
        clearTimeout(cursorTimeout);
        cursorTimeout = setTimeout(() => cursor.classList.remove('click'), 200);
    });

    // interactive hover effects
    const interactiveElements = document.querySelectorAll(
        'a, button, .project-card, .skill-card, input, textarea, .video-container'
    );

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorFollower.style.transition = 'transform 0.2s ease';
            cursorFollower.style.transform += ' scale(1.3)';
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorFollower.style.transition = 'transform 0.2s ease';
            cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%) scale(1)`;
        });
    });
}


// Optimized particle system
function initParticles() {
    const particleContainer = document.getElementById('particleContainer');
    if (!particleContainer) return;
    
    const particleCount = window.innerWidth < 768 ? 0 : 25; // Reduced count, none on mobile
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 12 + 's';
        particle.style.animationDuration = (12 + Math.random() * 6) + 's';
        
        const colors = ['var(--primary-orange)', 'var(--accent-cyan)', 'var(--accent-purple)'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        particleContainer.appendChild(particle);
    }
}

// Typewriter effect
function initTypewriter() {
    const typewriter = document.getElementById('typewriter');
    if (!typewriter) return;
    
    const text = 'Creative Video Editor';
    let index = 0;
    
    function type() {
        if (index < text.length) {
            typewriter.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100);
        }
    }
    
    setTimeout(type, 1500);
}

// Optimized smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Throttled navbar scroll effect
let lastScrollY = 0;
let scrollTimeout = null;

function handleScroll() {
    const nav = document.querySelector('.nav');
    const backToTop = document.querySelector('.back-to-top');
    const currentScrollY = window.pageYOffset;
    
    if (currentScrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    if (currentScrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
    
    lastScrollY = currentScrollY;
}

window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            handleScroll();
            scrollTimeout = null;
        }, 10);
    }
});

// Optimized fade in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Stop observing once visible
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Skill progress bar animation
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll('.skill-progress');
            progressBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.setProperty('--progress-width', width + '%');
                }, 300);
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const skillsSection = document.querySelector('#skills');
if (skillsSection) {
    skillObserver.observe(skillsSection);
}

// Modal functionality
const modal = document.getElementById('projectModal');
const modalBody = document.getElementById('modal-body');

const projectData = {
    project1: {
        title: 'Gaming Moments to CALM Your Mind',
        video: "https://www.youtube.com/embed/xMu-Zl-qNhY?autoplay=1&rel=0&vq=hd1080",
        description: 'This is part one of the funny moments in my gaming journey. A compilation of entertaining gameplay moments designed to provide relaxation and entertainment for viewers.',
        details: [
            'Duration: 5:26 minutes',
            'Format: HD 1080p 60FPS',
            'Software: After Effects',
            'Platform: YouTube',
            'Style: Casual gaming compilation with humor'
        ],
    },
    project2: {
        title: 'Heaven Sent - Valorant Edit HD',
        video: "https://www.youtube.com/embed/k3I__4r83SU?autoplay=1",
        description: 'These videos are made with most efforts using different types of effects and transitions to make it look flashier than a normal trim/cut videos. Anime clips or Gaming clips are used to make such edits.',
        details: [
            'Duration: 0:34 minutes',
            'Format: HD 1080p 60FPS',
            'Software: After Effects, Alight Motion',
            'Special: Advanced color grading, VFX compositing',
            'Views: 200+ across all platforms'
        ],
    },
    project3: {
        title: 'Urban Stories Documentary',
        video: "https://www.youtube.com/embed/VIDEO_ID_2?autoplay=1",
        description: 'An award-winning documentary that explores the lives, dreams, and struggles of people living in urban environments. Through careful editing and thoughtful sound design, the film creates an intimate portrait of modern city life.',
        details: [
            'Duration: 25 minutes',
            'Format: HD (1080p)',
            'Software: Premiere Pro, Audition',
            'Special: Narrative storytelling, Audio mixing',
            'Screening: 15+ film festivals worldwide'
        ],
    }
};

function openModal(projectId) {
    const project = projectData[projectId];
    if (project) {
        modalBody.innerHTML = `
            <div style="display: grid; gap: 2rem;">
                <div style="text-align: center;">
                    <h2 style="background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 2.5rem; margin-bottom: 1rem; font-family: 'Orbitron', monospace;">
                        ${project.title}
                    </h2>

                    <!-- Video Embed -->
                    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 15px; margin-bottom: 2rem;">
                        <iframe 
                            src="${project.video}" 
                            frameborder="0" 
                            allow="autoplay; encrypted-media" 
                            allowfullscreen
                            style="position: absolute; top:0; left:0; width:100%; height:100%; border-radius: 15px;">
                        </iframe>
                    </div>
                </div>
                
                <div>
                    <p style="font-size: 1.2rem; line-height: 1.8; color: var(--text-gray); margin-bottom: 2rem;">
                        ${project.description}
                    </p>
                </div>
                
                <div class="project-details-container">
                    <div>
                        <h3 style="color: var(--primary-orange); font-size: 1.5rem; margin-bottom: 1.5rem; font-family: 'Orbitron', monospace;">
                            <i class="fas fa-cog" style="margin-right: 0.5rem;"></i>
                            Project Details
                        </h3>
                        <ul style="list-style: none; padding: 0;">
                            ${project.details.map(detail => `
                                <li style="margin-bottom: 1rem; padding: 1rem; background: rgba(30, 30, 30, 0.5); border-radius: 10px; border-left: 4px solid var(--primary-orange);">
                                    <i class="fas fa-chevron-right" style="color: var(--primary-orange); margin-right: 0.5rem; font-size: 0.8rem;"></i>
                                    ${detail}
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div>
                        <div style="margin-top: 2rem; padding: 2rem; background: rgba(255, 106, 0, 0.1); border-radius: 15px; text-align: center; border: 1px solid rgba(255, 106, 0, 0.2);">
                            <h4 style="color: var(--primary-orange); margin-bottom: 1rem; font-size: 1.2rem;">
                                <i class="fas fa-lightbulb" style="margin-right: 0.5rem;"></i>
                                Interested in Similar Work?
                            </h4>
                            <p style="margin-bottom: 1.5rem; color: var(--text-gray);">
                                Let's discuss how I can bring your vision to life with the same level of creativity and professionalism.
                            </p>
                            <a href="#contact" onclick="closeModal()" 
                            style="display: inline-block; background: var(--gradient-primary); color: white; padding: 0.8rem 2rem; border-radius: 25px; cursor: None; text-decoration: none; font-weight: 600; transition: var(--transition);">
                                <i class="fas fa-envelope" style="margin-right: 0.5rem;"></i>
                                Get In Touch
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

    }

    if (backgroundMusic && !backgroundMusic.paused) {
        musicWasPlayingBeforeVideo = true;
        pauseBackgroundMusic();
    } else {
        musicWasPlayingBeforeVideo = false;
    }
    isVideoPlaying = true;
    
}


function closeModal() {
    const modal = document.getElementById("projectModal");
    const iframe = modal.querySelector("iframe");

    if (iframe) {
        iframe.src = "";   // ✅ Completely clear source → video stops
    }

    modal.style.display = 'none';
    document.body.style.overflow = 'auto';

    // Resume music if it was playing before
    if (musicWasPlayingBeforeVideo) {
        playBackgroundMusic();
    }
    isVideoPlaying = false;
}


// Optimized showreel functions
function playShowreel() {
    const modal = document.getElementById('showreelModal');
    const iframe = document.getElementById('showreelPlayer');

    // Open modal
    modal.style.display = "block";

    iframe.src = "https://www.youtube.com/embed/xMu-Zl-qNhY?autoplay=1&rel=0&vq=hd1080";

    // Disable heavy effects
    document.body.classList.add("video-playing");

    // Pause background music if playing
    if (backgroundMusic && !backgroundMusic.paused) {
        musicWasPlayingBeforeVideo = true;
        pauseBackgroundMusic();
    } else {
        musicWasPlayingBeforeVideo = false;
    }
    isVideoPlaying = true;
}

function closeShowreel() {
    const modal = document.getElementById('showreelModal');
    const iframe = document.getElementById('showreelPlayer');

    // Close modal
    modal.style.display = "none";

    // Stop video
    iframe.src = "";

    // Re-enable effects
    document.body.classList.remove("video-playing");

    // Resume music if it was playing before
    if (musicWasPlayingBeforeVideo) {
        playBackgroundMusic();
    }
    isVideoPlaying = false;

    // 🔥 Restart cursor follower animation
    if (rafId === null) {
        requestAnimationFrame(animateFollower);
    }
}

// Close modal when clicking outside the video
window.addEventListener("click", function(event) {
    const modal = document.getElementById('showreelModal');
    if (event.target === modal) {
        closeShowreel();
    }
});


// Event delegation for better performance
document.addEventListener('click', (e) => {
    if (e.target.matches('.close') || e.target.closest('.close')) {
        closeModal();
        closeShowreel();
    }
    
    if (e.target === modal) {
        closeModal();
    }
    
    if (e.target === document.getElementById('showreelModal')) {
        closeShowreel();
    }
});

// Optimized form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>Sending...';
        submitBtn.disabled = true;
        submitBtn.style.background = 'var(--text-dim)';
        
        try {
            const formData = new FormData(contactForm);
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                submitBtn.innerHTML = '<i class="fas fa-check" style="margin-right: 0.5rem;"></i>Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                contactForm.reset();
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = 'var(--gradient-primary)';
                }, 3000);
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>Error!';
            submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = 'var(--gradient-primary)';
            }, 3000);
        }
    });
}

// Optimized mobile menu
function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu');
    const mobileNav = document.getElementById('mobileNav');
    const closeBtn = document.querySelector('.close-mobile');

    if (!mobileBtn || !mobileNav) return;

    let overlay = document.getElementById('mobileNavOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mobileNavOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1999;opacity:0;pointer-events:none;transition:opacity 0.3s ease;';
        document.body.appendChild(overlay);
    }

    function openMenu() {
        mobileNav.classList.add('active');
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileNav.classList.remove('active');
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        document.body.style.overflow = '';
    }

    mobileBtn.addEventListener('click', () => {
        if (mobileNav.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    mobileNav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modal.style.display === 'block') closeModal();
        if (document.getElementById('showreelModal').style.display === 'block') closeShowreel();
    }
});

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}

console.log('🎬 Hancenzo Portfolio loaded successfully!');



// Global View Counter with countapi.xyz
window.addEventListener("load", () => {
    const viewCounter = document.getElementById("viewCounter");
    if (viewCounter) {
        fetch("https://api.api-ninjas.com/v1/counter?id=site-views&hit=true", {
            headers: { "X-Api-Key": "x2Kdjv0YvZ8GR2W1Rj+6GQ==CApKY7ixj3THIHsA" }
        })
            .then(res => res.json())
            .then(data => {
                viewCounter.textContent = `Views: ${data.value}`;
            })
            .catch(() => {
                viewCounter.textContent = "Views: N/A";
            });
    }
});

// Hide view counter on scroll for mobile
window.addEventListener("scroll", () => {
    const viewCounter = document.getElementById("viewCounter");

    if (window.innerWidth <= 768) { // mobile only
        if (window.scrollY > 10) {
            viewCounter.classList.add("hide");
        } else {
            viewCounter.classList.remove("hide");
        }
    } else {
        viewCounter.classList.remove("hide"); // always visible on desktop
    }
});



