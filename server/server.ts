import express, { Express } from "express";
import cors from "cors";
import { SONG_LIBRARY } from "./constants/song-library";

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

let queue: queueEntry[] = [];

// GET
// send sorted queue (min priority queue i.e. lowest priority first)
// needed for updating gui
app.get("/api/queue", (req, res) => {
  const sortedQueue = [...queue].sort((a, b) => a.priority - b.priority);
  res.json(sortedQueue);
})

// search queue
app.get("/api/search", (req, res) => {
  const query = (req.query.q as string)?.toLowerCase();

  if (!query) {res.json([]); return;} // no query

  const matches = SONG_LIBRARY.filter(song => song.id.toLowerCase().includes(query));
  res.json(matches);
})

// POST
// add song to queue
// If successful, returns status 201 and json of qEntry
// Otherwise, returns status 404
app.post("/api/queue", (req, res) => {
  const {songId} = req.body;
  const song = SONG_LIBRARY.find(s => s.id === songId);
  if (!song) return res.status(404).send("Song not found");

  const qEntry = {
    qid: Date.now(),
    songId: song.id,
    url: song.video_url,
    priority: queue.length, 
  }

  queue.push(qEntry);
  return res.status(201).json(qEntry);
})

// POST with API key
// app.post("/api/", (req, res) => {
//   try {
//     const body = req.body;
//     const key = body.key;
//     if (!key) {
//       throw new Error("Key not found");
//     }

//     console.log(key);

//     res.json({message: `Hello! Your key was ${key}`});
//   } catch (e: any) {
//     res.status(404).json({error: e.message});
//   }
// })

// PUT
// decrement song priority in queue (i.e. move it upward)
// If successful, returns status 201.
// Otherwise, returns status 404 if song not found; returns status 405 if song is first in queue and cannot change priority.
app.put("/api/queue/:id", (req, res) => {
  const {id} = req.params;
  const songIdx = queue.findIndex(entry => entry.qid === parseInt(id));
  if (songIdx === -1) return res.status(404).send("Song not found in queue");
  if (songIdx === 0) return res.status(405).send("Song is first in queue, cannot boost priority");
  
  queue[songIdx].priority--;
  queue[songIdx-1].priority++;
  [queue[songIdx], queue[songIdx-1]] = [queue[songIdx-1], queue[songIdx]];
  return res.status(201);
})

// DELETE
// remove song from queue
// Returns status 204
app.delete("/api/queue/:id", (req, res) => {
  const {id} = req.params;
  queue = queue.filter(entry => entry.qid !== parseInt(id));
  return res.status(204);
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
