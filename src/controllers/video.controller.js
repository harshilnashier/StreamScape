import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js";


const getAllVideos=asyncHandler(async(req,res)=>{
    const {page=1,limit=10,query,sortBy,sortType,userId}=req.query

    let sortCriteria={}
    let videoQuery={}
    
    if(userId){
        videoQuery.userId=userId
    }
    if(query){
        videoQuery.$or=[
            {
                title:{$regex:query,$options:'i'}  
            },
            {
                description:{$regex:query,$options:'i'}
            }
        ]
    }
    if(sortBy && sortType){
        sortCriteria[sortBy]=sortType==="desc"?-1:1
    }

    const video=await Video.find(videoQuery).sort(sortCriteria).skip((page-1)*limit).limit(limit);
    if(!video){
        throw new ApiError(400,"error while fetching all videos");
    }
    return res.status(200).json(new ApiResponse(200,video,"fetched all videos"));
})

const uploadVideo=asyncHandler(async(req,res)=>{
    const {title,description}=req.body;
    const vidLocalPath=req.files?.videoFile[0]?.path
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path
    
    if(!title){
        throw new ApiError(400,"video title missing");
    }
    if(!vidLocalPath){
        throw new ApiError(400,"video missing");
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail missing");
    }

    const uploadedVideo=await uploadOnCloudinary(vidLocalPath);
    const uploadedThumbnail=await uploadOnCloudinary(thumbnailLocalPath);

    if(!uploadedVideo){
        throw new ApiError(400,"error uploading video");
    } 
    if(!uploadedThumbnail){
        throw new ApiError(400,"error uploading thumbnail");
    } 
    const video=await Video.create({
        title,
        description:description||"",
        thumbnail:uploadedThumbnail.url,
        videoFile:uploadedVideo.url,
        duration:uploadedVideo.duration
    })
    video.owner=req.user?._id;
    video.save();
    return res.status(200).json(new ApiResponse(200,video,"video uploaded successfully"));

})

const getVideobyID=asyncHandler(async(req,res)=>{
     const{videoId}=req.params;

    if (!videoId) {
        throw new ApiError(400,"video id is missing")
    }

    const video = await Video.findById(videoId);
    
    if (!video) {
        throw new ApiError(500,"error while fetching video")
    }

    return res.status(200).json(new ApiResponse(200,video,"video fetched"))

})

const updateVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const {title,description}=req.body;

    if(!videoId){
        throw new ApiError(400,"videoId missing");
    }

    if(!title && !description){
        throw new ApiError(400,"title and description needed");      
    }
    const thumbnailLocalPath=req.file?.path;
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail file needed");      
    }
    const uploadedThumbnail=await uploadThumbNailOnCloudinary(thumbnailLocalPath);
    if(!uploadedThumbnail){
        throw new ApiError(400,"error uploading thumbnail");
    }
    const video=await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail:uploadedThumbnail.url
            }
        },
        {
            new:true
        }
    )
    if(!video){
        throw new ApiError(400,"error updating video");
    }

    return res.status(200).json(new ApiResponse(200,video,"video updated successfully"));
})

const deleteVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(400,"videoId needed");
    }
    const video=await Video.findByIdAndDelete(videoId);

    if(!video){
        throw new ApiError(400,"error deleting video");
    }

    return res.status(200).json(new ApiResponse(200,video,"video deleted successfully"));
})

const togglePublish=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;

    if(!videoId){
        throw new ApiError(400,"videoId needed");
    }

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"error toggling publish");
    }
    video.isPublished=!video.isPublished;
    await video.save()

    return res.status(200).json(new ApiResponse(200,video,"video publish toggled successfully"));

})

export {getAllVideos,getVideobyID,updateVideo,uploadVideo,deleteVideo,togglePublish}
