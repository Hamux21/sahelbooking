// src/config/firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyAPz5_KwS4hT6KoULYXIVh-W19luQy_AL8",
    authDomain: "sahelbooking.firebaseapp.com",
    projectId: "sahelbooking",
    storageBucket: "sahelbooking.appspot.com",
    messagingSenderId: "691565949961",
    appId: "1:691565949961:web:a1b59fc70d217cd638f4d8"
};

export const firebaseApp = initializeApp(firebaseConfig);