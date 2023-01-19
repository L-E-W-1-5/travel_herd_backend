import express from "express";

const usersRouter = express.Router();
import { getUsers } from "../models/users.js";

import {auth} from 'express-oauth2-jwt-bearer'

const domain = "dev-otxf3y3m35xq561z.uk.auth0.com"

const checkJwt = auth({
    audience: `https://${domain}/api/v2/`,
  issuerBaseUrl: 'https://dev-otxf3y3m35xq561z.uk.auth0.com',
  issuer: 'https://dev-otxf3y3m35xq561z.uk.auth0.com/',
  jwksUri: 'https://dev-otxf3y3m35xq561z.uk.auth0.com/.well-known/jwks.json'
})


usersRouter.get("/:id", checkJwt, async function(req, res) {

    const result = await getUsers(req.params.id) //TODO: send the body to getUsers

    console.log(req.params.id)
    res.json({success: true, payload: "joy"})
})


export default usersRouter;
