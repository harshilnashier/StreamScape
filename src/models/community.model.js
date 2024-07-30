import mongoose,{Schema} from "mongoose";

const communitysSchema=new Schema({
    content:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"
    }
},
{timestamps:true}
)

export const Community=mongoose.model("community",communitysSchema)