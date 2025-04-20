import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


// const userSchema = new Schema(
//     {
//       username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         index: true,
//       },
//       email: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         lowercase: true,
//       },
//       fullName: {
//         type: String,
//         required: true,
//         trim: true,
//         index: true,
//       },
//       avatar: {
//         type: String,
//         required: true,
//       },
//       coverimage: {
//         type: String,
//       },
//       password: {
//         type: String,
//         required: [true, "password is required"],
//         select: false, // optional: for security, add this
//       },
//       refreshToken: {
//         type: String,
//         default: null,
//       },
//       watchHistory: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "Video",
//         },
//       ],
//     },
//     { timestamps: true }
//   )
  

const userSchema = new Schema(
   
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim : true ,
            index: true  
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim : true ,
           lowercase: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // cloundinary url
            required: true
        },
        coverimage: {
            type: String, // cloundinary url
         },
         watchHistory: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Video"
                }
            ],  
         },
         password: {
            type: String,
            required: [true, "password is required"]
        },
        refreshToken: {
            type: String,
           // default: null
        },

    },
    {timestamps: true})


userSchema.pre("save", async function (next) {

    if(!this.isModified("password"))  return next()

    this.password =await bcrypt.hash(this.password, 10)
    next()
})


// userSchema.methods.isPasswordCorrect = async function (password) {

//   return await  bcrypt.compare(password, this.password)
// }

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}



userSchema.methods.generateAccessToken = function (){

   return jwt.sign(
        {
            _id :this._id,
            email: this.email,
            userame: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,            //access token ko shottime ke liye use kiya jata hia 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES  
        }
    )
}

userSchema.methods.generateRefreshToken = function ( ){

    return jwt.sign(
        {
            _id :this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,           //long time ke liye  longterm me
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES
        }
    )
}


export const User = mongoose.model("User", userSchema)