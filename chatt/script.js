 // Import Firebase functions
 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
 import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
 import { getDatabase, ref, set, push, onChildAdded, get, orderByChild } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
 
 // Firebase configuration
 const firebaseConfig = {
   apiKey: "AIzaSyDVO3nVcTZ4Ht8L-Zq_lnuJHuIsWuHkR2U",
   authDomain: "data-6163e.firebaseapp.com",
   projectId: "data-6163e",
   storageBucket: "data-6163e.appspot.com",
   messagingSenderId: "269366310063",
   appId: "1:269366310063:web:5b5e043f83421a5471905a"
 };
 
 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const auth = getAuth();
 const database = getDatabase(app, 'https://data-6163e-default-rtdb.europe-west1.firebasedatabase.app'); // Correct URL for your region
 
 // DOM elements
 const loginForm = document.getElementById("loginForm");
 const signupForm = document.getElementById("signupForm");
 const chatForm = document.getElementById("chatForm");
 const emailInput = document.getElementById("email");
 const passwordInput = document.getElementById("password");
 const signupEmailInput = document.getElementById("signupEmail");
 const signupPasswordInput = document.getElementById("signupPassword");
 const signupUsernameInput = document.getElementById("signupUsername");
 const messageInput = document.getElementById("message");
 const messagesList = document.getElementById("messages");
 const usernameSpan = document.getElementById("username");
 const logoutButton = document.getElementById("logoutButton");
 const loginButton = document.getElementById("loginButton");
 const signupButton = document.getElementById("signupButton");
 const showSignupFormButton = document.getElementById("showSignupFormButton");
 const showLoginFormButton = document.getElementById("showLoginFormButton");
 
 // Show the signup form
 showSignupFormButton.addEventListener("click", () => {
   loginForm.style.display = "none";
   signupForm.style.display = "block";
 });
 
 // Show the login form
 showLoginFormButton.addEventListener("click", () => {
   signupForm.style.display = "none";
   loginForm.style.display = "block";
 });
 
 // Sign-up function with username
 signupButton.addEventListener("click", (e) => {
   e.preventDefault();
 
   const email = signupEmailInput.value;
   const password = signupPasswordInput.value;
   const username = signupUsernameInput.value; // Kullanıcı adı
 
   createUserWithEmailAndPassword(auth, email, password)
     .then((userCredential) => {
       // User signed up
       const user = userCredential.user;
 
       // Kullanıcı adı ve email verisini Firebase Realtime Database'e kaydedelim
       const userRef = ref(database, 'users/' + user.uid); // 'users' altında kullanıcı verisi
       set(userRef, {
         username: username,
         email: email
       }).then(() => {
         alert("Sign up successful!");
         loginForm.style.display = "block";
         signupForm.style.display = "none";
       }).catch((error) => {
         console.error("Error saving username:", error);
         alert("Error saving username.");
       });
     })
     .catch((error) => {
       console.error("Error signing up:", error);
       alert("Sign up failed. Please try again.");
     });
 });
 
 // Sign-in function
 loginButton.addEventListener("click", (e) => {
   e.preventDefault();
 
   const email = emailInput.value;
   const password = passwordInput.value;
 
   signInWithEmailAndPassword(auth, email, password)
     .then((userCredential) => {
       // User logged in
       const user = userCredential.user;
 
       // Kullanıcı adını Firebase'den alalım
       const userRef = ref(database, 'users/' + user.uid);
       get(userRef).then((snapshot) => {
         const userData = snapshot.val();
         usernameSpan.innerText = userData.username || user.email; // Kullanıcı adı veya email
 
         // Chat ekranına yönlendirelim
         loginForm.style.display = "none"; // Login formu gizleniyor
         signupForm.style.display = "none"; // Signup formu da gizleniyor
         chatForm.style.display = "block"; // Chat formu gösteriliyor
       }).catch((error) => {
         console.error("Error fetching user data:", error);
       });
     })
     .catch((error) => {
       console.error("Error logging in:", error);
       alert("Login failed. Please check your credentials.");
     });
 });
 
 // Listen for changes in authentication state
 onAuthStateChanged(auth, (user) => {
   if (user) {
     // If user is logged in, show chat form
     const userRef = ref(database, 'users/' + user.uid);
     get(userRef).then((snapshot) => {
       const userData = snapshot.val();
       usernameSpan.innerText = userData.username || user.email; // Kullanıcı adı veya email
     });
 
     loginForm.style.display = "none"; // Giriş formu gizleniyor
     signupForm.style.display = "none"; // Kayıt formu gizleniyor
     chatForm.style.display = "block"; // Sohbet formu gösteriliyor
   } else {
     // If user is logged out, show login form
     loginForm.style.display = "block";
     signupForm.style.display = "none";
     chatForm.style.display = "none";
   }
 });
 
 // Send a message
 function sendMessage(e) {
   e.preventDefault();
 
   const message = messageInput.value;
   const user = auth.currentUser;
 
   if (message && user) {
     const messagesRef = ref(database, 'messages');
     const timestamp = new Date().toLocaleTimeString(); // Saat bilgisi
     push(messagesRef, {
       sender: user.displayName || user.email,
       message: message,
       time: timestamp // Saat bilgisi ekleniyor
     }).then(() => {
       // Clear message input
       messageInput.value = "";
     });
   }
 }
 
 // Listen for new messages and display them in reverse order (most recent first)
 onChildAdded(ref(database, 'messages'), (data) => {
   const messageData = data.val();
   const messageElement = document.createElement("li");
 
   // Format the message with sender and timestamp
   messageElement.innerHTML = `<strong>${messageData.sender}</strong>: ${messageData.message} <span style="font-size: 0.8em; color: #bbb;">(${messageData.time})</span>`;
   messagesList.insertBefore(messageElement, messagesList.firstChild); // Add new message at the top
 });
 
 // Add event listener to send message on form submit
 document.getElementById("messageForm").addEventListener("submit", sendMessage);
 // Logout function
 logoutButton.addEventListener("click", () => {
   signOut(auth)
     .then(() => {
       // Sign-out successful
       alert("You have logged out.");
       loginForm.style.display = "block";  // Login formu tekrar gösterilsin
       signupForm.style.display = "none"; // Signup formu gizlensin
       chatForm.style.display = "none";   // Chat formu gizlensin
     })
     .catch((error) => {
       console.error("Error signing out:", error);
       alert("Logout failed. Please try again.");
     });
 });
 