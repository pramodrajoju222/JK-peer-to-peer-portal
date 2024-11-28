// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

// Function to show messages
function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

// Sign-in functionality for admin
const signInAdmin = document.getElementById('submitSignInadimin');

signInAdmin.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            showMessage('Login is successful', 'signInMessage');
            const user = userCredential.user;
            localStorage.setItem('loggedInUserId', user.uid);
            window.location.href = 'admin_homepage.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === 'auth/invalid-credential') {
                showMessage('Incorrect Email or Password', 'signInMessage');
            } else {
                showMessage('Account does not Exist', 'signInMessage');
            }
        });
});

// Function to fetch users from Firestore and display them in a table
async function fetchUsers() {
    const usersCollection = collection(db, 'users'); // Adjust path as necessary
    const userSnapshot = await getDocs(usersCollection);
    const userBody = document.getElementById('userBody');
    
    userBody.innerHTML = ''; // Clear existing data

    userSnapshot.forEach(doc => {
        const userData = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="user-detail.html?uid=${doc.id}">${userData.name}</a></td>
            <td>${userData.email}</td>
        `;
        userBody.appendChild(row);
    });
}

// Call fetchUsers on page load
window.onload = fetchUsers;

	
// Function to get documents for a specific user based on their ID
async function getDocumentsFromDb(userId) {
    const container = document.getElementById('uploadedFilesContainer'); // Ensure this element exists in your HTML
    const q = query(collection(db, 'userFiles'), where("userId", "==", userId)); // Adjust collection name as necessary
    const querySnapshot = await getDocs(q);
    container.innerHTML = ''; // Clear previous files
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        let element;
        // Determine the file type and create appropriate HTML
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
        } else if (data.category === 'document') {
            element = `<div id="${doc.id}">
                        <a href="${data.url}" target="_blank">Download Document</a>
                        <button onclick="editDocument('${doc.id}')">Edit</button>
                       </div>`;
        } else if (data.category === 'pdf') {
            element = `<div id="${doc.id}">
                        <a href="${data.url}" target="_blank">View PDF</a>
                        <button onclick="editDocument('${doc.id}')">Edit</button>
                       </div>`;
        } else if (data.category === 'excel') {
            element = `<div id="${doc.id}">
                        <a href="${data.url}" target="_blank">Download Excel File</a>
                        <button onclick="editDocument('${doc.id}')">Edit</button>
                       </div>`;
        } else if (data.category === 'word') {
            element = `<div id="${doc.id}">
                        <a href="${data.url}" target="_blank">Download Word Document</a>
                        <button onclick="editDocument('${doc.id}')">Edit</button>
                       </div>`;
        }
        container.innerHTML += element; // Append the element to container
    });
}
// Call this function when navigating to the user detail page
async function fetchUserDetails() {
    const uid = getQueryParam('uid');
    
    // Fetch user details and display them here...
    
    // After displaying user details, fetch their documents:
    await getDocumentsFromDb(uid);
}