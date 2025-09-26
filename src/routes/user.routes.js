import { registerUser } from "../controllers/user.controller.js"
import {Router} from 'express'
import {upload} from '../middlewares/multer.middleware.js'



const router =  Router() 
router.route("/register").post(

upload.fields([
    {
        name : "avatar",
        maxCount : 1
    },
    {
        name : "coverImage",
        maxCount : 1
    }
]),

registerUser)
export default router




 
// 🔹 What is userRouter?

// userRouter is not a keyword in Node.js or Express.

// It’s just a variable name you gave to whatever is being exported from ./routes/user.routes.js.

// By convention, developers often name it userRouter when that file contains routes related to "users" (like register, login, logout, profile, etc).

// 🔹 What does it usually contain?

// Inside user.routes.js, you’ll typically see something like:

// import { Router } from "express";
// const router = Router();

// // Example routes
// router.post("/register", (req, res) => {
//   res.send("User registered");
// });

// router.post("/login", (req, res) => {
//   res.send("User logged in");
// });

// export default router;


// 👉 Here:

// Router() is an Express mini-app that only handles routes.

// You add endpoints like /register or /login to it.

// Then you export it as default.