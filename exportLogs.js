import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportLogs() {
  const snapshot = await db.collection("devpulse_commands").get();
  const logs = [];

  snapshot.forEach(doc => {
    logs.push({ id: doc.id, ...doc.data() });
  });

  fs.writeFileSync("logs.json", JSON.stringify(logs, null, 2));
  console.log("✅ Logs saved to logs.json");
}

exportLogs();
