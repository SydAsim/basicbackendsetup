// require('dotenv').config({path : './env'})  //As early as possible in your application, import and configure dotenv
import dotenv  from 'dotenv'
import connectedDb from "./db/index.js";
import app from "./app.js"

dotenv.config({
   path : "./env"
})



// asyncrouns code when completed it also give us Promise
connectedDb().then(()=>{
   app.listen(process.env.PORT || 8000, ()=>{
      console.log(`Server is Running at ${process.env.PORT}`);
      
   });

})
.catch((error)=>{
   console.log("Mongo Db connection failed" ,error);
   
})

// index.js → server bootstrap

// Load .env variables early.

// Connect to database.

// Start the server with app.listen(PORT).

// Handle global errors like DB connection failure.































// import mongoose from 'mongoose'
// import express from 'express'
// import { DB_NAME } from './constants';

// const app = express()

// ;(async()=>{
//     try {
//         await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//         //maybe the express app is not conneting or having issues so that is 
//         // handeled here 
//         app.on("error" , (error) =>{
//             console.log("Error :" , error);
//             throw  error
//         })


//         app.listen(process.env.PORT, ()=>{
//             console.log(`App is listening on ${process.env.PORT}`);
//         })


//     } catch (error) {
//         console.error("Error :" ,error)
//         throw err
        
//     }
  

// })()
