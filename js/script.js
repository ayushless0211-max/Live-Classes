// 📦 1. Firebase Modules Import & Config Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your brand new live simulator project cluster nodes
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

// 🌐 AUTOMATED COLLECTION ROUTER 
const registeredCollections = ["jjk-products", "naruto-products", "demonslayer-products"]; 

// 🌐 Dynamic Instant Preloader Container
(function createGlobalLoader() {
    const globalLoader = document.createElement('div');
    globalLoader.id = 'globalStoreLoader';
    globalLoader.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #ffffff; z-index: 99999; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 15px; transition: opacity 0.3s ease, visibility 0.3s ease;";
    globalLoader.innerHTML = `
        <img style="width: 200px; height: 200px; object-fit: cover;" src="giphy.gif" alt="loading image"/>
        <p style="font-family: sans-serif; color: #475569; font-size: 18px; font-weight: 500; margin: 0;">
            Loading your dream store...
        </p>
    `;
    document.body.insertBefore(globalLoader, document.body.firstChild);
})();

// Helper: Shuffle Array Algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[array[j]]] = [array[array[j]], array[i]];
    }
    return array;
}

// 🎨 STORE.JS CARD GRID LAYOUT ENGINE
function createProductCardHTML(product, collectionName) {
    const currentImg = product.img || product.image || '';
    const currentTitle = product.title || product.name || 'Untitled Product';
    const priceStr = product.price ? product.price.toString() : "999";
    
    return `
        <div class="card">
            <a href="product-detail.html?id=${product.id || ''}&cat=${collectionName}" class="card-link-wrapper">
                <img src="${currentImg}" alt="${currentTitle}">
                <p class="description">${currentTitle}</p>
            </a>
            <button class="addToCart" 
                    data-id="${product.id || ''}" 
                    data-price="${priceStr}" 
                    data-category="${collectionName}">
                <i class="fa-solid fa-cart-shopping"></i>Add to cart
            </button>
        </div>
    `;
}

// --- 📥 GLOBAL FIREBASE DATA FETCH ENGINES ---

async function loadDynamicBanners() {
    const track = document.getElementById("carouselTrack");
    const dotsContainer = document.getElementById("carouselDots");
    if (!track) return;

    try {
        const querySnapshot = await getDocs(collection(db, "carousel_banners"));
        let bannerHTML = "";
        let dotsHTML = "";
        let count = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            bannerHTML += `
                <div class="carousel-slide ${count === 0 ? 'active' : ''}">
                    <img src="${data.image}" alt="Banner ${count + 1}">
                    <div class="banner-overlay-text">${data.title || 'Epic Update! ✨'}</div>
                </div>
            `;
            dotsHTML += `<span class="dot ${count === 0 ? 'active' : ''}"></span>`;
            count++;
        });

        if (count > 0) {
            track.innerHTML = bannerHTML;
            if (dotsContainer) dotsContainer.innerHTML = dotsHTML;
        }
    } catch (error) {
        console.error("Banners load karne me error: ", error);
    }
}

async function loadTrendingProducts() {
    const container = document.getElementById("trendingProductsContainer");
    if (!container) return;

    try {
        let allProducts = [];

        const fetchPromises = registeredCollections.map(async (colName) => {
            try {
                const querySnapshot = await getDocs(collection(db, colName));
                querySnapshot.forEach((doc) => {
                    allProducts.push({ id: doc.id, originCollection: colName, ...doc.data() });
                });
            } catch (err) {
                console.warn(`Collection ${colName} load nahi ho payi, skipping...`, err);
            }
        });

        await Promise.all(fetchPromises);

        if (allProducts.length === 0) {
            container.innerHTML = `<p class="loading-placeholder">No active items found in anime databases.</p>`;
            return;
        }

        const randomProducts = shuffleArray(allProducts);
        const homepageDisplayList = randomProducts.slice(0, 6);
        
        container.innerHTML = homepageDisplayList.map(prod => 
            createProductCardHTML(prod, prod.originCollection)
        ).join('');
        
    } catch (error) {
        console.error("Error pooling multi-collection drops: ", error);
        container.innerHTML = `<p class="loading-placeholder" style="color: red;">Failed to load hot drops.</p>`;
    }
}

