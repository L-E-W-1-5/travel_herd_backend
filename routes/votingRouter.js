import express from "express";

import {castVote} from '../models/voting.js'

const votingRouter = express.Router();

votingRouter.post('/:id', async function (req, res) {
    const vote = await castVote(req.params.id, req.body)
    res.status(200).json({ success: true, payload: vote });
})

export default votingRouter