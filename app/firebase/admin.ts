import admin from "firebase-admin";

const serviceAccount = require("../../mwn-healthcare-firebase-adminsdk-fbsvc-d3bfff1fe4.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
