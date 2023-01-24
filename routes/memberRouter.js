import express from "express";

const memberRouter = express.Router();


import { createMember } from "../models/member.js";


memberRouter.post("/", async function (req, res) {
  const result = await createMember(req.body);
  res.json({ success: true, payload: result });
});













export default memberRouter