async function loadRecentlyViewed() {
    const container = document.getElementById("recentProductsContainer");
    if (!container) return;

    const recentItems = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    if (recentItems.length === 0) {
        container.innerHTML = `<p class="loading-placeholder">Items you checked out recently will appear here.</p>`;
        return;
    }

    try {
        let htmlContent = "";
        
        for (let item of recentItems) {
            let targetId = null;
            let targetCat = null;

            if (typeof item === 'object' && item !== null) {
                targetId = item.id;
                targetCat = item.cat;
            } else {
                targetId = item; 
            }

            if (!targetId) continue;

            if (!targetCat) {
                for (const col of registeredCollections) {
                    const checkDoc = await getDoc(doc(db, col, targetId));
                    if (checkDoc.exists()) {
                        targetCat = col;
                        break;
                    }
                }
            }

            if (targetCat) {
                try {
                    const docSnap = await getDoc(doc(db, targetCat, targetId));
                    if (docSnap.exists()) {
                        htmlContent += createProductCardHTML({ id: docSnap.id, ...docSnap.data() }, targetCat);
                    }
                } catch (fetchErr) {
                    console.error(`Error querying id ${targetId} inside ${targetCat}:`, fetchErr);
                }
            }
        }
        
        container.innerHTML = htmlContent || `<p class="loading-placeholder">No recent items found.</p>`;
    } catch (error) {
        console.error("Error restoring recent views: ", error);
        container.innerHTML = `<p class="loading-placeholder">Failed to pull recent history.</p>`;
    }
}

async function loadLiveAnimeNews() {
    const newsTrack = document.getElementById("newsTrack");
    if (!newsTrack) return;

    const annRssUrl = "https://www.animenewsnetwork.com/news/rss.xml";
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(annRssUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items.length > 0) {
            let newsHTML = "";
            const latestNews = data.items.slice(0, 7);

            latestNews.forEach(item => {
                const escapedLink = item.link.replace(/'/g, "\\'");
                newsHTML += `
                    <div class="news-item" onclick="window.open('${escapedLink}', '_blank')" style="cursor: pointer;">
                        🔥 ${item.title}
                    </div>
                `;
            });
            newsTrack.innerHTML = newsHTML;
        } else {
            newsTrack.innerHTML = `<div class="news-item">Failed to parse updates. Check back later!</div>`;
        }
    } catch (error) {
        console.error("ANN news error: ", error);
        newsTrack.innerHTML = `<div class="news-item">Unable to sync live news flash.</div>`;
    }
}

