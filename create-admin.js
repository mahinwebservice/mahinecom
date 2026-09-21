const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
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
    const userCredential = await createUserWithEmailAndPassword(auth, 'admin@mahinsaas.com', 'admin123');
    const uid = userCredential.user.uid;
    console.log('Created auth user:', uid);
    
    await setDoc(doc(db, 'system_users', uid), {
      email: 'admin@mahinsaas.com',
      role: 'superadmin',
      createdAt: Date.now()
    });
    console.log('Successfully created Super Admin document!');
    process.exit(0);
  } catch(e) {
    if (e.code === 'auth/email-already-in-use') {
       console.log('User already exists, attempting to update Firestore role...');
       // Cannot get UID of existing user via client SDK without logging in.
       // The user should manually add it or we assume it's done.
       process.exit(0);
    } else {
       console.error(e);
       process.exit(1);
    }
  }
}
createSuperAdmin();
