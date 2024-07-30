import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Community } from "../models/community.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createCommunityPost=asyncHandler(async(req,res)=>{
    const {content}=req.body;

    if(!content){
        throw new ApiError(400,"content is missing");
    }

    const communityPost=await Community.create({
        content,
        owner:req.user._id
    })

    if(!communityPost){
        throw new ApiError(400,"error while creating post");
    }

    return res.status(200).json(new ApiResponse(200,communityPost,"Post created successfully"))
})

const getAllCommunityPost=asyncHandler(async(req,res)=>{
    const communityPosts=await Community.aggregate([
        {
            $match:{}
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        }
    ])
    if(!communityPosts){
        throw new ApiError(400,"error while fetching post");
    }
    return res.status(200).json(new ApiResponse(200,communityPosts,"Post fetched successfully"))

})

const getChannelPost=asyncHandler(async(req,res)=>{
    const {channelId}=req.params;

    if(!channelId){
        throw new ApiError(400,"channel id not found");
    }

    const channelPosts=await Community.aggregate([
        {
            $match:{owner:new mongoose.Types.ObjectId(channelId)}
        }
    ])

    if(!channelPosts){

        throw new ApiError(400,"No posts found");

    }

    return res.status(200).json(new ApiResponse(200,channelPosts,"All Channel Posts fetched successfully"))

})

const deletePost=asyncHandler(async(req,res)=>{
    const {postId}=req.params;
    
    const deletedPost=await Community.findByIdAndDelete(postId);

    if(!deletedPost){
        throw new ApiError(400,"error while deleteing post");
    }

    return res.status(200).json(new ApiResponse(200,deletedPost,"post deleted successfully"))

})

const updatePost=asyncHandler(async(req,res)=>{
    const {postId}=req.params;
    const {content}=req.body

    if(!postId){
        throw new ApiError(400,"Post id is missing");
    }
    if(!content){
        throw new ApiError(400,"write something to update");
    }

    const updatedPost=await Community.findByIdAndUpdate(
        postId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )
    if(!updatedPost){
        throw new ApiError(404, "post not found, update failed");

    }

    return res.status(200).json(new ApiResponse(200,updatedPost,"post updated successfully"))

})
export{
   updatePost,deletePost,createCommunityPost,getAllCommunityPost,getChannelPost
}