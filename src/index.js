
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import {app} from './app.js'
dotenv.config({
    path: "./env"
})

  connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`server is running at port: ${process.env.PORT}`);
        
    })
  })
  .catch((err) => [
    console.log('Mongo DB connection Faild !!!:', err)
  ])








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