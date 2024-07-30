import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { uploadOnCloudinary } from "../utils/cloudinary.js";



const generateAccessAndRequestToken=async(userId)=>{
    try {
        const user= await User.findById(userId)

        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken

        await user.save({valideBeforeSave:false})

        return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh token",error)
    }
}

const registerUser=asyncHandler(async(req,res)=>{


    // get user details from frontend
    // validation -not empty
    // already exist check
    // check for image and avatar
    // upload to cloudinary,and recheck for upload
    // create user object-create entry in DB
    // remove password and refresh token field from res
    // check for user creation
    // return res/error
    
    const {fullName,email,username,password}=req.body


    if([fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required") 
    }


    const ExistingUser=await User.findOne({
        $or:[{username},{email}]
    })
    
    if(ExistingUser){
        throw new ApiError(409,"User with same email or username already exists") 
    }


    // console.log(req.files)


    const avatarLocalPath=req.files?.avatar[0]?.path
    // const coverImageLocalPath=req.files?.coverImage[0]?.path

    let coverImageLocalPath
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
        coverImageLocalPath=req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar fields are required") 
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(400,"Avatar fields are required") 

    }


    const user=await User.create({
        fullName:fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })



    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }


    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})

const LoginUser=asyncHandler(async(req,res)=>{

    // req->body get data
    // username or email 
    // find the user
    // password check
    // access and refresh token generate and send
    // send cookie

    const {email,username,password}=req.body

    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    const user= await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User doesn't exit")
    }
   const validPassword= await user.isPasswordCorrect(password)


    if(!validPassword){
        throw new ApiError(401,"Password invalid")
    }

   const{accessToken,refreshToken}=await generateAccessAndRequestToken(user._id)

   const logedinUser=await User.findById(user._id).select("-password -refreshToken")

    const option={
            httpOnly:true,
            secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(200,{
            user:logedinUser,accessToken,refreshToken
        },
        "user Logged in successfully"
        )
    )

})

const LogoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }   
    )

    const option={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",option).clearCookie("refreshToken",option)
    .json(new ApiResponse(200,"User Logged out"))

})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"  Unauthorised Request")
    }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user =await User.findById(decodedToken?._id)
        
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
    
        }    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }
    
        const option={
            httpOnly:true,
            secure:true
        }
        const {newAccessToken,newRefreshToken}=await generateAccessAndRequestToken(user._id);
    
        return res.status(200)
        .cookie("accessToken",newAccessToken,option)
        .cookie("refreshToken",newRefreshToken,option)
        .json(new ApiResponse(200,
            {newAccessToken,newRefreshToken},
            "Access Token Refreshed"))
    } catch (error) {
        throw new ApiError(401, error?.message||"Invalid Refresh Token")
    }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    
    console.log(req.user);
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

const UpdateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required");
    }

    const user=await User.findByIdAndUpdate( req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },
        {
            new:true
        }
        ).select("-password")

        return res.status(200).json(new ApiResponse(200,user,"Account Details Updated successfully"))

})

const UpdateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File Not Found")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading Avatar")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }

        },
        {
            new:true
        }).select("-password");
        
    return res.status(200).json(new ApiResponse(200,user,"Avatar Updated Successfully"))
})

const UpdateCoverImage=asyncHandler(async(req,res)=>{
    const coverImagePathh=req.file?.path
    if(!coverImagePathh){
        throw new ApiError(400,"Cover File Not Found")
    }
    const coverImage=await uploadOnCloudinary(coverImagePathh)

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading Cover Image")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }

        },
        {
            new:true
        }).select("-password");
    return res.status(200).json(new ApiResponse(200,user,"Cover Image Updated Successfully"))
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params;

    if(!username?.trim()){
        throw new ApiError(400,"Username is missing");
    }

    const channel=await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        
        // users who have subscribed to me
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"                
            }
        },
        // to which i have subscribed to
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },

                isSubscribed:{
                    $cond:{
                        if:{
                            $in:[req.user?._id,"$subscribers.subscriber"]
                        },
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                email:1,
                coverImage:1
            }
        }
    ])
    console.log(channel)

    if(!channel?.length){
        throw new ApiError(404,"Channel doesn't exist");
    }

    return res.status(200).json(new ApiResponse(200,channel[0],"User Channel fetched successfully"))
})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $lookup: {
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
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully"))

})


export {registerUser,LoginUser,LogoutUser,refreshAccessToken,changeCurrentPassword,getCurrUser
    ,UpdateAccountDetails,UpdateUserAvatar,UpdateCoverImage,getUserChannelProfile,getWatchHistory}