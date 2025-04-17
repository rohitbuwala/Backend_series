import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    
    {
        videoFile: {
            type: string, // cloundinary url
            required: true
        },
        thumbnail: {
            type : String, // cloundinary url
            required: true
        },
        title: {
            type : string,
            required: true
        },
        description:{
            type : String,
            required: true
        },
        duration: {
            type: Number, // in seconds
            required: true
        },
        views:{
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },
    {timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate )

export const Video = mongoose.model("Video", videoSchema)