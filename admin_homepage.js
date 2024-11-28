import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"; // Ensure query and where are imported

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

// Elements
const userDocumentsTable = document.getElementById("userDocumentsTable");
const logoutButton = document.getElementById('logout');
const loggedUserFName = document.getElementById('loggedUserFName');
const loggedUserLName = document.getElementById('loggedUserLName');
const loggedUserEmail = document.getElementById('loggedUserEmail');

// Function to get all users and their documents
async function getAllUsersAndDocuments() {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);

    // Clear previous entries in the user documents table
    userDocumentsTable.innerHTML = `
        <tr>
            <th>User ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Text</th> 
            <th>Documents</th>
        </tr>
    `;

    // Loop through each user
   // Loop through each user
for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Fetch documents for the current user
    const documentsCollection = collection(db, 'Documents');
    const q = query(documentsCollection, where("userId", "==", userId));
    const documentsSnapshot = await getDocs(q);

    // Prepare document links and titles
    let documentLinks = '';
    let titles = []; // Initialize an array to hold all titles

    documentsSnapshot.forEach((doc) => {
        const data = doc.data();
        titles.push(data.title); // Collect all titles
        documentLinks += `<a href="${data.url}" target="_blank">${data.category.charAt(0).toUpperCase() + data.category.slice(1)}</a><br>`;
    });

    // Join all titles into a single string
    const allTitles = titles.join(', ') || 'No Titles'; // Join with a comma or show 'No Titles'

    // Append a new row for each user with their documents
    userDocumentsTable.innerHTML += `
        <tr>
            <td>${userId}</td>
            <td>${userData.firstName || 'N/A'}</td>
            <td>${userData.lastName || 'N/A'}</td>
            <td>${userData.email || 'N/A'}</td>
            <td>${allTitles}</td> <!-- Display all titles here -->
            <td>${documentLinks || 'No Documents'}</td>
        </tr>
    `;
}
}

// Authentication state change listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        
        // Populate the dropdown with user's name and email
        if (user.displayName) {
            const names = user.displayName.split(' ');
            loggedUserFName.innerText = userData.firstName[0] || 'First Name'; // Get first name
            loggedUserLName.innerText = userData.lastName[1] || 'Last Name'; // Get last name
        } else {
            // Fallback if displayName is not set
            loggedUserFName.innerText = 'First Name'; // Default value
            loggedUserLName.innerText = 'Last Name'; // Default value
        }

        loggedUserEmail.innerText = user.email || 'No Email Available';

        // Fetch all users and their documents when a user is authenticated
        getAllUsersAndDocuments();
    } else {
        console.log("No user is signed in.");
    }
});

// Logout functionality
logoutButton.addEventListener('click', () => {
    signOut(auth)
       .then(() => {
           window.location.href = 'admin_index.html';
       })
       .catch((error) => {
        toastr.error("Error Signing out:");

           console.error('Error Signing out:', error);
       });
});