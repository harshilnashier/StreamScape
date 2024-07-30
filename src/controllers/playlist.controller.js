import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const createPlaylist=asyncHandler(async(req,res)=>{

    const {name,description}=req.body;
    if(!name){
        throw new ApiError(400,"Name is required")
    }
    const playlist= await Playlist.create({
        name,
        description,
        owner:req.user._id
    })

    if(!playlist){
        throw new ApiError(200,"error while creating playlist")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"playlist created"))
})

const addVideos=asyncHandler(async(req,res)=>{
    const {playlistID,videoID}=req.params;
    
    console.log(playlistID);
    console.log(videoID);
    
    if(!videoID|| !playlistID){
        throw new ApiError(400,"video and playlist Id is required")
    }
    const playlist=await Playlist.findById(playlistID);

    if(!playlist){
        throw new ApiError(404,"playlist not found")
    }
    if(!playlist?.video?.includes(videoID)){
        playlist.video.push(videoID);
        await playlist.save()
    }
    return res.status(200).json(new ApiResponse(200,playlist,"video added successfully"))
})

const getPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;

    if(!playlistId){
        throw new ApiError(400," playlist Id is required")
    }

    const playlist=await Playlist.aggregate(
        [
            {
                $match: { _id : new mongoose.Types.ObjectId(playlistId)}
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"video",
                    foreignField:"id",
                    as:"video"
                }
            }
        ]
    )
    if(!playlist?.length){
        throw new ApiError(404,"playlist not found here")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"playlist fetched successfully"))

})

const getUserPlaylists=asyncHandler(async(req,res)=>{
    const {userId}=req.params;

    if(!userId){
        throw new ApiError(400," user Id is required")
    }

    const playlist=await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                    from:"videos",
                    localField:"video",
                    foreignField:"id",
                    as:"video"
            }
        }
    ])
    if(!playlist.length){
        throw new ApiError(404,"no playlist found ")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"user playlist fetched successfully"))
})

const deletePlaylist=asyncHandler(async(req,res)=>{
    const {playlistID}=req.params;
    if(!playlistID){
        throw new ApiError(400," playlist Id is required")
    }
    const playlist=await Playlist.findByIdAndDelete(playlistID);
    if(!playlist){
        throw new ApiError(400," error deleting the playlist")
    }
    return res.status(200).json(new ApiResponse(200,playlist," playlist deleted successfully"))

})

const updatePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    if(!playlistId){
        throw new ApiError(400," playlist Id is required")
    }

    const {name,description}=req.body;

    if(!name){
        throw new ApiError(400,"Name is required")
    }

    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description:description||""
            }
        },
        {
            new:true
        }
    )
    if(!playlist){
        throw new ApiError(400," error updating the playlist")
    }
    return res.status(200).json(new ApiResponse(200,playlist," playlist updated successfully"))

})

const removeVideo=asyncHandler(async(req,res)=>{
    const {playlistId, videoId} = req.params;

    if(!videoId || !playlistId ){
        throw new ApiError(400,"playlist id or video id is missing")
    }

    const playlist = await Playlist.findById(playlistId);

    playlist.video = playlist.video.filter( item => item != videoId);
    await playlist.save();

    return res.status(200).json(new ApiResponse(200,playlist," video removed successfully"));

})

export{createPlaylist,addVideos,getPlaylist,getUserPlaylists,deletePlaylist,updatePlaylist,removeVideo}