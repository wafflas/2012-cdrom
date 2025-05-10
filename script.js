/**
 * Main JavaScript file for the 2012 MiniDisc interface
 * Handles intro sequence, navigation, modal views, and audio playback
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    const introImage = document.getElementById('intro-image');
    const introContainer = document.getElementById('intro-container');
    const mainGui = document.getElementById('main-gui');
    const bgMusic = document.getElementById('bg-music');
    const glitchAudio = document.getElementById('glitch-audio');
    
    // Initialize glitch text for menu items
    initGlitchTextEffect();
    
    // Initialize 3D hover effects for the MiniDisc
    init3DHoverEffect();

    let introTimeout;

    // Setup continuous background music handling
    function setupContinuousMusic() {
        if (bgMusic) {
            console.log('Setting up continuous music');
            
            // Check if this is a page load with stored music state
            const musicPosition = parseFloat(sessionStorage.getItem('musicPosition'));
            const musicWasPlaying = sessionStorage.getItem('musicPlaying');
            
            console.log('Stored music position:', musicPosition, 'Was playing:', musicWasPlaying);
            
            // Add beforeunload event listener to save position on navigation
            window.addEventListener('beforeunload', () => {
                // Always store the current state of music
                sessionStorage.setItem('musicPosition', bgMusic.currentTime);
                sessionStorage.setItem('musicPlaying', bgMusic.paused ? 'false' : 'true');
                console.log('Saving on unload:', bgMusic.currentTime, !bgMusic.paused);
            });
            
            // First navigation special handling
            const firstNavigation = sessionStorage.getItem('firstNavigation') === 'true';
            
            // Perform different actions based on page load state
            if (firstNavigation) {
                console.log('First navigation detected, ensuring music continues');
                // This is the first navigation after intro
                // We need to ensure music continues to play
                
                if (!isNaN(musicPosition) && musicWasPlaying === 'true') {
                    console.log('Resuming music at position:', musicPosition);
                    bgMusic.currentTime = musicPosition;
                    bgMusic.play().catch(e => console.log('Play error:', e));
                }
                
                // Reset the flag
                sessionStorage.removeItem('firstNavigation');
            } 
            else if (!isNaN(musicPosition)) {
                // Normal navigation or page refresh
                console.log('Normal navigation detected');
                
                if (musicWasPlaying === 'true') {
                    console.log('Resuming music from:', musicPosition);
                    bgMusic.currentTime = musicPosition;
                    bgMusic.play().catch(e => console.log('Play error:', e));
                } else {
                    console.log('Music was paused, keeping it paused');
                    bgMusic.pause();
                    bgMusic.currentTime = musicPosition;
                }
            }
            
            // Add timeupdate listener to continuously update stored position
            bgMusic.addEventListener('timeupdate', () => {
                if (!bgMusic.paused) {
                    sessionStorage.setItem('musicPosition', bgMusic.currentTime);
                }
            });
            
            // Handle play/pause when tab visibility changes
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // Page is hidden, store current state
                    sessionStorage.setItem('musicPosition', bgMusic.currentTime);
                    sessionStorage.setItem('musicPlaying', bgMusic.paused ? 'false' : 'true');
                } else {
                    // Page is visible again
                    const storedPosition = parseFloat(sessionStorage.getItem('musicPosition'));
                    const wasPlaying = sessionStorage.getItem('musicPlaying') === 'true';
                    
                    if (!isNaN(storedPosition) && wasPlaying) {
                        bgMusic.currentTime = storedPosition;
                        bgMusic.play().catch(e => console.log('Play error on visibility:', e));
                    }
                }
            });
        }
    }
    
    // Set up music continuity
    setupContinuousMusic();

    /**
     * Starts the intro sequence
     * Displays the glitchy intro GIF with sound and transitions to main GUI after the exact duration
     */
    function startIntroSequence() {
        // Check if we've already shown the intro during this session
        const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
        
        // If coming back via browser history/navigation and already seen intro, skip to main
        if (hasSeenIntro && (performance.navigation.type === 2 || document.referrer.includes(window.location.host))) {
            introContainer.classList.add('hidden');
            mainGui.classList.remove('hidden');
            mainGui.style.opacity = '1';
            
            // Clear any leftover navigation flags
            sessionStorage.removeItem('firstNavigation');
            
            console.log('Skipping intro, resuming from stored state');
            
            // Start background music (if it was playing before)
            const musicWasPlaying = sessionStorage.getItem('musicPlaying') === 'true';
            if (musicWasPlaying && bgMusic) {
                const musicPosition = parseFloat(sessionStorage.getItem('musicPosition'));
                if (!isNaN(musicPosition)) {
                    console.log('Resuming music at position:', musicPosition);
                    bgMusic.currentTime = musicPosition;
                }
                bgMusic.play().catch(error => {
                    console.log('Background music autoplay failed:', error);
                });
            }
            return;
        }
        
        // Mark that user has seen the intro in this session
        sessionStorage.setItem('hasSeenIntro', 'true');
        
        // Reset states
        introContainer.classList.remove('hidden');
        mainGui.classList.add('hidden');
        introContainer.style.opacity = '1';
        mainGui.style.opacity = '0';

        // Reset and prepare audio
        if (glitchAudio) {
            glitchAudio.currentTime = 0;
            glitchAudio.pause();
            
            // Set the glitch sound duration to match the GIF (typically 4 seconds)
            const glitchDuration = 4000; // 4 seconds
            
            // Play glitch sound
            glitchAudio.play().catch(error => {
                console.log('Glitch audio autoplay failed:', error);
            });
            
            // Set timeout to precisely match audio duration
            introTimeout = setTimeout(() => {
                transitionToMain();
            }, glitchDuration);
        } else {
            // Fallback if glitch audio isn't available
            introTimeout = setTimeout(() => {
                transitionToMain();
            }, 4000);
        }
        
        // Make sure background music is paused during intro
        if (bgMusic && !bgMusic.paused) {
            bgMusic.pause();
        }
    }

    // Only start intro on page load
    // Remove pageshow event to prevent triggering when navigating back
    startIntroSequence();

    /**
     * Handles transition from intro screen to main GUI
     * Creates a mysterious, glitchy transition effect
     */
    function transitionToMain() {
        // Stop glitch audio
        if (glitchAudio) {
            // Fade out glitch audio for smoother transition
            const fadeInterval = setInterval(() => {
                if (glitchAudio.volume > 0.1) {
                    glitchAudio.volume -= 0.1;
                } else {
                    glitchAudio.pause();
                    glitchAudio.volume = 1.0; // Reset volume for next time
                    clearInterval(fadeInterval);
                }
            }, 100);
        }

        // Create a glitchy transition effect
        const glitchOverlay = document.createElement('div');
        glitchOverlay.style.position = 'fixed';
        glitchOverlay.style.top = '0';
        glitchOverlay.style.left = '0';
        glitchOverlay.style.width = '100vw';
        glitchOverlay.style.height = '100vh';
        glitchOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        glitchOverlay.style.zIndex = '9000';
        glitchOverlay.style.opacity = '0';
        glitchOverlay.style.transition = 'opacity 0.5s ease';
        document.body.appendChild(glitchOverlay);

        // Pulse effect for mysterious transition
        setTimeout(() => {
            glitchOverlay.style.opacity = '1';
            
            // Add some random scan lines for TV effect
            const scanLines = document.createElement('div');
            scanLines.style.position = 'fixed';
            scanLines.style.top = '0';
            scanLines.style.left = '0';
            scanLines.style.width = '100vw';
            scanLines.style.height = '100vh';
            scanLines.style.background = 'linear-gradient(to bottom, transparent 50%, rgba(0, 230, 255, 0.15) 51%)';
            scanLines.style.backgroundSize = '100% 4px';
            scanLines.style.zIndex = '9001';
            scanLines.style.opacity = '0';
            scanLines.style.animation = 'fadeInOut 2s';
            document.body.appendChild(scanLines);
            
            // Create a style element for the animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; }
                    25% { opacity: 0.8; }
                    75% { opacity: 0.3; }
                    100% { opacity: 0; }
                }
                @keyframes glitchShift {
                    0% { transform: translate(0); }
                    20% { transform: translate(-10px, 5px); }
                    40% { transform: translate(10px, -5px); }
                    60% { transform: translate(-5px, -5px); }
                    80% { transform: translate(5px, 5px); }
                    100% { transform: translate(0); }
                }
            `;
            document.head.appendChild(style);
            
            // Create quick glitch effect
            introContainer.style.animation = 'glitchShift 0.5s';
            
            setTimeout(() => {
                // Fade out intro
                introContainer.style.opacity = '0';
                introContainer.style.transition = 'opacity 1.5s cubic-bezier(0.23, 1, 0.32, 1)';
                
                setTimeout(() => {
                    // Hide intro container
                    introContainer.classList.add('hidden');
                    
                    // Show main GUI with fade in
                    mainGui.classList.remove('hidden');
                    mainGui.style.opacity = '0';
                    
                    // Create a better fade effect
                    setTimeout(() => {
                        // Remove glitch overlay with fade
                        glitchOverlay.style.opacity = '0';
                        
                        // Fade in main GUI with smoother cubic bezier
                        mainGui.style.transition = 'opacity 2s cubic-bezier(0.19, 1, 0.22, 1)';
                        mainGui.style.opacity = '1';
                        
                        // Start background music only now, from the beginning
                        if (bgMusic && bgMusic.paused) {
                            // Set flag to indicate the next navigation will be the first one after intro
                            // This helps us ensure music continues properly on first navigation
                            sessionStorage.setItem('firstNavigation', 'true');
                            
                            console.log('Starting music from beginning after intro');
                            
                            // Always start from beginning after intro
                            bgMusic.currentTime = 0;
                            
                            bgMusic.play().catch(error => {
                                console.log('Background music autoplay failed:', error);
                            });
                            sessionStorage.setItem('musicPlaying', 'true');
                        }
                        
                        // Clean up after transition completes
                        setTimeout(() => {
                            document.body.removeChild(glitchOverlay);
                            document.body.removeChild(scanLines);
                            document.head.removeChild(style);
                        }, 2000);
                    }, 500);
                }, 1000);
            }, 500);
        }, 200);
    }

    /**
     * Creates and adds the minimalist copyright element to the page
     */
    const copyright = document.createElement('div');
    copyright.className = 'copyright';
    copyright.textContent = '© 2025  cd 2012';
    document.body.appendChild(copyright);
    
    /**
     * Creates and adds the scanline effect overlay
     * Enhances retro/glitchy aesthetic across all views
     */
    const scanlines = document.createElement('div');
    scanlines.className = 'scanlines';
    document.body.appendChild(scanlines);
});

/**
 * Navigation with loading transition
 * Creates a glitchy loading screen with 3D spinning animation when navigating between pages
 * @param {string} url - The URL to navigate to
 */
function navigateWithTransition(url) {
    // Fix URLs to use root paths when needed
    if (url === 'index.html') {
        url = './'; // Use root path instead of index.html
    }
    
    // Store music position before navigation if music is playing
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        // Always store the current state of the music, regardless if it's playing or not
        sessionStorage.setItem('musicPosition', bgMusic.currentTime);
        sessionStorage.setItem('musicPlaying', bgMusic.paused ? 'false' : 'true');
        
        // For debugging
        console.log('Storing music position:', bgMusic.currentTime, 'Playing:', !bgMusic.paused);
    }
    
    // Create loading animation
    const loadingEl = document.createElement('div');
    loadingEl.className = 'enigmatic-loading';
    
    // Create glitch container
    const glitchContainer = document.createElement('div');
    glitchContainer.className = 'glitch-container';
    
    // Create 3D spinning container
    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'spinner-container';
    
    // Add preview image with 3D spin effect
    const previewImg = document.createElement('img');
    previewImg.src = url.includes('..') ? '../media/minidisc-2012nobg2.png' : 'media/minidisc-2012nobg2.png';
    previewImg.className = 'preview-image spinning';
    spinnerContainer.appendChild(previewImg);
    
    // Add reflection effect
    const reflection = document.createElement('div');
    reflection.className = 'reflection';
    spinnerContainer.appendChild(reflection);
    
    // Add glitchy loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'glitch-text';
    loadingText.textContent = 'Loading...';
    
    // Add elements to containers
    glitchContainer.appendChild(spinnerContainer);
    glitchContainer.appendChild(loadingText);
    loadingEl.appendChild(glitchContainer);
    document.body.appendChild(loadingEl);
    
    // Add some random glitch effects during the transition
    let glitchInterval = setInterval(() => {
        // Random glitch filter changes
        if (Math.random() > 0.7) {
            const hueRotate = Math.floor(Math.random() * 360);
            const blurValue = Math.random() * 5;
            previewImg.style.filter = `hue-rotate(${hueRotate}deg) blur(${blurValue}px)`;
            setTimeout(() => {
                previewImg.style.filter = '';
            }, 150);
        }
    }, 800);
    
    // Navigate after delay
    setTimeout(() => {
        clearInterval(glitchInterval);
        window.location.href = url;
    }, 2500);
}

/**
 * Album Player Functions
 * Handles track playback in the album listening section
 */

/**
 * Plays a track in the album player
 * @param {string} filename - The audio filename to play
 */
function playTrack(filename) {
    const player = document.getElementById('album-player');
    const basePath = window.location.pathname.includes('pages') ? '../media/audio/' : 'media/audio/';
    player.src = `${basePath}${filename}`;
    player.hidden = false;
    player.play();
}

/**
 * GlitchText Effect
 * Applies a scrambled text animation when hovering over interactive elements
 * Applied to all clickable elements across the project
 */
function initGlitchTextEffect() {
    // Target all clickable elements across the site
    const interactiveElements = document.querySelectorAll(
        '.track-item, .back-button, .menu-item, .interactive-text, .modal-close, .modal-x, ' + 
        '.menu-button, .sidebar-button, .game-start-container span, .back-to-menu-text, ' +
        'a[href], button, [onclick], [role="button"], .glitch-text, .terminal-status'
    );
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    interactiveElements.forEach(item => {
        // Skip elements that don't have text content
        if (!item.textContent || item.textContent.trim() === '') return;
        
        // Skip elements that already have the effect
        if (item.hasAttribute('data-glitch-applied')) return;
        
        const originalText = item.textContent;
        let interval = null;
        let iterations = 0;
        
        // Store original text 
        item.dataset.originalText = originalText;
        
        // Mark as having glitch applied
        item.setAttribute('data-glitch-applied', 'true');
        
        // Add custom glitch styles on hover
        item.addEventListener('mouseenter', function() {
            // Add a subtle glow effect
            this.style.textShadow = '0 0 8px rgba(0, 255, 255, 0.8), 0 0 12px rgba(0, 255, 255, 0.5)';
            this.style.transition = 'all 0.3s ease';
            
            clearInterval(interval);
            iterations = 0;
            
            // Start the glitch effect on hover with faster animation for shorter texts
            const speed = Math.max(10, Math.min(25, 25 - originalText.length));
            
            interval = setInterval(() => {
                item.textContent = originalText.split('')
                    .map((char, index) => {
                        // Return original character if it's already been displayed
                        if (index < iterations) {
                            return originalText[index];
                        }
                        // Only replace letters and numbers with random characters
                        if (/[A-Z0-9]/i.test(char)) {
                            return letters[Math.floor(Math.random() * 36)];
                        }
                        return char; // Keep spaces and special characters
                    })
                    .join('');
                
                // Increase iterations faster for hover effect
                iterations += 1/3;
                
                // Stop when all characters are restored
                if (iterations >= originalText.length) {
                    clearInterval(interval);
                    item.textContent = originalText;
                }
            }, speed);
        });
        
        item.addEventListener('mouseleave', function() {
            // Reset text immediately on leave
            clearInterval(interval);
            item.textContent = originalText;
            
            // Remove the glow effect
            this.style.textShadow = '';
        });
    });
    
    // Watch for new elements added to the DOM and apply effect to them
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    // Check if the added node is an element and has not been processed
                    if (node.nodeType === 1 && !node.hasAttribute('data-glitch-applied')) {
                        // Check if it's a clickable element
                        if (node.matches('.track-item, .back-button, .menu-item, .interactive-text, .modal-close, .modal-x, ' + 
                          '.menu-button, .sidebar-button, .game-start-container span, .back-to-menu-text, ' +
                          'a[href], button, [onclick], [role="button"], .glitch-text, .terminal-status')) {
                            // Apply glitch effect
                            if (node.textContent && node.textContent.trim() !== '') {
                                const originalText = node.textContent;
                                let interval = null;
                                let iterations = 0;
                                
                                node.dataset.originalText = originalText;
                                node.setAttribute('data-glitch-applied', 'true');
                                
                                // Add hover event listeners
                                node.addEventListener('mouseenter', function() {
                                    // Add a subtle glow effect
                                    this.style.textShadow = '0 0 8px rgba(0, 255, 255, 0.8), 0 0 12px rgba(0, 255, 255, 0.5)';
                                    this.style.transition = 'all 0.3s ease';
                                    
                                    clearInterval(interval);
                                    iterations = 0;
                                    
                                    const speed = Math.max(10, Math.min(25, 25 - originalText.length));
                                    
                                    interval = setInterval(() => {
                                        node.textContent = originalText.split('')
                                            .map((char, index) => {
                                                if (index < iterations) {
                                                    return originalText[index];
                                                }
                                                if (/[A-Z0-9]/i.test(char)) {
                                                    return letters[Math.floor(Math.random() * 36)];
                                                }
                                                return char;
                                            })
                                            .join('');
                                        
                                        iterations += 1/3;
                                        
                                        if (iterations >= originalText.length) {
                                            clearInterval(interval);
                                            node.textContent = originalText;
                                        }
                                    }, speed);
                                });
                                
                                node.addEventListener('mouseleave', function() {
                                    clearInterval(interval);
                                    node.textContent = originalText;
                                    this.style.textShadow = '';
                                });
                            }
                        }
                        
                        // Also check any children of the node
                        const childInteractiveElements = node.querySelectorAll(
                            '.track-item, .back-button, .menu-item, .interactive-text, .modal-close, .modal-x, ' + 
                            '.menu-button, .sidebar-button, .game-start-container span, .back-to-menu-text, ' +
                            'a[href], button, [onclick], [role="button"], .glitch-text, .terminal-status'
                        );
                        
                        childInteractiveElements.forEach(child => {
                            if (!child.hasAttribute('data-glitch-applied') && child.textContent && child.textContent.trim() !== '') {
                                const originalText = child.textContent;
                                let interval = null;
                                let iterations = 0;
                                
                                child.dataset.originalText = originalText;
                                child.setAttribute('data-glitch-applied', 'true');
                                
                                child.addEventListener('mouseenter', function() {
                                    this.style.textShadow = '0 0 8px rgba(0, 255, 255, 0.8), 0 0 12px rgba(0, 255, 255, 0.5)';
                                    this.style.transition = 'all 0.3s ease';
                                    
                                    clearInterval(interval);
                                    iterations = 0;
                                    
                                    const speed = Math.max(10, Math.min(25, 25 - originalText.length));
                                    
                                    interval = setInterval(() => {
                                        child.textContent = originalText.split('')
                                            .map((char, index) => {
                                                if (index < iterations) {
                                                    return originalText[index];
                                                }
                                                if (/[A-Z0-9]/i.test(char)) {
                                                    return letters[Math.floor(Math.random() * 36)];
                                                }
                                                return char;
                                            })
                                            .join('');
                                        
                                        iterations += 1/3;
                                        
                                        if (iterations >= originalText.length) {
                                            clearInterval(interval);
                                            child.textContent = originalText;
                                        }
                                    }, speed);
                                });
                                
                                child.addEventListener('mouseleave', function() {
                                    clearInterval(interval);
                                    child.textContent = originalText;
                                    this.style.textShadow = '';
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    
    // Observe the entire document for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * 3D Hover Effect for MiniDisc
 * Creates a 3D rotation effect when hovering over the MiniDisc
 * Menu follows the rotation to create a cohesive 3D experience
 */
function init3DHoverEffect() {
    const container = document.getElementById('minidisc-container');
    const wrapper = document.getElementById('minidisc-wrapper');
    const menuContainer = document.querySelector('.menu-container');
    const menuItems = document.querySelectorAll('.menu-item');
    
    if (!container || !wrapper) return;
    
    let bounds;
    
    // Add debugging to check for menu interactions
    menuItems.forEach((item, index) => {
        console.log(`Setting up menu item ${index}`);
        
        // Ensure menu items are always interactive
        item.style.pointerEvents = 'auto';
        item.style.zIndex = '1000';
        
        // Set initial width based on content
        item.style.width = 'fit-content';
        
        // Simple direct event listeners for menu item hover effects
        item.addEventListener('mouseover', function() {
            console.log(`Hovering menu item ${index}`);
            this.style.color = 'aquamarine';
            // Use transform that maintains width based on content
            this.style.transform = 'translateZ(2px) scale(1.1)';
            // Ensure width remains based on content
            this.style.width = 'fit-content';
        });
        
        item.addEventListener('mouseout', function() {
            console.log(`Left menu item ${index}`);
            this.style.color = '';
            this.style.transform = 'translateZ(0.5px)';
            // Reset to content-based width
            this.style.width = 'fit-content';
        });
        
        item.addEventListener('click', function(e) {
            console.log(`Clicked menu item ${index}`);
            // Prevent default only if this is a test link
            if (item.getAttribute('href') === 'javascript:void(0)') {
                e.preventDefault();
            }
        });
    });
    
    /**
     * Rotates the MiniDisc based on mouse position
     * @param {MouseEvent} e - The mouse event
     */
    function rotateToMouse(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        if (!bounds) {
            bounds = container.getBoundingClientRect();
        }
        
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        
        const percentX = (mouseX - centerX) / (bounds.width / 2);
        const percentY = -((mouseY - centerY) / (bounds.height / 2));
        
        const maxRotate = 15; // Maximum rotation in degrees
        
        // Apply rotation to the MiniDisc
        wrapper.style.transform = `
            scale(1.05)
            rotateX(${percentY * maxRotate}deg)
            rotateY(${percentX * maxRotate}deg)
        `;
        
        // Make the menu follow with identical rotation but more Z distance
        menuContainer.style.transform = `
            translateZ(50px)
            rotateX(${percentY * maxRotate}deg)
            rotateY(${percentX * maxRotate}deg)
        `;
        
        // Keep the z-index at maximum values
        menuContainer.style.zIndex = '999';
        menuItems.forEach(item => {
            item.style.zIndex = '1000';
        });
    }
    
    /**
     * Resets the 3D transform when mouse leaves the container
     */
    function resetTransform() {
        wrapper.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        menuContainer.style.transform = 'translateZ(50px) rotateX(0deg) rotateY(0deg)';
        
        // Keep the z-index at maximum values
        menuContainer.style.zIndex = '999';
        menuItems.forEach(item => {
            item.style.zIndex = '1000';
        });
        
        bounds = null;
    }
    
    // Handle mouse interactions for 3D effect
    container.addEventListener('mousemove', rotateToMouse);
    container.addEventListener('mouseleave', resetTransform);
    container.addEventListener('mouseenter', function(e) {
        bounds = container.getBoundingClientRect();
        rotateToMouse(e);
    });
    
    // Add interactivity detection to help debug
    menuContainer.addEventListener('mouseenter', function() {
        console.log('Menu container entered');
    });
    
    menuContainer.addEventListener('mouseleave', function() {
        console.log('Menu container left');
    });
    
    // Reset bounds on window events to ensure calculations stay accurate
    window.addEventListener('scroll', function() {
        bounds = null;
    });
    
    window.addEventListener('resize', function() {
        bounds = null;
    });
}

/**
 * Maps section names to their preview images
 * Used in loading screens to show a glitchy preview of the destination
 */
const sectionPreviews = {
    'album': 'media/minidisc-2012nobg2.png',
    'content': 'media/minidisc-2012nobg2.png',
    'game': 'media/minidisc-2012nobg2.png',
    'credits': 'media/minidisc-2012nobg2.png'
};

// Track the currently active content
let currentActive = null;

/**
 * AWGE-style page transition system
 * Keeps background video visible while smoothly transitioning content
 * 
 * @param {string} action - The action identifier ('album', 'content', 'game', 'credits')
 */
function handleMenuClick(action) {
    // Prevent clicking the same section twice
    if (currentActive === action) return;
    
    // Create loading animation
    const loadingEl = createLoadingElement(action);
    document.body.appendChild(loadingEl);
    
    // Get the main video container - this will stay visible throughout transitions
    const backgroundVideo = document.querySelector('.fullscreen-video');
    const mainGui = document.getElementById('main-gui');
    
    // Prepare to fade out current content but keep video
    if (currentActive) {
        // If we have active content, fade it out first
        const activeModal = document.getElementById(currentActive);
        activeModal.classList.remove('modal-active');
        
        setTimeout(() => {
            activeModal.classList.add('hidden');
            loadContent(action, loadingEl);
        }, 400);
    } else {
        // Keep background video visible but dim the menu interface
        mainGui.classList.add('dimmed');
        
        // Go straight to loading the new content
        loadContent(action, loadingEl);
    }
    
    // Update the currently active section
    currentActive = action;
}

/**
 * Creates a loading element with glitch effects
 * @param {string} action - The destination section name
 * @returns {HTMLElement} - The loading element
 */
function createLoadingElement(action) {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'enigmatic-loading';
    
    // Create glitch container
    const glitchContainer = document.createElement('div');
    glitchContainer.className = 'glitch-container';
    
    // Add preview image with glitch effect if available
    if (sectionPreviews[action]) {
        const previewImg = document.createElement('img');
        previewImg.src = sectionPreviews[action];
        previewImg.className = 'preview-image';
        previewImg.alt = action;
        glitchContainer.appendChild(previewImg);
    }
    
    // Add glitchy loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'glitch-text';
    loadingText.textContent = 'Loading...';
    glitchContainer.appendChild(loadingText);
    
    // Add glitch container to loading element
    loadingEl.appendChild(glitchContainer);
    
    return loadingEl;
}

/**
 * Loads content from the server and displays it
 * @param {string} action - The section to load
 * @param {HTMLElement} loadingEl - The loading element to remove after loading
 */
function loadContent(action, loadingEl) {
    // Map actions to their corresponding HTML files
    const pageMap = {
        'album': 'albumlistening.html',
        'content': 'content.html',
        'game': 'game.html',
        'credits': 'credits.html'
    };

    // Add a delay to create suspense (AWGE-style)
    setTimeout(() => {
        fetch(`pages/${pageMap[action]}`)
            .then(response => response.text())
            .then(html => {
                // Apply glitch transition to loading screen
                loadingEl.classList.add('glitch-transition');
                
                setTimeout(() => {
                    // Remove the loading element
                    document.body.removeChild(loadingEl);
                    
                    const popup = document.getElementById(action);
                    
                    // Add close button and html content
                    const modalContent = `
                         <button class="modal-x" onclick="closeModal('${action}')">X</button>
                         ${html}
                     `;
                     
                     popup.innerHTML = modalContent;
                     popup.classList.remove('hidden');
                     
                     // Short delay for CSS transitions
                     setTimeout(() => {
                         popup.classList.add('modal-active');
                     }, 10);
                 }, 500);
             });
     }, 1000);
}

/**
 * Closes an open modal and returns to the main GUI
 * Shows glitchy transition effect during the process
 * 
 * @param {string} modalId - The ID of the modal to close
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const mainGui = document.getElementById('main-gui');
    
    // Reset current active tracking
    currentActive = null;
    
    // Save the modal's current position before removing active class
    const modalRect = modal.getBoundingClientRect();
    
    // Ensure modal stays in place during transition
    modal.style.position = 'fixed';
    modal.style.top = `${modalRect.top}px`;
    modal.style.left = `${modalRect.left}px`;
    modal.style.width = `${modalRect.width}px`;
    modal.style.height = `${modalRect.height}px`;
    
    // Create loading transition for return to main menu
    const loadingEl = createLoadingElement('main');
    
    // Fade out modal
    modal.classList.remove('modal-active');
    
    // Start transition sequence
    setTimeout(() => {
        // Hide and reset modal
        modal.classList.add('hidden');
        modal.style.position = '';
        modal.style.top = '';
        modal.style.left = '';
        modal.style.width = '';
        modal.style.height = '';
        
        // Show loading animation
        document.body.appendChild(loadingEl);
        
        // Add glitch effect and return to main
        setTimeout(() => {
            loadingEl.classList.add('glitch-transition');
            
            setTimeout(() => {
                // If we need to navigate to home page
                if (window.location.pathname.indexOf('/pages/') !== -1) {
                    // Store music position before navigating if music is playing
                    const bgMusic = document.getElementById('bg-music');
                    if (bgMusic) {
                        // Always store the current music state
                        console.log('Storing music state before closeModal navigation');
                        sessionStorage.setItem('musicPosition', bgMusic.currentTime);
                        sessionStorage.setItem('musicPlaying', bgMusic.paused ? 'false' : 'true');
                    }
                    
                    // We're on a subpage, navigate to root
                    window.location.href = '../';
                } else {
                    // Remove loading animation
                    document.body.removeChild(loadingEl);
                    
                    // Show main GUI
                    mainGui.classList.remove('dimmed');
                    mainGui.style.opacity = '1';
                }
            }, 800);
        }, 500);
    }, 500);
}

/**
 * Event listener for keyboard escape key
 * Allows closing the active modal by pressing ESC
 * Improves accessibility and usability
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentActive) {
        // Find active modal and close it
        closeModal(currentActive);
    }
});