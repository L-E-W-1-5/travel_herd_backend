import express from "express";
import nodemailer from 'nodemailer'

const usersRouter = express.Router();
import { getUsers, addTripToUser } from "../models/users.js";

import {auth} from 'express-oauth2-jwt-bearer'

const domain = "dev-otxf3y3m35xq561z.uk.auth0.com"

const checkJwt = auth({
    audience: `https://${domain}/api/v2/`,
  issuerBaseUrl: 'https://dev-otxf3y3m35xq561z.uk.auth0.com',
  issuer: 'https://dev-otxf3y3m35xq561z.uk.auth0.com/',
  jwksUri: 'https://dev-otxf3y3m35xq561z.uk.auth0.com/.well-known/jwks.json'
})

//
usersRouter.post("/:id", checkJwt, async function(req, res) {

  if(req.params.id === "undefined"){
      res.json({success: false, payload: "no user logged in"})
      return
  }

    const result = await getUsers(req.params.id, req.body) //TODO: send the body to getUsers
//console.log(result.fullTripData)
    res.json({success: true, payload: result})
})

usersRouter.patch("/:id", async function(req, res) {
  //console.log(req.params.id, req.body)
  const result = await addTripToUser(req.params.id, req.body)

  //console.log(result)

  res.json({success: true, payload: result})
})




export default usersRouter;


