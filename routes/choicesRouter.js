import express from "express";

const choicesRouter = express.Router();
import { createChoices, getChoices } from "../models/choices.js";
import { getTrips } from "../models/trip.js";
import tripRouter from "./tripRouter.js";

choicesRouter.post("/", async function (req, res) {
  const result = await createChoices(req.body);
  res.json({ success: true, payload: result });
});

choicesRouter.get("/", async function (req, res) {
  console.log(req.body.category)
  try {
    const result = await getChoices(req.body.category, req.body.trip_id);
    res.status(200).json({ success: true, payload: result });
  } catch (err) {
    console.log("err");
  }
});

choicesRouter.get("/:id", async function (req, res) {
  console.log(req.params.id)
  try {
    const result = await getAllChoices(req.params.id);
    res.status(200).json({ success: true, payload: result });
  } catch (err) {
    console.log("err");
  }
});

export default choicesRouter;
