import { Router } from "express";
import { verifytoken } from "../middlewares/authmiddlewares";
import { SearchContact } from "../controllers/contactcontrollers";
import { getUserContactForDm } from "../controllers/contactcontrollers";

export const ContactRoutes = Router() ; //@ts-ignore
ContactRoutes.post("/search", verifytoken, SearchContact) //@ts-ignore
ContactRoutes.get("/get-contacts-for-dm", verifytoken, getUserContactForDm)