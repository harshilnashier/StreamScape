import mongoose,{Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            
            // utilised for optimised searching for a field although becomes a little expensive in term of performance
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            lowercase:true,
            trim:true,
        },
        avatar:{
            type:String, //cloudinary url
            required:true
        },

        coverImage:{
            type:String
        },

        // making array and pushing video id in it to maintain history
        watchHistory:[
            {   
                type : Schema.Types.ObjectId,
                ref:"Video" 
            }
        ],
        password:{
            type:String, // because we are utilising encrytion so we are storing it in string as clear text could give a security concern
            required:[true,'Password is required'],
        },
        refreshToken:{
            type:String
        }

    },
    {timestamps:true})


// we don't use arrow function here because it doesn't have access to the reference of this and we need that here to update in the DB
// we use async because there is a certain degree of computation involved over here with checking and encryption
userSchema.pre("save",async function (next){
    // to ensure that we update the password only when there is a change in it and not whenever there is a slightest change/updation in the DB
    if(!this.isModified("password")){
        return next();
    }
    this.password=await bcrypt.hash(this.password,10);
    next()
})

// .method is basically utilised to create your own methods for the schema
userSchema.methods.isPasswordCorrect=async function(password){
    // console.log(this.password)
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "1d"
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY

        }

    )
}

export const User=mongoose.model("User",userSchema);