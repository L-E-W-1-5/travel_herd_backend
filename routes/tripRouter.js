import express from "express";

const tripRouter = express.Router();
import { createTrip, getTrips } from "../models/trip.js";

tripRouter.get("/:id", async function (req, res) {
  try {
    const result = await getTrips(req.params.id);
    res.status(200).json({ success: true, payload: result });
  } catch (err) {
    console.log("err");
  }

  // const result = await getTrips()
  // res.status(200).json({success:true,payload: result});
});

tripRouter.post("/", async function (req, res) {
  const result = await createTrip(req.body);
  res.json({ success: true, payload: result });
});

export default tripRouter;
