import { Router } from "express";
import { verifytoken } from "../middlewares/authmiddlewares";
import { getMessages } from "../controllers/messagecontrollers";

export const MessageRoutes = Router() ; //@ts-ignore
MessageRoutes.post("/get-messages", verifytoken, getMessages)