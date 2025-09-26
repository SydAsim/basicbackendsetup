import { asynhandler } from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiErrors.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asynhandler( async (req, res) => { 

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    //get user details from the front-end 
    // validation - not empty 
    // check if the user already exists  : username , email
    // check for images , check for avatar 
    // upload them to cloudinary 
    // create user object (in mongodb we send data through objects) - create entry in db 
    // remove password and refresh token field from the reponse 
    // check for user creation 
    // return response 
    
    
    // destructuring assignment in JavaScript.
    const {fullname , email , username , password} = req.body
    console.log("email", email);
    console.log("fullanme", fullname);
    console.log("username", username);
    console.log("password", password);

    //some is method through which we can apply validation multiple fields  
    if([fullname,email,username,password]
        .some(field=>field?.trim() == ""))
    {
        throw new ApiError(400 ,"All fields are required")
    }
    // we can also add more validations like gmail @ included or not etc
    // in larger source code there is a seperate validation file for it 

   //or operator same concept of checking the mutiple fields
   const existedUser =  await User.findOne({
        $or: [{email}, {username}]
    })

    if(existedUser){
        throw new ApiError (409 , "User with email or username already exist")
    }

    console.log(req.files)
    //we can also do req.body which express give us the files property is from
    // mutlar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // const avatarLocalPath = req.files && req.files["avatar"] ? req.files["avatar"][0].path : null;
    // const coverImageLocalPath = req.files && req.files["coverImage"] ? req.files["coverImage"][0].path : null;
    // console.log("Avatar Local Path:", avatarLocalPath);
    // console.log("Cover Image Local Path:", coverImageLocalPath);

    // checking by classical mehtod
    let coverImageLocalPath ;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
    {
        coverImageLocalPath  = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath){
        throw new ApiError(400,"Avatar files is required ")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage  = await uploadOnCloudinary(coverImageLocalPath)
    
    


    if(!avatar){
      throw new ApiError(400,"Avatarr files is required ")
    }

    const user = await User.create(
        {
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email ,
        password,
        username: username.toLowerCase()
    })

    // is usermade or we have check that as weell by default by mongodb
    // also remove pass and refreshToken by select
    // We remove password and refreshToken because they are sensitive data 
    // and must never go to the client/browser.
    const createdUser = await User.findById(user._id).select(
        "-password  -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError (500 ,"Somthing went wrong while registring User")
    }

    return res.status(201).json(
        new ApiResponse(200 ,createdUser , "User registered Successfully")
    )
    //

    
})
export {registerUser}