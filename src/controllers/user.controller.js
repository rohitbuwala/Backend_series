import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async(userId) =>{

    try {
        const user =await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and Access token ")
        
    }
}


const registerUser = asyncHandler(async (req, res) => {
    //     res.status(200).json({
    //         message : "Radhe Radhe🙏"
    //     })

    //get user detail from frontend
    //validation  - not empty
    // cheak if user already exists : email, phone, username
    //check for image or check for avatar 
    //upload them to cloudinary, avatar
    //create object user - entry in db
    //remove password and refresh token field from response
    //check for user createion
    //return response to frontend 

    const {fullName, email, username, password } =req.body     // esme hum sari value ki res.body se
    //console.log("email:", email)

    // if(fullName === ""){
    //     throw new ApiError(400 , "fullname is required")
    // }

    if(
        [fullName, email, username, password ]      // yaha humne check kiy akahi emty string to pass ni kr di 
        .some( (field) => field?.trim()=== "")
    ){

        throw new ApiError(400, "All field is required")
    }

    const existedUser =await User.findOne({             //userAlredy esxit to ni krta hai check kiya
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username alredy exists")        // agr usr hai to error krdo nahi h to aage bado
    }

    const avatarLocalPath =req.files?.avatar[0]?.path;    //user.routes se     loacal path  nikala or upload kiya

    //console.log(avatarLocalPath)

     //const coverImagelocalPath =req.files?.coverImage[0]?.path

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")              //avatar nahi hai to error 
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)   // is method me time lagega to esiliye esme await lagya   
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

     if(!avatar){
        throw new ApiError(400 , "Avatar file is required")
     }

   const user = await User.create({         // agr sab lucj sahi hai ek object create kra
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "" ,  // agar coverImage nahi hai to null ematy bhrj dega 
        email,
        password,
        username: username.toLowerCase()
      })

   const createdUser = await User.findById(user._id).select(      //passfield remove 
    "-password -refreshToken"
   )

   if(!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
   }

   return res.status(201).json(

    new ApiResponse(200, createdUser , "user register successfully")   
   )

 })

 const loginUser = asyncHandler(async (req, res) => {

    //req body se data chahiye 
    // username or email 
    // user ko find krna h ke ni 
    //passwrod check krna 
    // send cookies
    //success login

   const {email, username , password} =  req.body

 
   if(!username  && !email){
    throw new ApiError(400, "username or password is required" )
   }

   //    if(!(username  || email)){
    //     throw new ApiError(400, "username or password is required" )
    //    }
    
    const user = await User.findOne({
        $or: [ {username },{email} ]
    })
   // console.log(user)
    
   if(!user){
    throw new ApiError(404 ,"user does not exist")
   }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(! isPasswordValid){
    throw new ApiError(401, "invalid user credentials")
  }

   const {accessToken, refreshToken} =     await generateAccessAndRefereshTokens(user._id)

   const loggedInUser = await User.findById(user._id).
   select("-password -refreshToken")

   const option = {
    httpOnly: true,
    secure: true
   }

   return   res
   .status(200)
   .cookie("accessToken", accessToken, option)
   .cookie("refreshToken", refreshToken , option)     //spinling cheak
   .json(
    new ApiResponse(200 ,
        {
            user : loggedInUser , accessToken , refreshToken
        },
        "user Loggin successfully"
    )
   )

 })

 const logoutUser = asyncHandler(async ( req, res) => {
   await  User.findByIdAndUpdate(req.user._id ,
        {
            // $set:{
            //     refreshToken: 1
            // }
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const option = {
        httpOnly: true,
        secure: true
       }

       return res 
       .status(200)
       .clearCookie("accessToken" , option)
       .clearCookie("refreshToken" , option)
       .json( new ApiResponse(200, {} ,"User Logout"))
    
 }) 


const refreshAccessToken = asyncHandler( async (req, res) => {
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;     //  mistake cookie

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthurized request")
    }

   try {
    const decodedToken = jwt.verify(incomingRefreshToken, 
        process.env.REFRESH_TOKEN_SECRET)
 
     const user = await User.findById(decodedToken?._id)
 
     if(!user) {
         throw new ApiError(401, "Invalid refresh token")
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401, "Refresh token is expired or used")
     }
 
     const option ={
         httpOnly: true,
         secure: true
     }
 
    const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
     return res
     .status(200)
     .cookie("accessToken" , accessToken , option)
     .cookie("refreshToken", newRefreshToken, option)
     .json(
         new ApiResponse(
             200, {
                 accessToken, refreshToken: newRefreshToken
             }, "Access token refreshToken"
         )
     )
   } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token")
   }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const {oldPassword , newPassword  } = req.body      //comfPassword 

    // if(!(newPassword === comfPassword)){
    //     throw new ApiError(400,)
    // }
 
    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {} ,"password changed"))
})


const getcurrentUser = asyncHandler( async (req, res) => {

    return res
    .status(200)
    .json( new ApiResponse(200, req.user , "current user Fechhed Successfully"))

})

const updateAccountDetails = asyncHandler (async (req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email) {
        throw new ApiError(400, "All field is required")
    }

    const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,       //fullname: fullName
                email              //email: email
            }
        },
        {new: true}     //update hone ke bad infromation aati h
      ).select(
        "-password"
      )

      return res.status(200)
      .json(new ApiResponse(200, user , "Account Detail update successfully"))
})

const updateUserAvatar = asyncHandler (async (req, res) => {

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on Avatar") }

      const user =  await User.findByIdAndUpdate(
            req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
        ).select("-password")

        return res.status(200)
        .json( new ApiResponse (200, user, "Avatat  update successfully"))
})

const updateUserCoverImage = asyncHandler (async (req, res) => {

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "CoverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading on coverImage") }

       const user = await User.findByIdAndUpdate(
            req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
        ).select("-password")

        return res.status(200)
        .json(
            new ApiResponse (200, user, "CoverImage update successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res ) => {
    
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "Username is Missing")
    }

   const channel = await User.aggregate([
            {
                $match :{
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup:{
                   from: "subscriptions",                 //mistake small s th or cap
                   localField: "_id",
                   foreignField: "channel",
                   as: "subscribers"
                }

            },
            {
                $lookup: {
                    from: "subscriptions",                  //mistake small s th or cap
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {                                                            //CONDITION
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if (!channel.length) {
        throw new ApiError(404, "Channel Does not Exists");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched SuccessFully")
    )
})


const getWatchHistory = asyncHandler(async (req, res ) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory , "Watch history fetch Successfully")
    )

})



export  {
    registerUser,
     loginUser,
     logoutUser , 
     refreshAccessToken,
    changeCurrentPassword,
    getcurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}