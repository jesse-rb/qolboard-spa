    // Import the functions you need from the SDKs you need
    import { initializeApp } from "firebase/app";
    import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signOut } from "firebase/auth";
    import { store } from '../store';

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    export function emailSignInLink(email) {
        const actionCodeSettings = {
            url: import.meta.env.VITE_APP_URL,
            handleCodeInApp: true
        };
        console.log(email);
        sendSignInLinkToEmail(auth, email, actionCodeSettings)
        .then(() => {
            // The link was successfully sent. Inform the user.
            // Save the email locally so you don't need to ask the user for it again
            // if they open the link on the same device.
            window.localStorage.setItem('emailForSignIn', email);
        })
        .catch((error) => {
            console.log(error);
        });
    }

    export async function completeSignInWithEmailLink(email) {
        // Confirm the link is a sign-in with email link.
        let toReturn = {
            'err': 'No login',
            'data': null
        };

        if (isSignInWithEmailLink(auth, window.location.href)) {
            await signInWithEmailLink(auth, email, window.location.href)
            .then((result) => {                
                toReturn['err'] = null;
                toReturn['data'] = result.user;
            })
            .catch((error) => {
                toReturn['err'] = error;
            });
        }
        return toReturn
    }

    export function logout() {
        signOut(auth).then(() => {
            // Sign-out successful, update state
            store.update(s => {
                s['loggedIn'] = false;
                s['user'] = null;
                return s;
            });
            console.log('successfully logged out!');
        }).catch((error) => {
            console.log(error);
        });
    }