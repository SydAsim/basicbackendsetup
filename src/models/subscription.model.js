import mongoose ,{Schema} from 'mongoose'

const subscriptionSchema  = new Schema ({
    Subscriber : {
        type : Schema.Types.ObjectId,//One who is subscribing
        ref : "User"

    },

    channel : {
        type : Schema.Types.ObjectId,//One to whom subscibers is subscribing
        ref : "User"

    }                          

}, {timestamps : true})

export const Subscription = mongoose.model("Subscription"  , subscriptionSchema)