const countdownEl = document.getElementById('countdown-text');
const introContainer = document.getElementById('intro-container');
const introVideo = document.getElementById('intro-video');
const introAudio = document.getElementById('intro-audio');
const bgMusic = document.getElementById('bg-music');

function updateCountdown() {
  const target = new Date('2025-12-21T00:00:00');
  const now = new Date();
  const diff = target - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

window.addEventListener('load', () => {
  introVideo.play().catch(console.error);
  introAudio.play().catch(console.error);

  setTimeout(() => {
    introVideo.classList.add('fade-out');
  }, 4000);

  setTimeout(() => {
    introContainer.style.display = 'none';
    bgMusic.play().catch(console.error);
  }, 5000);
});

function showComponent(id) {
  document.querySelectorAll('.popup').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}
