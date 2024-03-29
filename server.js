import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import PostRoutes from "./routes/PostRoutes.js";
import messageRoutes from "./routes/messageRoutes.js"




dotenv.config(); // to use .env

// establishing connection
connectDB();

const app = express()

//middleware
app.use(express.json())
app.use(cors())

//routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/post", PostRoutes)
app.use("/api/v1/message", messageRoutes)


app.get("/", (req, res) => {
  res.send("Social Media App")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})