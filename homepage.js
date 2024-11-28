import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB7nZmhTBUl44ITv6Nrsc2XJ13DGZkjVxg",
    authDomain: "jk-project-d9b42.firebaseapp.com",
    projectId: "jk-project-d9b42",
    storageBucket: "jk-project-d9b42.appspot.com",
    messagingSenderId: "519055485322",
    appId: "1:519055485322:web:ab75831e9561947e82c073"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const storage = getStorage(app);

// Elements
const container = document.getElementById("container");
const logoutButton = document.getElementById('logout');

// Function to get user documents
async function getDocumentsFromDb(userId) {
    const userCollection = collection(db, 'Documents');
    const q = query(userCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    container.innerHTML = ''; // Clear previous entries
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        let element;

        // Create appropriate HTML based on file type
        if (data.category === 'image') {
            element = `<div id="${doc.id}">
                        <img src="${data.url}" alt="Image" style="max-width: 100px;">
                        <button onclick="editDocument('${doc.id}')">Edit</button>
                       </div>`;
        } else if (data.category === 'video') {
            element = `<div id="${doc.id}">
                        <video controls style="max-width: 100px;">
                            <source src="${data.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <button onclick="editDocument('${doc.id}')">Edit</button>
                       </div>`;
        } else {
            element = `<div id="${doc.id}">
                        <a href="${data.url}" target="_blank">${data.category.charAt(0).toUpperCase() + data.category.slice(1)}</a>
                        <button onclick="editDocument('${doc.id}')">Edit</button>
                       </div>`;
        }

        container.innerHTML += element; // Append the element to container
    });
}

// Function to fetch user information
async function getUserInfo(userId) {
    const docRef = doc(db, "users", userId);
    
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            document.getElementById('loggedUserFName').innerText = userData.firstName || 'N/A';
            document.getElementById('loggedUserEmail').innerText = userData.email || 'N/A';
            document.getElementById('loggedUserLName').innerText = userData.lastName || 'N/A';
        } else {
            console.log("No document found matching id");
        }
    } catch (error) {
        console.error("Error getting document:", error);
    }
}

// Authentication state change listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        const loggedInUserId = localStorage.getItem('loggedInUserId');
        
        if (loggedInUserId) {
            // Fetch user info and documents
            getUserInfo(loggedInUserId);
            getDocumentsFromDb(loggedInUserId);
        } else {
            console.log("User ID not found in local storage.");
        }
    } else {
        console.log("No user is signed in.");
    }
});

// Logout functionality
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error Signing out:', error);
        });
});