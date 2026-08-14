import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBNmRsap9D-4OHvpeluY33WA0YgnzKNxEg',
  authDomain: 'my-assistant-ecf2f.firebaseapp.com',
  projectId: 'my-assistant-ecf2f',
  storageBucket: 'my-assistant-ecf2f.firebasestorage.app',
  messagingSenderId: '927897334283',
  appId: '1:927897334283:web:fb36bac9374a169afe4d0e',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
