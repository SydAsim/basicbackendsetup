const asynhandler = (requesthandler)=> {
   return  (req, res ,next) => {
        Promise.resolve(requesthandler(req,res,next))
        .catch((err)=> next(err))
    }
}
export {asynhandler}



// high order funtion which can accept  functions as 
// parameters  and return it as well 
// const asynhandler = () => {}
// const asynhandler = (ftn) => { ()=>{} }
// const asynhandler = (ftn) => { async()=>{} }


// const asynhandler = (ftn)=> async (req , res ,next) => {
//     try {
//         await ftn(req,res,next)
        
//     } catch (error) {
//         res.status(err.code || 500) .json({
//             success : false ,
//             message : err.message
//         })
//     }
// }