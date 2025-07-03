import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { authRoute } from "./routes/authroutes"
import { ContactRoutes } from "./routes/contactroutes"
import { MessageRoutes } from "./routes/messageroutes"
import { setupsocket } from "./socket"

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
)
app.use(cookieParser())

app.use("/api/auth", authRoute)
app.use("/api/contacts", ContactRoutes)
app.use("/api/messages", MessageRoutes)
app.get("/", (req, res) => {
  res.send("Hello from")
})

const port = process.env.PORT || 8000 // Make sure this uses the environment variable
const server = app.listen(port, () => console.log(`Server is listening to port ${port}`))

try {
  setupsocket(server);
} catch (error) {
  console.error("Socket setup failed:", error);
}
