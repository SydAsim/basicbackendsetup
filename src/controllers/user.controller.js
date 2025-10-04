import { asynhandler } from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiErrors.js'
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from 'jsonwebtoken'

const generateAccessandRefreshToken = async(userId)=>{
    try {
       const user =  await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       // save refreshToken in db 
       user.refreshToken = refreshToken 
    //    just save it don't ask for password 
     await user.save({validateBeforeSave : false})

    return {accessToken , refreshToken}
    } 
    catch (error) {
        throw new ApiError (500,"Something went wrong while generating access and refress token" )
        
    }

}




const registerUser = asynhandler( async (req, res) => { 

    // console.log("BODY:", req.body);
    // console.log("FILES:", req.files);

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
    // console.log("email", email);
    // console.log("fullanme", fullname);
    // console.log("username", username);
    // console.log("password", password);

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

    // console.log(req.files)
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

})
    

    //LoginUser 
    const logingUser = asynhandler(async(req,res)=>{
        // req-> body ->data
        //username or email 
        //find  the user 
        // password check
        //access and refresh token 
        // send cookies

        const {email , username , password} = req.body

        if (!username && !email){
            throw new ApiError (400 , " email or username is required")
        }
        //check in db using mongo db or operator
        const user = await User.findOne({
            $or : [{username} , {email}]
        })


        if(!user) {
            throw new ApiError(400 , "user does not exist")
        }

        const isPasswordvalid = await user.isPasswordCorrect(password)

        if(!isPasswordvalid) {
            throw new ApiError (401 , "Password is Incorrect")
        }

        // Call method generate access and Refresh token
        
       const  {accessToken , refreshToken} =await generateAccessandRefreshToken(user._id)
     

        // send data yani message to user 
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // Hey server, I’m about to send a request from frontend.com to backend.com.
    // Am I allowed? If yes, which methods, headers, and origins are allowed?
    // OPTIONS = a handshake request by the browser to check permissions before sending the real request.
        const options  = {
            httponly : true ,
            secure : true 
        }


//  .cookie("accessToken", accessToken, options)
// Tells Express: “Set a cookie on the client’s browser.”
// First argument: "accessToken" → this is the cookie name.
// Second argument: accessToken → this is the cookie value (your JWT string).
// Third argument: options → an object with settings like:
        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken", refreshToken , options)
        // handle case where user want to handle/from localStorage etc
        // After setting cookies and status, .json() sends a JSON response body to the client.
        .json(
                new ApiResponse(
                    200 , 
                    {
                        user : loggedInUser , accessToken , refreshToken
                    },
                    "User LoggedIn Successfully"
                )
        )
    
})





const logoutUser  = asynhandler (async (req, res)=> {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            } ,

        },
        // new updated value 
        {
            new : true
        }
    )

     const options  = {
            httponly : true ,
            secure : true 
    }

    return res
    .status(200)
    .clearCookie("accessToken" ,options)
    .clearCookie("refreshToken" ,options)
    .json(new ApiResponse(200 , {} , "User logged Out"))

}) 


//now as we the accessToken is short lived like 30 to 60 mins but when user is logged in we 
// have to refresh so this is is the method for it 

const refreshAccessToken = asynhandler(async (req,res)=>{
   const  incommingRefreshToken=  req.cookies.refreshToken
    || req.body.refreshToken

    if(!incommingRefreshToken) {
        throw new ApiError( 401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
            )
        
        const user = User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError (401 , "Invalid RefreshToken")
        }
    
        // match the tokens
        if(incommingRefreshToken !== user?.refreshToken){
            throw new ApiError (401 , "Refresh Token is used or expired")
        }
    
        const options = {
            httponly : true, 
            secure : true
        }
    
       const {accessToken  , newrefreshToken}= await generateAccessandRefreshToken(user._id)
    
       return res
       .status(200)
       .cookie("accessToken" , accessToken ,options)
       .cookie("refreshToken" , newrefreshToken ,options)
       .json(
           new ApiResponse(
               200,
               {accessToken , refreshToken: newrefreshToken},
               "Access Token Refreshed"
           )
        )
        
    } catch (error) {
        throw new ApiError(401 , error?.message ||  "unauthorized request")
    }
})

const changeCurrentPassword = asynhandler (async(req, res)=>{
    const {oldPassword , newPassword} = req.body
    // if u also to handle the confpassword as well then
    // if(!(newPassword === conpassword)){
    //     throw new apiError (404  , "incorrect confpassword")
    // }


    
// we can req it cause of the middle ware we are useing in 
// auth.middileware which means if user is loggedin then his id can be finded
   const user = await User.findById(req?.user._id)
   const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

   
   if (!isPasswordCorrect) {
    throw new ApiError(400 , "inValid oldpassword")
   }

   //if password is correct 
   user.password = newPassword
   //so we have to save it in the db
   await user.save({validateBeforeSave : false})

   return res
   .status(200)
   .json( new ApiResponse(200 , {} , "Password changes successfully"))


}) 


// how to get currentUser (loggedInUser)
const getCurrentUser = asynhandler(async (req,res)=>{
    res
    .status(200) 
    .json(200 , req.user , "Current user fetched Successfully")
})


//advice best practice to keep update functions in  seperate routes 
const updatAccountDetails = asynhandler (async (req,res)=>{

     const {fullname , email} = req.body


if(!fullname || email){
    throw new ApiError(401 , "All fields are required")
}

const user = User.findByIdAndUpdate(
    req.user?._id,
    {
        $set: {
            fullname : fullname, // u can update both ways 
            email,
        }
    },
    {new : true} // so that we get the updated password 

).select("-password")

return res
.status(200)
.json(new ApiResponse(200 , user , "Accounts details updated successfully"))

})


const updateUserAvatar = asynhandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
       throw new ApiError(401 , "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(401 , "Error while uploading avatar")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse (200 , user , "Avatar updated successfully")
    )




})

const updateUsercoverImage = asynhandler(async (req,res)=>{
    const coverImagelocalPath = req.file?.path

    if(!coverImagelocalPath){
       throw new ApiError(401 , "coverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImagelocalPath)

    if(!coverImage.url){
        throw new ApiError(401 , "Error while uploading coverImage")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set :{
                coverImage : coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse (200 , user , "CoverImage updated successfully")
    )

})

export {
    registerUser,
    logingUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updatAccountDetails,
    updateUserAvatar,
    updateUsercoverImage,
    


}