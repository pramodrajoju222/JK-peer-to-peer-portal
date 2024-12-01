import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js"; 
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js"; 
import { getFirestore, getDoc, doc, collection, addDoc, getDocs, query, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"; 
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js"; 

const firebaseConfig = { 
apiKey: "AIzaSyB7nZmhTBUl44ITv6Nrsc2XJ13DGZkjVxg", 
authDomain: "jk-project-d9b42.firebaseapp.com", 
projectId: "jk-project-d9b42", 
storageBucket: "jk-project-d9b42.appspot.com", 
messagingSenderId: "519055485322", 
appId: "1:519055485322:web:ab75831e9561947e82c073" 
}; 

const app = initializeApp(firebaseConfig); 
const storage = getStorage(app); 
const user_id = document.getElementById("user_id"); 
const upload_doc = document.getElementById("upload_doc"); 
const container = document.getElementById("container"); 
const db = getFirestore(app); 
const userCollection = collection(db, 'Documents'); 

getDocumentsFromDb(); 

function showToast(message) {
const toast = document.createElement('div');
toast.className = 'toast';
toast.innerText = message;
toast.style.position = 'fixed';
toast.style.top = '20px'; // Display at the top
toast.style.right = '20px';
toast.style.backgroundColor = '#333';
toast.style.color = '#fff';
toast.style.padding = '10px 20px';
toast.style.borderRadius = '5px';
toast.style.zIndex = '1000';

document.body.appendChild(toast);

setTimeout(() => {
    document.body.removeChild(toast);
}, 3000);
}

async function getDocumentsFromDb() { 
const loggedInUserId = localStorage.getItem('loggedInUserId'); 
const q = query(userCollection, where("userId", "==", loggedInUserId)); 
const querySnapshot = await getDocs(q); 
container.innerHTML = ''; 

querySnapshot.forEach((doc) => { 
    const data = doc.data(); 
    let element; 
    
    if (data.category === 'image') { 
        element = `<div id="${doc.id}"> <img src="${data.url}" alt="Image" style="max-width: 100px;"> <button onclick="editDocument('${doc.id}')">Edit</button> </div>`; 
    } else if (data.category === 'video') { 
        element = `<div id="${doc.id}"> <video controls style="max-width: 100px;"> <source src="${data.url}" type="video/mp4"> Your browser does not support the video tag. </video> <button onclick="editDocument('${doc.id}')">Edit</button> </div>`; 
    } else if (data.category === 'document') { 
        element = `<div id="${doc.id}"> <a href="${data.url}" target="_blank">Download Document</a> <button onclick="editDocument('${doc.id}')">Edit</button> </div>`; 
    } else if (data.category === 'pdf') { 
        element = `<div id="${doc.id}"> <a href="${data.url}" target="_blank">View PDF</a> <button onclick="editDocument('${doc.id}')">Edit</button> </div>`; 
    } else if (data.category === 'excel') { 
        element = `<div id="${doc.id}"> <a href="${data.url}" target="_blank">Download Excel File</a> <button onclick="editDocument('${doc.id}')">Edit</button> </div>`; 
    } else if (data.category === 'word') { 
        element = `<div id="${doc.id}"> <a href="${data.url}" target="_blank">Download Word Document</a> <button onclick="editDocument('${doc.id}')">Edit</button> </div>`; 
    } 
    
    container.innerHTML += element; // Append the element to container 
}); 
}

// Upload Document Functionality
upload_doc.addEventListener("click", () => { 
const userStorageRef = ref(storage, user_id.files[0].name); 

if (user_id.files.length === 0) {
    showToast("No file selected for upload.");
    return;
}

upload_doc.disabled = true; 

uploadBytes(userStorageRef, user_id.files[0]) 
    .then((snapshot) => { 
        showToast('Uploaded a blob or file!'); // Toast notification
        return getDownloadURL(ref(userStorageRef)); 
    }) 
    .then((url) => { 
        const loggedInUserId = localStorage.getItem('loggedInUserId'); 
        const fileType = user_id.files[0].type; 
        let category; 

        if (fileType.startsWith('image/')) { category = 'image'; } 
        else if (fileType.startsWith('video/')) { category = 'video'; }  
        else if (fileType === 'application/pdf') { category = 'pdf'; }  
        else if (fileType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || fileType.startsWith('application/msword')) { category = 'word'; }  
        else if (fileType.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) { category = 'excel'; }  
        else { category = 'document'; }

        return addDoc(userCollection, { url, category, userId: loggedInUserId });  
    })  
    .then(() => {  
        showToast("Document uploaded to database"); // Toast notification
        upload_doc.disabled = false;  
        getDocumentsFromDb(); // Refresh displayed documents  
    })  
    .catch((error) => {  
        showToast(`Error: ${error.message}`); // Toast notification
        upload_doc.disabled = false;  
    });  
});  

function editDocument(docId) {  
const docRef = doc(db, "Documents", docId);  
getDoc(docRef).then((docSnap) => {  
    if (docSnap.exists()) {  
        const data = docSnap.data();  
        document.getElementById("editUrl").value = data.url;  
        document.getElementById("editCategory").value = data.category;  
        document.getElementById("editModal").style.display = "flex";  

        document.getElementById("updateButton").onclick = function () { updateDocument(docRef); };  
    }  
}).catch((error) => {  
    showToast(`Error getting document: ${error.message}`); // Toast notification
});  
}  

function updateDocument(docRef) {  
const updatedUrl = document.getElementById("editUrl").value;  
const updatedCategory = document.getElementById("editCategory").value;  

updateDoc(docRef, { url: updatedUrl, category: updatedCategory })  
    .then(() => {  
        showToast("Document successfully updated!"); // Toast notification
        document.getElementById("editModal").style.display = "none";  
        getDocumentsFromDb(); // Refresh displayed documents  
    })  
    .catch((error) => {  
        showToast(`Error updating document: ${error.message}`); // Toast notification
    });  
}  


const uploadButtons = [
document.getElementById('upload_doc'),
document.getElementById('upload_doc1'),
document.getElementById('upload_doc2'),
document.getElementById('upload_doc3'),
document.getElementById('upload_doc4')

];

const fileInputs = [
document.getElementById('user_id'),
document.getElementById('user_id1'),
document.getElementById('user_id2'),
document.getElementById('user_id3'),
document.getElementById('user_id4')
];

const titleInputs = [
document.getElementById('doc1_title'),
document.getElementById('doc2_title'),
document.getElementById('doc3_title'),
document.getElementById('doc4_title'),
document.getElementById('doc5_title')

];

uploadButtons.forEach((button, index) => {
button.addEventListener("click", () => {
    const fileInput = fileInputs[index];
    const titleInput = titleInputs[index];

    if (fileInput.files.length === 0) {
        console.error("No file selected for upload.");
        return;
    }

    const userStorageRef = ref(storage, fileInput.files[0].name);

    button.disabled = true;
    uploadBytes(userStorageRef, fileInput.files[0])
        .then((snapshot) => {
            console.log('Uploaded a blob or file!');
            return getDownloadURL(ref(userStorageRef));
        })
        .then((url) => {
            const loggedInUserId = localStorage.getItem('loggedInUserId');
            const fileType = fileInput.files[0].type;
            let category;

            // Determine category based on file type
            if (fileType.startsWith('image/')) {
                category = 'image';
            } else if (fileType.startsWith('video/')) {
                category = 'video';
            } else if (fileType === 'application/pdf') {
                category = 'pdf';
            } else if (fileType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
                fileType.startsWith('application/msword')) {
                category = 'word';
            } else if (fileType.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
                category = 'excel';
            } else {
                category = 'document'; // Default for other types
            }

            // Save the title along with the URL and category
            return addDoc(userCollection, {
                url,
                category,
                userId: loggedInUserId,
                title: titleInput.value // Save the title from the text input
            });
        })
        .then(() => {
            console.log("Document uploaded to database");
            button.disabled = false;
            getDocumentsFromDb(); // Refresh displayed documents
        })
        .catch((error) => {
            console.error(error);
            button.disabled = false;
        });
});
});

const auth = getAuth(); 

onAuthStateChanged(auth, (user) => {  
if (user) {  
    const loggedInUserId = localStorage.getItem('loggedInUserId');  
    const docRef = doc(db, "users", loggedInUserId);  

    getDoc(docRef).then((docSnap) => {  
        if (docSnap.exists()) {  
            const userData = docSnap.data();   
            document.getElementById('loggedUserFName').innerText = userData.firstName;   
            document.getElementById('loggedUserEmail').innerText = userData.email;   
            document.getElementById('loggedUserLName').innerText = userData.lastName;   
        } else {
            showToast("No document found matching id"); // Toast notification
        }   
    }).catch((error) => {
        showToast(`Error getting document: ${error.message}`); // Toast notification
    });   
    
} else {
    showToast("User Id not Found in Local storage"); // Toast notification
}   
});  

const logoutButton = document.getElementById('logout'); 

logoutButton.addEventListener('click', () => {
localStorage.removeItem('loggedInUserId'); 

signOut(auth).then(() => {
    window.location.href='index.html';   
}).catch((error) => {
    showToast(`Error Signing out: ${error.message}`); // Toast notification
});   
});
