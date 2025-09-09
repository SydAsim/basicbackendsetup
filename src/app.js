import express from 'express'
import cors from 'cors'

// To access  and Set Cookies of the users Browser 
import cookieParser from 'cookie-parser'

const app = express()

//app.use is used for middlewares and other configuarations
app.use(cors({
    origin : "process.env.CORS_ORIGIN",
    credentials : true,
}))

// here we are setting limit on JSON data been sent to the server
app.use(express.json({limit: '10kb'}))

// what about data coming from the URL  we use URL encode for that 
app.use(express.urlencoded({extended : true , limit : '20kb'} ))

// now to store public assets or folders etc in images faviicon etc 
app.use(express.static("Public"))


app.use(cookieParser())

export {app}