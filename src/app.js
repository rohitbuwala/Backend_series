import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import aap from "express"


const app =express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//Routes import

import userRoutes from "./routes/user.routes.js";



//Routes declaration

app.use("/api/v1/users", userRoutes)

// https:localhost:5000/api/v1/users/register


export  {app} 