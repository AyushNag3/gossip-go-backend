import { Jwt } from "jsonwebtoken";
let jwt = require('jsonwebtoken');
import { Request, Response, NextFunction } from "express";

interface JwtPayload {
  data: {
    email: string;
    userId: string;
  };
  iat: number;
  exp: number;
}

export const verifytoken = async(req:Request, res:Response, next:NextFunction) => {
  const token = req.cookies.jwt_cookie ;
  if (!token) return res.status(401).send("You are not authenticated")
    jwt.verify(token, process.env.JWT_KEY, async(err : React.ReactNode, payload : JwtPayload) => { //@ts-ignore
    req.userId = (payload.data.userId)
  })
  next()
}

