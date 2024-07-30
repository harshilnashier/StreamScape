import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.model.js";

const getAllVideoComments=asyncHandler(async(req,res)=>{
    const {videoID}=req.params;

    if(!videoID){
        throw new ApiError(400,"Invalid videoId");
    }

    const comments=await Comment.aggregate([
        {
            $match:{video:new mongoose.Types.ObjectId(videoID)}
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

    if(!comments){
        throw new ApiError(404,"comments not found");
    }

    return res.status(200).json(new ApiResponse(200,comments,"comments fetched successfully"))
})

const addComments=asyncHandler(async(req,res)=>{
    const {channelId,videoId}=req.params;
    const {content}=req.body;
    if(!channelId||!videoId){
        throw new ApiError(400,"channelId or VideoId is missing")
    }

    if(!content){
        throw new ApiError(400,"comment content is missing")
    }

    const comment=await Comment.create({
        content,
        video:videoId,
        owner:channelId
    })

    if(!comment){
        throw new ApiError(400,"error while creating comment")
    }

    return res.status(200).json(new ApiResponse(200,comment,"successfully commented"))
})

const deleteComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;

    if(!commentId){
        throw new ApiError(400,"comment Id is missing")
    }

    const deletedComment=await Comment.findByIdAndDelete(commentId);

    if(!deletedComment){
        throw new ApiError(400,"error deleting comment")
    }

    return res.status(200).json(new ApiResponse(200,deletedComment,"comment deleted successfully"))
})

const updateCommet=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    const {content}=req.body;

    if(!commentId || !content){
        throw new ApiError(400,"comment Id or content is missing")
    }
    const updatedComment= await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )

    if(!updatedComment){
        throw new ApiError(400,"error updating the comment")
    }
    return res.status(200).json(new ApiResponse(200,updatedComment,"comment updated successfully"))

})

export {getAllVideoComments,addComments,deleteComment,updateCommet}