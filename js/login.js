// 📦 1. Firebase Modules Import & Config Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// 🛠️ FIX: signInWithEmailAndPassword को यहाँ इंपोर्ट किया गया है
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configurations
const firebaseConfig = {
    apiKey: "AIzaSyBAy6sL_E8zNlUUw-y_Pi7HwIQTD6OPKNw",
    authDomain: "live-4e3a1.firebaseapp.com",
    projectId: "live-4e3a1",
    storageBucket: "live-4e3a1.firebasestorage.app",
    messagingSenderId: "86608024691",
    appId: "1:86608024691:web:1ce9c6dfb408aeeb4d0606"
};

// Firebase Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

const submit = document.getElementById('submit');

if (submit) {
  submit.addEventListener('click', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim(); // trim() खाली स्पेस हटाएगा
    const password = document.getElementById('password').value; 
    
    if (!email || !password) {
        alert("कृपया ईमेल और पासवर्ड दोनों दर्ज करें!");
        return;
    }

    alert("Logging In...");

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        alert("Welcome Back!");
        window.location.href = "index.html";
      }) 
      .catch((error) => {
        const errorCode = error.code;
        let errorMessage = error.message;
        
        // यूजर के अनुकूल एरर मैसेज दिखाने के लिए
        if (errorCode === 'auth/invalid-credential') {
            errorMessage = "ग़लत ईमेल या पासवर्ड! कृपया दोबारा जाँचें।";
        } else if (errorCode === 'auth/invalid-email') {
            errorMessage = "कृपया एक सही ईमेल एड्रेस डालें।";
        } else if (errorCode === 'auth/user-not-found') {
            errorMessage = "इस ईमेल से कोई अकाउंट नहीं मिला।";
        } else if (errorCode === 'auth/wrong-password') {
            errorMessage = "पासवर्ड ग़लत है।";
        }
        
        alert(errorMessage);
        console.error("Login Error Details:", error);
      });
  });
}
