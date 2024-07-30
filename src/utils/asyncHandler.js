// two methods for repeated interaction with the DB one utilising try catch and the other with promise resolve



const asyncHandler=(requestHandler)=>{
   return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>{next(err)});
    }
}


// Higher order function
// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try{
//         await fn(req,res,next);
//     }catch(error){
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }

export {asyncHandler}