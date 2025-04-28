import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


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
//app.use("/api/v1/healcheack", heathcheckRouter)

app.use("/api/v1/users", userRoutes)
//app.use("/api/v1/tweets",   tweetsRoutes)

// https:localhost:5000/api/v1/users/register


export  {app} 