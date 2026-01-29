import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBw_hckI7of0UWW06mN8Win6VhOTPtfoUA",
    authDomain: "adgen-3bf04.firebaseapp.com",
    projectId: "adgen-3bf04",
    storageBucket: "adgen-3bf04.appspot.com",
    messagingSenderId: "449942355484",
    appId: "1:449942355484:web:e34af0a3a48b5cae21e9d9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
