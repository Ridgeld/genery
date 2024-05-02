import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBBlQca3oj1efZEEjTu1XSmMHRcbGX_Hj8",
    authDomain: "genery-c83e3.firebaseapp.com",
    projectId: "genery-c83e3",
    storageBucket: "genery-c83e3.appspot.com",
    messagingSenderId: "179227356988",
    appId: "1:179227356988:web:31e0070216dbb4bf673839"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)