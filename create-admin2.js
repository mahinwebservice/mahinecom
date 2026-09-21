const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyCPppgCmZSd-4zOs9u8_zaiFCrc4upHASQ',
  authDomain: 'mahinsaas.firebaseapp.com',
  projectId: 'mahinsaas',
  storageBucket: 'mahinsaas.firebasestorage.app',
  messagingSenderId: '764015095944',
  appId: '1:764015095944:web:9aa6e715988119be942f3d',
  measurementId: 'G-8XKPZN36HK'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createSuperAdmin() {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@mahinsaas.com', 'admin123');
    const uid = userCredential.user.uid;
    console.log('Logged in auth user:', uid);
    
    await setDoc(doc(db, 'system_users', uid), {
      email: 'admin@mahinsaas.com',
      role: 'superadmin',
      createdAt: Date.now()
    });
    console.log('Successfully created Super Admin document!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
createSuperAdmin();
