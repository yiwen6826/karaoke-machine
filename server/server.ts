import express, { Express } from "express";
import cors from "cors";
import { SONG_LIBRARY } from "./constants/song-library";
import { db } from './firebase';

const app: Express = express();
const port = 8080;

app.use(cors());
app.use(express.json());

type queueEntry = {
  qid: number, // date at which entry was added to queue (to differentiate same song added multiple times)
  songId: string,
  url: string,
  priority: number // starts at 0, corresponds to idx in queue
};

const getFirestoreQueue = async () => {
  const snapshot = await db.collection("queue").get();
  return snapshot.docs.map(doc => ({qid: 0, ... doc.data()}));
}

// GET
// send sorted queue of each user (min priority queue i.e. lowest priority first)
// needed for updating gui
app.get("/api/queue/:uid", async (req, res) => {
  const {uid} = req.params;
  const snapshot = await db.collection("queue").where("userId", "==", uid).orderBy("priority", "asc").get();
  const queue: queueEntry[] = snapshot.docs.map(doc => doc.data() as queueEntry);
  res.json(queue);
})

// search queue
app.get("/api/search", async (req, res) => {
  const query = (req.query.q as string)?.toLowerCase();

  if (!query) {res.json([]); return;} // no query

  const matches = SONG_LIBRARY.filter(song => song.id.toLowerCase().includes(query));
  res.json(matches);
})

// POST
// add song to queue
// If successful, returns status 201 and json of qEntry
// Otherwise, returns status 404
app.post("/api/queue", async (req, res) => {
  const {songId, uid} = req.body;
  const song = SONG_LIBRARY.find(s => s.id === songId);
  if (!uid) return res.status(400).send("No user provided");
  if (!song) return res.status(404).send("Song not found");

  const snapshot = await db.collection("queue").where("userId", "==", uid).get();

  const qEntry = {
    qid: Date.now(),
    songId: song.id,
    url: song.video_url,
    priority: snapshot.size, 
    userId: uid,
  }

  await db.collection("queue").add(qEntry);
  return res.status(201).json(qEntry);
})

// PUT
// decrement song priority in queue (i.e. move it upward)
// If successful, returns status 201.
// Otherwise, returns status 404 if song not found; returns status 405 if song is first in queue and cannot change priority.
app.put("/api/queue/:id/:uid", async (req, res) => {
  const qidToBoost = parseInt(req.params.id);
  const {uid} = req.params;

  if (!uid || uid === "undefined") {
    return res.status(400).send("Invalid User ID");
  }

  const snapshot = await db.collection("queue").where("qid", "==", qidToBoost).where("userId", "==", uid).get();
  
  if (snapshot.empty) return res.status(404).send("Song not found in queue");
  
  const doc = snapshot.docs[0];
  const currentData = doc.data() as queueEntry;

  const prevEntrySnapshot = await db.collection("queue")
    .where("userId", "==", uid)
    .where("priority", "<", currentData.priority)
    .orderBy("priority", "asc")
    .limit(1)
    .get();

  if (prevEntrySnapshot.empty) return res.status(405).send("Cannot boost priority further");

  const prevDoc = prevEntrySnapshot.docs[0];
  const prevData = prevDoc.data() as queueEntry;

  const batch = db.batch();
  batch.update(doc.ref, { priority: prevData.priority });
  batch.update(prevDoc.ref, { priority: currentData.priority });
  await batch.commit();

  return res.sendStatus(201);
})

// DELETE
// remove song from queue
// Returns status 204
app.delete("/api/queue/:id/:uid", async (req, res) => {
  const {id, uid} = req.params;

  if (!uid || uid === "undefined") {
    return res.status(400).send("Invalid User ID");
  }
  const qidToDelete = parseInt(id);
  const snapshot = await db.collection("queue")
    .where("qid", "==", qidToDelete)
    .where("userId", "==", uid)
    .get();

  if (snapshot.empty) {
    return res.status(404).send("Entry not found");
  }
  await snapshot.docs[0].ref.delete();
  return res.sendStatus(204);
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
