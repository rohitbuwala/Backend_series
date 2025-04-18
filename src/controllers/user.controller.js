import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiArror.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


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

    const {fullName, email, username, password } =req.body
    console.log("email:", email)

    // if(fullName === ""){
    //     throw new ApiError(400 , "fullname is required")
    // }

    if(
        [fullName, email, username, password ]
        .some( (field) => field?.trim()=== "")
    ){

        throw new ApiError(400, "All field is required")
    }

    const existedUser =User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username alredy exists")
    }

    const avatarLocalPath =req.files?.avatar[0]?.path    //user.routes se

    const coverImagelocalPath =req.files?.coverImage[0]?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)   // is method me time lagega to esiliye esme await lagya 
     const coverImage = await uploadOnCloudinary(coverImagelocalPath)

     if(!avatar){
        throw new ApiError(400 , "Avatar file is required")
     }

   const user = await User.create({
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


export  {registerUser}