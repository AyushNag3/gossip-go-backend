import { Router } from "express"
import { signup, UpdateProfile } from "../controllers/authcontrollers"
import { login } from "../controllers/authcontrollers"
import { verifytoken } from "../middlewares/authmiddlewares"
import { getUserInfo } from "../controllers/authcontrollers"
import { addprofileimage } from "../controllers/authcontrollers"
import { deleteprofileimage } from "../controllers/authcontrollers"
import { logout } from "../controllers/authcontrollers"

import fs from "fs"
import multer, { type FileFilterCallback } from "multer"
import type { Request } from "express"
import path from "path"

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads", "profiles")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "../frontend/images/")
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname)
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp,", "image/jpg"]
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error("Invalid file type"))
  },
})

export const authRoute = Router() //@ts-ignore
authRoute.post("/signup", signup) //@ts-ignore
authRoute.post("/login", login) //@ts-ignore
authRoute.get("/userinfo", verifytoken, getUserInfo) //@ts-ignore
authRoute.post("/profile", verifytoken, UpdateProfile) //@ts-ignore
authRoute.post("/add-profile-img", verifytoken, upload.single("profile-img"), addprofileimage) //@ts-ignore
authRoute.post("/remove-profile-img", verifytoken, deleteprofileimage) //@ts-ignore
authRoute.post("/logout", logout)
