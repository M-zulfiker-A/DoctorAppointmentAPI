import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./routes.js";


dotenv.config()


const app = express()
app.use(express.json())
const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Connected");
    }catch(err){
        console.log("Could not connect"+err.message);
    }
}

app.use("/api", router)

app.listen(8080, ()=>{
    connectDB()
    console.log("listening to 8080");
})