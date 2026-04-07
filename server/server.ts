import express, { Express } from "express";
import cors from "cors";

const app: Express = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// GET
app.get("/", (req, res) => {
  res.send("Hello World!");
})

// POST

app.post("/", (req, res) => {
  const body = req.body;
  const message = body.message;
  res.send("This is a POST request with the message: " + message);
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

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
