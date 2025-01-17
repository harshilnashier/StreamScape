import mongoose,{Schema} from "mongoose";

const commentsSchema=new Schema({
    content:{
        type:String,
        required:true
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"
    }
},{timestamps:true})

export const Comment=mongoose.model("Comment",commentsSchema)