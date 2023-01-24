import express from "express";

const pollRouter = express.Router();

import { createPoll } from "../models/poll.js";

pollRouter.post("/", async function (req, res) {
  const result = await createPoll(req.body);
  res.json({ success: true, payload: result });
});

export default pollRouter;
