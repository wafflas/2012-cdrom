// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const introVideo = document.getElementById('intro-video');
    const introContainer = document.getElementById('intro-container');
    const mainGui = document.getElementById('main-gui');
    const backgroundVideo = document.getElementById('background-video');
    const bgMusic = document.getElementById('bg-music');
    const glitchAudio = document.getElementById('glitch-audio');

    let introTimeout;

    function startIntroSequence() {
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
            }, 4000);
        });
    }

    // Always start intro when page is shown (including back/forward navigation)
    window.addEventListener('pageshow', startIntroSequence);

    // Also start intro on first load (for browsers that don't fire pageshow)
    startIntroSequence();

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
                // Start background music
                bgMusic.play().catch(error => {
                    console.log('Background music autoplay failed:', error);
                });
            }, 100);
        }, 1000);
    }

    // Ensure background video plays
    backgroundVideo.play().catch(error => {
        console.log('Background video autoplay failed:', error);
    });
});

// Menu click handler
function handleMenuClick(action) {
    switch(action) {
        case 'album':
            // Load albumlistening.html into the #album popup
            fetch('pages/albumlistening.html')
                .then(response => response.text())
                .then(html => {
                    const albumPopup = document.getElementById('album');
                    albumPopup.innerHTML = html;
                    albumPopup.classList.remove('hidden');
                });
            break;
        case 'content':
            console.log('Exclusive content selected');
            break;
        case 'game':
            console.log('Game selected');
            break;
        case 'credits':
            console.log('Credits selected');
            break;
    }
} 





function playTrack(filename) {
    const player = document.getElementById('album-player');
    player.src = `media/audio/${filename}`;
    player.hidden = false;
    player.play();
}