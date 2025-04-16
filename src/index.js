
import connectDB from "./db/index.js";
import dotenv from "dotenv"

dotenv.config({
    path: "./env"
})

  connectDB()








/*

const app = express()
( async () => {
    try {
       await mongoose.connection(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on('error', (error) => {
           console.error('MongoDB connection error:', error)
           throw error
       })
       app.listen(process.env.PORT, () => {
        console.log(`Server is listen on port ${process.env.PORT}`)
       })
    } catch (error) {
        console.error('Error connectiong to mongoDB:', error)
        throw error
    }
})()*/