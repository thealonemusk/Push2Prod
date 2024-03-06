import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import {generate} from "./id.ts";
const app = express();
app.use(cors());
app.use(express.json());
app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generate();
  if (!repoUrl)
    return res.status(400).json({ message: "Repo URL is required" });
  await simpleGit().clone(repoUrl, `output/${id}`);
  res.json({
    id : id,
    status : "Deploying...",
  });
});
app.listen(3000);
console.log("Server is running on port 3000");
