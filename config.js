import * as firebase from 'firebase';
require('@firebase/firestore');
var firebaseConfig = {
        apiKey: "AIzaSyAVLInk6RKBhi730mWRMnOF3jxc5qD068k",
        authDomain: "wireless-library-79cef.firebaseapp.com",
        databaseURL: "https://wireless-library-79cef.firebaseio.com",
        projectId: "wireless-library-79cef",
        storageBucket: "wireless-library-79cef.appspot.com",
        messagingSenderId: "831730083079",
        appId: "1:831730083079:web:40c436d386adff906a11a2",
        measurementId: "G-SRJDTLFGKM"
      };
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
    export default firebase.firestore();