// 🏗 DOM Event Handler Sync Hub
document.addEventListener("DOMContentLoaded", async () => {
    await loadDynamicBanners();
    await loadTrendingProducts();
    await loadRecentlyViewed();
    await loadLiveAnimeNews();

    const loader = document.getElementById('globalStoreLoader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(() => loader.remove(), 300);
    }

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

    let currentSlideIndex = 0;
    let carouselInterval;

    function initCarousel() {
        const slides = document.querySelectorAll(".carousel-slide");
        const dots = document.querySelectorAll(".carousel-dots .dot");
        const prevBtn = document.getElementById("prevBanner");
        const nextBtn = document.getElementById("nextBanner");

        if(slides.length === 0) return;

        function showSlide(index) {
            const activeSlides = document.querySelectorAll(".carousel-slide");
            const activeDots = document.querySelectorAll(".carousel-dots .dot");
            
            if(activeSlides.length === 0) return;
            activeSlides.forEach(slide => slide.classList.remove("active"));
            if(activeDots) activeDots.forEach(dot => dot.classList.remove("active"));
            
            if (index >= activeSlides.length) currentSlideIndex = 0;
            else if (index < 0) currentSlideIndex = activeSlides.length - 1;
            else currentSlideIndex = index;
            
            activeSlides[currentSlideIndex].classList.add("active");
            if(activeDots[currentSlideIndex]) activeDots[currentSlideIndex].classList.add("active");
        }

        function handleNext() { currentSlideIndex++; showSlide(currentSlideIndex); }
        function handlePrev() { currentSlideIndex--; showSlide(currentSlideIndex); }

        if (nextBtn && prevBtn) {
            nextBtn.onclick = () => { handleNext(); resetTimer(); };
            prevBtn.onclick = () => { handlePrev(); resetTimer(); };
        }

        dots.forEach((dot, idx) => {
            dot.onclick = () => {
                currentSlideIndex = idx;
                showSlide(currentSlideIndex);
                resetTimer();
            };
        });

        function startTimer() { carouselInterval = setInterval(handleNext, 4000); }
        function resetTimer() { clearInterval(carouselInterval); startTimer(); }

        startTimer();
    }

    setTimeout(initCarousel, 500);

    // 🖥️ Real-time Synchronization Loop for Academic Classes (With Thumbnails & Auto-Expiry)
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
                
                const durationMinutes = item.durationMinutes || 120;
                const classDurationMs = durationMinutes * 60 * 1000; 
                const isExpired = rightNow > (targetTime + classDurationMs);

                if (isExpired) return;

                const isLive = rightNow >= targetTime;
                const youtubeThumbnail = item.videoId ? `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg` : 'giphy.gif';
                const videoLink = item.youtubeUrl || `https://www.youtube.com/watch?v=${item.videoId}`;

                const row = document.createElement("div");
                row.className = "dashboard-row-card academic-clickable-row";
                row.setAttribute("data-target-url", videoLink);
                row.setAttribute("data-target-title", item.subject || 'Lecture Room');
                
                if(isLive) row.style.borderLeftColor = "#ef4444";

                row.innerHTML = `
                    <div class="class-thumbnail-wrapper" style="width: 100px; height: 56px; overflow: hidden; border-radius: 4px; flex-shrink: 0; background: #e2e8f0;">
                        <img src="${youtubeThumbnail}" alt="Class Thumbnail" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="card-details" style="flex-grow: 1;">
                        <h4 style="margin: 0 0 4px 0; font-size: 15px;">${item.subject || 'Broadcast Room'}</h4>
                        <span style="font-size: 13px; color: #64748b;">Start Schedule: ${new Date(item.scheduledStartTime).toLocaleString()}</span>
                    </div>
                    <div class="card-badge ${isLive ? 'badge-live' : 'badge-waiting'}" style="flex-shrink: 0;">
                        ${isLive ? '🔴 Live Now' : 'Scheduled'}
                    </div>
                `;
                upcomingContainer.appendChild(row);
            });

            if (upcomingContainer.children.length === 0) {
                upcomingContainer.innerHTML = `<p class="loading-placeholder">No live classes running right now.</p>`;
            }
        });
    }

    // 🖥️ Real-time Synchronization Loop for Student Homework Tasking (With File Preview Thumbnails)
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
                const fileUrl = task.fileUrl || '';
                const isImageUrl = /\.(jpeg|jpg|gif|png|webp)$/i.test(fileUrl);
                const assignmentThumbnail = isImageUrl ? fileUrl : 'https://img.icons8.com/fluent/96/pdf.png';

                const row = document.createElement("div");
                row.className = "dashboard-row-card homework-clickable-row";
                row.setAttribute("data-target-file", fileUrl);
                row.style.borderLeftColor = "#d97706";

                row.innerHTML = `
                    <div class="homework-thumbnail-wrapper" style="width: 50px; height: 50px; overflow: hidden; border-radius: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #f1f5f9; padding: 5px; box-sizing: border-box;">
                        <img src="${assignmentThumbnail}" alt="Doc Preview" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                    <div class="card-details" style="flex-grow: 1;">
                        <h4 style="margin: 0 0 4px 0; font-size: 15px;">📚 ${task.title || 'Assignment Details'}</h4>
                        <span style="font-size: 13px; color: #64748b;">Target Deadline: ${task.dueDate || 'End of Week'}</span>
                    </div>
                    <div class="card-badge badge-warning" style="flex-shrink: 0;">Pending</div>
                `;
                homeworkContainer.appendChild(row);
            });
        });
    }
});

// 🛒 3. MASTER INTERACTION LISTENER (Bypasses UI Pointer-Events Locks)
document.addEventListener('click', (e) => {
    const button = e.target.closest('.addToCart');
    if (button) {
        e.preventDefault();
        const productId = button.getAttribute('data-id');
        const productPrice = button.getAttribute('data-price');
        const productCategory = button.getAttribute('data-category'); 
        
        const card = button.closest('.card');
        const titleEl = card ? card.querySelector('.description') : null;
        const title = titleEl ? titleEl.innerText : "Anime Model";
        const img = card ? card.querySelector('img').src : "";

        let cart = JSON.parse(localStorage.getItem('animeCart')) || [];
        const match = cart.find(item => item.id === productId);

        if (match) {
            match.quantity += 1;
        } else {
            cart.push({
                id: productId,
                title: title,
                img: img,
                price: productPrice,
                category: productCategory,
                quantity: 1
            });
        }
        localStorage.setItem('animeCart', JSON.stringify(cart));
        alert(`🎉 Added '${title}' smoothly to cart!`);
        return;
    }

    const academicRow = e.target.closest('.academic-clickable-row');
    if (academicRow) {
        const rawLink = academicRow.getAttribute('data-target-url');
        const titleStr = academicRow.getAttribute('data-target-title');
        const targetUrl = `player.html?url=${encodeURIComponent(rawLink)}&title=${encodeURIComponent(titleStr)}`;
        window.open(targetUrl, "_self");
        return;
    }

    const homeworkRow = e.target.closest('.homework-clickable-row');
    if (homeworkRow) {
        const fileLink = homeworkRow.getAttribute('data-target-file');
        if (fileLink && fileLink !== '#') {
            window.open(fileLink, "_blank");
        }
        return;
    }
});

// 🔐 4. AUTHENTICATION WATCHER (🛠️ FIXED: Added Missing Closing Brackets)
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
