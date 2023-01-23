import express from "express";

import {castVote, castItineraryVote} from '../models/voting.js'

const votingRouter = express.Router();

votingRouter.post('/:id', async function (req, res) {
console.log(req.body)
    if(req.body.type){
        const itineraryVote = await castItineraryVote(req.params.id, req.body)
        res.status(200).json({ success: true, payload: itineraryVote });
        return
    }
    console.log("here?")
    const dateVote = await castVote(req.params.id, req.body)
    res.status(200).json({ success: true, payload: dateVote });
})

export default votingRouter