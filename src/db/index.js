import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectedDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}
            /${DB_NAME}`)

            console.log(`\n The DB connection is successful
               DB HOST at : ${connectionInstance.connection.host}`);
            

    } catch (error) {
        console.log("DB connection Failed", error);
        process.exit(1);
        }

}

export default connectedDb

//( process.exit() is a method that immediately terminates the running Node.js process.
// Exit codes meaning
// 0 → success (program ended normally, no errors).
// 1 (or any non-zero) → failure (program ended because of an error or something unexpected).)