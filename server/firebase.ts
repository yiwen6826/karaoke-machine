import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

const serviceAccountPath = path.resolve(__dirname, './service_account.json');
const serviceAccount = require(serviceAccountPath);
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: "karaoke-machine-3a3a4",
});
const db = getFirestore();

export { db };