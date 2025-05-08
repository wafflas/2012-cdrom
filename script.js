/**
 * Main JavaScript file for the 2012 MiniDisc interface
 * Handles intro sequence, navigation, modal views, and audio playback
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    const introVideo = document.getElementById('intro-video');
    const introContainer = document.getElementById('intro-container');
    const mainGui = document.getElementById('main-gui');
    const backgroundVideo = document.getElementById('background-video');
    const bgMusic = document.getElementById('bg-music');
    const glitchAudio = document.getElementById('glitch-audio');
    
    // Initialize glitch text for menu items
    initGlitchTextEffect();

    let introTimeout;

    // Setup continuous background music handling
    function setupContinuousMusic() {
        if (bgMusic) {
            // Store current time when user leaves the page
            window.addEventListener('beforeunload', () => {
                sessionStorage.setItem('musicPosition', bgMusic.currentTime);
                sessionStorage.setItem('musicPlaying', !bgMusic.paused);
            });
            
            // Check if we have a stored position to resume from
            const musicPosition = parseFloat(sessionStorage.getItem('musicPosition'));
            const musicWasPlaying = sessionStorage.getItem('musicPlaying') === 'true';
            
            if (!isNaN(musicPosition) && musicWasPlaying) {
                bgMusic.currentTime = musicPosition;
            }
            
            // Add timeupdate listener to keep the current time updated
            bgMusic.addEventListener('timeupdate', () => {
                if (!bgMusic.paused) {
                    sessionStorage.setItem('musicPosition', bgMusic.currentTime);
                }
            });
        }
    }
    
    // Set up music continuity
    setupContinuousMusic();

    /**
     * Starts the intro video sequence
     * Displays the glitchy intro video with sound and transitions to main GUI after 5 seconds
     * Resets video and audio states to ensure proper playback
     */
    function startIntroSequence() {
        // Check if we've already shown the intro during this session
        const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
        
        // If coming back via browser history/navigation and already seen intro, skip to main
        if (hasSeenIntro && (performance.navigation.type === 2 || document.referrer.includes(window.location.host))) {
            introContainer.classList.add('hidden');
            mainGui.classList.remove('hidden');
            mainGui.style.opacity = '1';
            
            // Start background music (if it was playing before)
            if (sessionStorage.getItem('musicPlaying') === 'true') {
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

        // Reset and play video/audio
        introVideo.currentTime = 0;
        introVideo.pause();
        if (glitchAudio) {
            glitchAudio.currentTime = 0;
            glitchAudio.pause();
        }

        // Play both, then set timeout
        Promise.all([
            introVideo.play().catch(() => {}),
            glitchAudio ? glitchAudio.play().catch(() => {}) : Promise.resolve()
        ]).then(() => {
            introTimeout = setTimeout(() => {
                introVideo.pause();
                transitionToMain();
            }, 5000);
        });
    }

    // Only start intro on page load
    // Remove pageshow event to prevent triggering when navigating back
    startIntroSequence();

    /**
     * Handles transition from intro screen to main GUI
     * Fades out intro container, stops audio, and fades in the main interface
     * Starts background music once transition completes
     */
    function transitionToMain() {
        // Fade out intro
        introContainer.style.opacity = '0';
        introContainer.style.transition = 'opacity 1s ease';
        
        // Stop glitch audio
        if (glitchAudio) {
            glitchAudio.pause();
            glitchAudio.currentTime = 0;
        }

        // Show main GUI after fade
        setTimeout(() => {
            introContainer.classList.add('hidden');
            mainGui.classList.remove('hidden');
            mainGui.style.opacity = '0';
            
            // Fade in main GUI
            setTimeout(() => {
                mainGui.style.transition = 'opacity 1s ease';
                mainGui.style.opacity = '1';
                
                // Only start background music if it wasn't already playing
                if (bgMusic.paused) {
                    // Start background music
                    bgMusic.play().catch(error => {
                        console.log('Background music autoplay failed:', error);
                    });
                    sessionStorage.setItem('musicPlaying', 'true');
                }
            }, 100);
        }, 1000);
    }

    // Ensure background video plays
    backgroundVideo.play().catch(error => {
        console.log('Background video autoplay failed:', error);
    });
    
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
 * GlitchText Effect
 * Converts React component to vanilla JavaScript for menu hover effects
 * Applies a scrambled text animation when hovering over menu items
 */
function initGlitchTextEffect() {
    const menuItems = document.querySelectorAll('.menu-item');
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    menuItems.forEach(item => {
        const originalText = item.textContent;
        let interval = null;
        let iterations = 0;
        
        // Store original text 
        item.dataset.originalText = originalText;
        
        item.addEventListener('mouseenter', () => {
            clearInterval(interval);
            iterations = 0;
            
            // Start the glitch effect on hover
            interval = setInterval(() => {
                item.textContent = originalText.split('')
                    .map((char, index) => {
                        // Return original character if it's already been displayed
                        if (index < iterations) {
                            return originalText[index];
                        }
                        // Return random character for remaining positions
                        return letters[Math.floor(Math.random() * 36)];
                    })
                    .join('');
                
                // Increase iterations faster for hover effect
                iterations += 1/6;
                
                // Stop when all characters are restored
                if (iterations >= originalText.length) {
                    clearInterval(interval);
                    item.textContent = originalText;
                }
            }, 25);
        });
        
        item.addEventListener('mouseleave', () => {
            // Reset immediately on leave
            clearInterval(interval);
            item.textContent = originalText;
        });
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
                // Remove loading animation
                document.body.removeChild(loadingEl);
                
                // Show main GUI
                mainGui.classList.remove('dimmed');
                mainGui.style.opacity = '1';
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

/**
 * Plays an audio track in the album player
 * Used by track items in the album listening section
 * 
 * @param {string} filename - The audio filename to play
 */
function playTrack(filename) {
    const player = document.getElementById('album-player');
    player.src = `media/audio/${filename}`;
    player.hidden = false;
    player.play();
}