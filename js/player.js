// 📦 Firebase Modules Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBAy6sL_E8zNlUUw-y_Pi7HwIQTD6OPKNw",
    authDomain: "live-4e3a1.firebaseapp.com",
    projectId: "live-4e3a1",
    storageBucket: "live-4e3a1.firebasestorage.app",
    messagingSenderId: "86608024691",
    appId: "1:86608024691:web:1ce9c6dfb408aeeb4d0606"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoUrl = urlParams.get('url');
    const videoTitle = urlParams.get('title');

    const youtubePlayer = document.getElementById("youtubePlayer");
    const directPlayer = document.getElementById("directPlayer");
    const titleElement = document.getElementById("videoTitle");
    const videoOverlay = document.getElementById("videoOverlay");
    const fullscreenBtn = document.getElementById("fullscreenBtn");
    const videoWrapper = document.querySelector(".video-wrapper");

    if (videoTitle) {
        titleElement.innerText = decodeURIComponent(videoTitle);
    } else {
        titleElement.innerText = "Live Lecture Room";
    }

    if (!videoUrl) {
        titleElement.innerText = "Error: Video link not found!";
        return;
    }

    function extractYouTubeId(url) {
        const decodedUrl = decodeURIComponent(url);
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
        const match = decodedUrl.match(regExp);
        return (match && match[2].split('?')[0].length === 11) ? match[2].split('?')[0] : null;
    }

    const youtubeId = extractYouTubeId(videoUrl);

    if (youtubeId) {
        // 📺 यूट्यूब प्लेयर चालू करें
        youtubePlayer.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=0&disablekb=1&rel=0&modestbranding=1&fs=1`;
        youtubePlayer.style.display = "block";
        
        if (videoOverlay) {
            videoOverlay.style.display = "block";
            // 🔒 माउस इवेंट्स केवल निचले हिस्से के लिए ब्लॉक करें ताकि वीडियो पर क्लिक्स न रुकें
            videoOverlay.style.pointerEvents = "none"; 
        }
        if (directPlayer) directPlayer.style.display = "none";

    } else {
        // 📹 डायरेक्ट वीडियो प्लेयर चालू करें
        if (directPlayer) {
            directPlayer.src = decodeURIComponent(videoUrl);
            directPlayer.style.display = "block";
            youtubePlayer.style.display = "none";
            if (videoOverlay) videoOverlay.style.display = "none";

            // 🚫 एंटी-स्किप मैकेनिज्म
            let lastWatchedTime = 0;
            directPlayer.addEventListener('timeupdate', () => {
                if (!directPlayer.seeking) {
                    if (directPlayer.currentTime - lastWatchedTime > 0 && directPlayer.currentTime - lastWatchedTime < 2) {
                        lastWatchedTime = directPlayer.currentTime;
                    }
                }
            });

            directPlayer.addEventListener('seeking', () => {
                const delta = directPlayer.currentTime - lastWatchedTime;
                if (Math.abs(delta) > 0.5) {
                    directPlayer.currentTime = lastWatchedTime;
                }
            });
            
            directPlayer.load();
            directPlayer.play().catch(err => console.log("Autoplay context handled."));
        }
    }

    // 🎛️ परफेक्ट यूनिवर्सल फुलस्क्रीन लॉजिक
    if (fullscreenBtn && videoWrapper) {
        fullscreenBtn.addEventListener("click", () => {
            const isFull = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
            
            if (!isFull) {
                if (videoWrapper.requestFullscreen) {
                    videoWrapper.requestFullscreen();
                } else if (videoWrapper.webkitRequestFullscreen) {
                    videoWrapper.webkitRequestFullscreen(); // Safari / iOS support
                } else if (videoWrapper.msRequestFullscreen) {
                    videoWrapper.msRequestFullscreen();
                }
                fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i> Exit';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i> Fullscreen';
            }
        });

        const handleFullscreenChange = () => {
            const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
            if (!isFullscreen) {
                fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i> Fullscreen';
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("msfullscreenchange", handleFullscreenChange);
    }
});
