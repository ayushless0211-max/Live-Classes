// 📦 1. Firebase Modules Import & Config Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// 🛠️ FIX: createUserWithEmailAndPassword को यहाँ टॉप पर इंपोर्ट कर लिया है
import { 
    getAuth, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc 
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
    
    const email = document.getElementById('email').value.trim(); // extra spaces हटाने के लिए
    const password = document.getElementById('password').value; 
    
    // बेसिक वैलिडेशन ताकि खाली इनपुट फ़ायरबेस तक न जाए
    if (!email || !password) {
        alert("कृपया ईमेल और पासवर्ड दोनों भरें!");
        return;
    }
    
    if (password.length < 6) {
        alert("पासवर्ड कम से कम 6 अक्षरों का होना चाहिए!");
        return;
    }
    
    alert("Creating Account...");

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // सफलतापूर्वक अकाउंट बन गया
        const user = userCredential.user;
        alert("Account Successfully Ban Gaya!");
        window.location.href = "index.html";
      })
      .catch((error) => {
        const errorCode = error.code;
        let errorMessage = error.message;
        
        // यूज़र-फ्रेंडली एरर मैसेजेस फिक्स
        if (errorCode === 'auth/email-already-in-use') {
            errorMessage = "यह ईमेल आईडी पहले से रजिस्टर्ड है!";
        } else if (errorCode === 'auth/invalid-email') {
            errorMessage = "कृपया एक सही फॉर्मेट में ईमेल डालें।";
        } else if (errorCode === 'auth/weak-password') {
            errorMessage = "पासवर्ड बहुत कमज़ोर है, कृपया मजबूत पासवर्ड रखें।";
        }
        
        alert(errorMessage);
        console.error("Signup Error Details:", error);
      });
  });
}
