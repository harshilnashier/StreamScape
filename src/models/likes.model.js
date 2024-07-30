import mongoose,{Schema} from "mongoose";

const likeSchema=new Schema(
    {
        comment:{
            type:Schema.Types.ObjectId,
            ref:"Comment"
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        likedBy:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        community:{
            type:Schema.Types.ObjectId,
            ref:"Community"
        }
    },
    {
        timestamps:true
    }
)

export const  Like=mongoose.model("Like",likeSchema)