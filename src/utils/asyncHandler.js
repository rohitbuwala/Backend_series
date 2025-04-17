const asyncHandler = (requestHandler) => {

   return (req, res, next) => {
         Promise.resolve( requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}


// const asyncHandler = () => {}
    // const asyncHandler = () => () => {}
    // const asyncHandler = (function) => async () => {}
    
// const asyncHandler = (fn) => (req, res, next) => {
//     try {
//         await (req, res, next)

//     } catch (error) {
//        res.status(err.code || 5000).json({
//         success: false,
//         message: err.message
//        })
        
//     }
// }