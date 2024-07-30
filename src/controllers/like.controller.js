import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Like } from "../models/likes.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    console.log(videoId);
    if(!videoId){
        throw new ApiError(400,"video is missing")
    }

    const isLiked=await Like.findOne(
        {
            video:videoId,
            likedBy:req.user._id
        }
    )

    if(!isLiked){
        const liked=await Like.create({
            video:videoId,
            likedBy:req.user.id,
        })
        if(!liked){
            throw new ApiError(400,"error liking the video")

        }
    }else{
        await Like.findByIdAndDelete(isLiked._id)
    }

    const updatedLike=await Like.findOne({
        video:videoId,
        likedBy:req.user.id
    })

    let result;
    if(!updatedLike){
        result=false;
    }else{
        result=true
    }

    return res.status(200).json(new ApiResponse(200,{result},"toggled video like"))
})

const toggleCommentLike=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;

    if(!commentId){
        throw new ApiError(400,"comment is missing")
    }

    const isLiked=await Like.findOne(
        {
            comment:commentId,
            likedBy:req.user.id
        }
    )

    if(!isLiked){
        const liked=await Like.create({
            comment:commentId,
            likedBy:req.user.id,
        })
        if(!liked){
            throw new ApiError(400,"error liking the comment")
        }
    }else{
        await Like.findByIdAndDelete(isLiked._id)
    }

    const updatedLike=await Like.findOne({
        comment:commentId,
        likedBy:req.user.id
    })

    let result;
    if(!updatedLike){
        result=false;
    }else{
        result=true
    }
    return res.status(200).json(new ApiResponse(200,{result},"toggled comment like"))

})

const toggleCommunityPostLike=asyncHandler(async(req,res)=>{
    const {postId}=req.params;

    if(!postId){
        throw new ApiError(400,"community post is missing")
    }

    const isLiked=await Like.findOne(
        {
            community:postId,
            likedBy:req.user.id
        }
    )

    if(!isLiked){
        const liked=await Like.create({
            community:postId,
            likedBy:req.user.id,
        })
        if(!liked){
            throw new ApiError(400,"error liking the post")
        }
    }else{
        await Like.findByIdAndDelete(isLiked._id)
    }

    const updatedLike=await Like.findOne({
        community:postId,
        likedBy:req.user.id
    })

    let result;
    if(!updatedLike){
        result=false;
    }else{
        result=true
    }
    return res.status(200).json(new ApiResponse(200,{result},"toggled post like"))
})

const getAllLikedVideos=asyncHandler(async(req,res)=>{

     const likedVideos=await Like.find(
        {
            likedBy:req.user._id,
            video:{$ne:null}
        }
     ).populate("video");

     if(!likedVideos){
        throw new ApiError(400,"error getting all the liked post");
     }

     return res.status(200).json(new ApiResponse(200,likedVideos,"Got all the liked videos"));
})


export{toggleVideoLike,toggleCommentLike,getAllLikedVideos,toggleCommunityPostLike}