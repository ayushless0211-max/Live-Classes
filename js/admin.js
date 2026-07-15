// 📦 1. Firebase Engine Core Declarations
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your targeted active live configuration nodes
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

// 🔑 YOUTUBE API KEY
const YOUTUBE_API_KEY = "AIzaSyByAosHpEP6xPMX78wBj4CE7pN3gEc5Xy8"; 

// Helper: Extract YouTube Hash Strings Safely
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].split('?')[0].length === 11) ? match[2].split('?')[0] : url;
}

// Helper: Get YouTube Video Duration in Minutes
async function getYouTubeVideoDuration(videoId) {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.includes("YOUR_YOUTUBE_API_KEY")) {
        console.warn("YouTube API Key Missing! Falling back to 120 minutes.");
        return 120;
    }
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${YOUTUBE_API_KEY}`);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const durationISO = data.items[0].contentDetails.duration;
            
            // Convert ISO 8601 Duration to Minutes
            const matches = durationISO.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            const hours = parseInt(matches[1] || 0);
            const minutes = parseInt(matches[2] || 0);
            const seconds = parseInt(matches[3] || 0);
            
            const totalMinutes = (hours * 60) + minutes + (seconds / 60);
            return totalMinutes > 0 ? totalMinutes : 2; 
        }
    } catch (error) {
        console.error("YouTube API Fetch Error:", error);
    }
    return 2; 
}

// 🏗️ DOM Interface Event Initialization Thread
document.addEventListener("DOMContentLoaded", () => {
    
    // Core Navigation Open/Close Drawer Logic
    const sideMenu = document.getElementById("sideMenu");
    const menuBackdrop = document.getElementById("menuBackdrop");
    const menuOpenBtn = document.getElementById("menuOpenBtn");
    const menuCloseBtn = document.getElementById("menuCloseBtn");

    if (menuOpenBtn && sideMenu && menuBackdrop) {
        menuOpenBtn.addEventListener("click", () => {
            sideMenu.classList.add("is-active");
            menuBackdrop.classList.add("is-active");
        });
    }

    if (menuCloseBtn && sideMenu && menuBackdrop) {
        const closeMenu = () => {
            sideMenu.classList.remove("is-active");
            menuBackdrop.classList.remove("is-active");
        };
        menuCloseBtn.addEventListener("click", closeMenu);
        menuBackdrop.addEventListener("click", closeMenu);
    }

    // 📡 Form Controller Submission: YouTube Lectures Pipeline
    const lectureForm = document.getElementById("lectureForm");
    if (lectureForm) {
        lectureForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const subject = document.getElementById("lectureSubject").value;
            const rawUrl = document.getElementById("lectureUrl").value;
            const scheduledStartTime = document.getElementById("lectureTime").value;
            const videoId = extractYouTubeId(rawUrl);

            // Fetch dynamic exact video duration
            const durationMinutes = await getYouTubeVideoDuration(videoId);

            try {
                await addDoc(collection(db, "lectures"), {
                    subject: subject,
                    youtubeUrl: rawUrl,
                    videoId: videoId,
                    scheduledStartTime: scheduledStartTime,
                    durationMinutes: durationMinutes, 
                    timestamp: Date.now()
                });
                alert("🎉 Lecture successfully streamed to user channels!");
                lectureForm.reset();
            } catch (error) {
                console.error("Database Save Failure: ", error);
                alert("❌ Connection lost. Verify field payloads.");
            }
        });
    }

    // 📡 Form Controller Submission: Homework Matrix Deployment
    const homeworkForm = document.getElementById("homeworkForm");
    if (homeworkForm) {
        homeworkForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = document.getElementById("homeworkTitle").value;
            const fileLink = document.getElementById("homeworkLink").value;
            const dueDate = document.getElementById("homeworkDueDate").value;

            try {
                await addDoc(collection(db, "homework"), {
                    title: title,
                    fileUrl: fileLink,
                    dueDate: dueDate,
                    timestamp: Date.now()
                });
                alert("📚 Homework task array deployed successfully!");
                homeworkForm.reset();
            } catch (error) {
                console.error("Database Write Failure: ", error);
                alert("❌ Configuration failed to write to Firestore.");
            }
        });
    }

    // 🖥️ Real-time Synchronization Loop for Academic Classes (Auto-Hide Ended Classes)
    const upcomingContainer = document.getElementById("upcomingClassesContainer");
    if (upcomingContainer) {
        onSnapshot(collection(db, "lectures"), (snapshot) => {
            upcomingContainer.innerHTML = "";
            if (snapshot.empty) {
                upcomingContainer.innerHTML = `<p class="loading-placeholder">No live classes running right now.</p>`;
                return;
            }
            snapshot.forEach((doc) => {
                const item = doc.data();
                const targetTime = new Date(item.scheduledStartTime).getTime();
                const rightNow = Date.now();
                
                // Fallback handling to ensure legacy documents don't stay broken on interface
                const durationMinutes = item.durationMinutes || 2; 
                const durationMs = durationMinutes * 60 * 1000;
                const isExpired = rightNow > (targetTime + durationMs);

                // Auto hide logic kicks in immediately if ended
                if (isExpired) return;

                let statusText = "Scheduled";
                let badgeClass = "badge-waiting";
                
                if (rightNow >= targetTime) {
                    statusText = "🔴 Live Now";
                    badgeClass = "badge-live";
                }

                const youtubeThumbnail = item.videoId ? `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg` : 'giphy.gif';
                const videoLink = item.youtubeUrl || `https://www.youtube.com/watch?v=${item.videoId}`;

                // Programmatic Container Block bypasses HTML hierarchy bugs completely
                const row = document.createElement("div");
                row.className = "dashboard-row-card";
                row.style.cssText = "display: flex !important; align-items: center; gap: 15px; margin-bottom: 12px; cursor: pointer !important; position: relative; z-index: 9999 !important; border-left: 4px solid #e2e8f0; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);";
                
                if (statusText === "🔴 Live Now") {
                    row.style.borderLeftColor = "#ef4444";
                }

                row.innerHTML = `
                    <div class="class-thumbnail-wrapper" style="width: 100px; height: 56px; overflow: hidden; border-radius: 4px; flex-shrink: 0; background: #e2e8f0;">
                        <img src="${youtubeThumbnail}" alt="Class Thumbnail" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="card-details" style="flex-grow: 1;">
                        <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600;">${item.subject || 'Broadcast Room'}</h4>
                        <span style="font-size: 13px; color: #64748b;">Schedule: ${new Date(item.scheduledStartTime).toLocaleString()}</span>
                    </div>
                    <div class="card-badge ${badgeClass}" style="flex-shrink: 0;">
                        ${statusText}
                    </div>
                `;

                // Programmatic Click Bindings
                row.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(videoLink, "_blank");
                });

                upcomingContainer.appendChild(row);
            });

            if (upcomingContainer.children.length === 0) {
                upcomingContainer.innerHTML = `<p class="loading-placeholder">No live classes running right now.</p>`;
            }
        });
    }

    // 🖥️ Real-time Synchronization Loop for Student Homework Tasking (With Web/Document Previews)
    const homeworkContainer = document.getElementById("pendingHomeworkContainer");
    if (homeworkContainer) {
        onSnapshot(collection(db, "homework"), (snapshot) => {
            homeworkContainer.innerHTML = "";
            if (snapshot.empty) {
                homeworkContainer.innerHTML = `<p class="loading-placeholder">All caught up! No pending homework tasks.</p>`;
                return;
            }
            snapshot.forEach((doc) => {
                const task = doc.data();
                const fileUrl = task.fileUrl || '#';
                
                const isImageUrl = /\.(jpeg|jpg|gif|png|webp)$/i.test(fileUrl);
                const isWebUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i.test(fileUrl);
                
                let assignmentThumbnail = 'https://img.icons8.com/fluent/96/pdf.png';
                if (isImageUrl) {
                    assignmentThumbnail = fileUrl;
                } else if (isWebUrl) {
                    assignmentThumbnail = 'https://img.icons8.com/fluent/96/domain.png'; 
                }

                // Programmatic Container Block bypasses HTML hierarchy bugs completely
                const row = document.createElement("div");
                row.className = "dashboard-row-card";
                row.style.cssText = "display: flex !important; align-items: center; gap: 15px; margin-bottom: 12px; cursor: pointer !important; position: relative; z-index: 9999 !important; border-left: 4px solid #d97706; padding: 10px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);";

                row.innerHTML = `
                    <div class="homework-thumbnail-wrapper" style="width: 50px; height: 50px; overflow: hidden; border-radius: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #f1f5f9; padding: 5px; box-sizing: border-box;">
                        <img src="${assignmentThumbnail}" alt="Preview" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                    <div class="card-details" style="flex-grow: 1;">
                        <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600;">📚 ${task.title || 'Assignment Details'}</h4>
                        <span style="font-size: 13px; color: #64748b;">Deadline: ${task.dueDate || 'End of Week'}</span>
                    </div>
                    <div class="card-badge badge-warning" style="flex-shrink: 0;">Pending</div>
                `;

                // Programmatic Click Bindings
                row.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(fileUrl, "_blank");
                });

                homeworkContainer.appendChild(row);
            });
        });
    }
});

// 🔐 Authentication Lifecycle Router State Engine
const authBtn = document.getElementById('login-btn'); 
const cartNavBtn = document.getElementById('cart-nav-btn');

onAuthStateChanged(auth, (user) => {
    if (!authBtn) return;
    if (user) {
        authBtn.innerText = "Logout"; 
        authBtn.href = "#";
        if (cartNavBtn) cartNavBtn.href = "cart.html";
        authBtn.onclick = (e) => { 
            e.preventDefault(); 
            signOut(auth).then(() => window.location.reload()); 
        };
    } else {
        authBtn.innerText = "Login"; 
        authBtn.href = "login.html"; 
        authBtn.onclick = null;
        if (cartNavBtn) cartNavBtn.href = "login.html";
    }
});
