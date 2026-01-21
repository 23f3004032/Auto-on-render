// This script initializes Firestore with default credentials
// Run this once: node scripts/initFirestore.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCxzFjQgFHSJuFQASlY6RAM0IQFTwgIgtU",
  authDomain: "auto-on-render.firebaseapp.com",
  projectId: "auto-on-render",
  storageBucket: "auto-on-render.firebasestorage.app",
  messagingSenderId: "366748385131",
  appId: "1:366748385131:web:f4299712a32da7c874d62e",
  measurementId: "G-S2K83MT8SG"
};

async function initializeCredentials() {
  try {
    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Setting default credentials in Firestore...');
    const authDocRef = doc(db, 'auth', 'credentials');
    
    await setDoc(authDocRef, {
      passcode: '123456',
      masterCode: 'BABURAOMARINE1904',
      lastUpdated: new Date().toISOString(),
    });

    console.log('✅ Successfully initialized Firestore with default credentials!');
    console.log('   Login Password: 123456');
    console.log('   Master Key: BABURAOMARINE1904');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    process.exit(1);
  }
}

initializeCredentials();
