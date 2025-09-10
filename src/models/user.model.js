import mongoose ,{Schema}from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema  = new Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        // for makeing it searchable more optimze to use index for searching
        index : true
    },

    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
    },

    fullname : {
        type : String,
        required : true,
        trim : true,
        index : true
    },

    avatar : {
        type : String, //Cloudinary upload url 
        required : true
    },

    coverimage : {
        type : String, //Cloudinary upload url 
    },

    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],

    password : {
        type : String, //standard practice to secure 
        required : [true , "password is required"]
    },

    refreshToken :{
        type : String
    }

},
{
    timestamps : true
}
)

userSchema.pre("save" , async function(next) {
    // now we need to add logic if it is  password is modified or not 
    // so if password is changed then run the next method 
    if(!this.isModified("password")) return next()

    //we need to give context of this password
    this.password  = bcrypt.hash(this.password , 10)
    next() 
})


// we can inject as many methods in our Schema as we want 
userSchema.methods.isPasswordCorrect = async function 
(password) {
    // bcrypt can use compare mehtod to use the validations of the passwords  
    return await bcrypt.compare(password , this.password)
}

//now we will right method for  generating access tokens and referesh tokens

userSchema.methods.generateAccessToken( function () 
{
    jwt.sign(
        {
            _id: this._id,
            email : this.email,
            username : this.username,
            password : this.password

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
)

userSchema.methods.generateRefreshToken( function (){
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
})



export const User = mongoose.model ("User" , userSchema)