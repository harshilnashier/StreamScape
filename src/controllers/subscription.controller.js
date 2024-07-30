import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {Subscription} from "../models/subscription.models.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(400,"Channel id is missing")
    }

    const subscription=await Subscription.findOne(

        {
            channel:channelId,
            subscriber:req.user._id
        }
    )


    if(!subscription){
        
        await Subscription.create({
            channel:channelId,
            subscriber:req.user._id
        })

    }else{
        await Subscription.findByIdAndDelete(subscription._id);
    }
    
    let isSub;
    const newSubscription=await Subscription.findOne(
        {
            channel:channelId,
            subscriber:req.user._id
        }
    )


    if(!newSubscription){
        isSub=false;
    }else{
        isSub=true;
    }

    return res.status(200).json(new ApiResponse(200,isSub,"Subscription toggled"))
})

const getChannelSubs=asyncHandler(async(req,res)=>{
    const {channelId}=req.params;
    if(!channelId){
        throw new ApiError(400,"Channel Not found")
    }

    const channelSubs=await Subscription.aggregate([
        {$match:{channel:new mongoose.Types.ObjectId(channelId)}},

        {$lookup:
            {
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber",
                pipeline:[
                    {$project:{
                        username:1,
                        avatar:1,
                        fullName:1
                    }}
                ]
            }    
        },
        {
            $project:{
                subscriber:1,
                createdAt:1
            }
        }

    ])
    return res.status(200).json(new ApiResponse(200,channelSubs,"Channels Subscribers fetched"));
})

const getSubbedChannel=asyncHandler(async(req,res)=>{

    const {channelId}=req.params;

    if(!channelId){
        throw new ApiError(400,"Sub Not found")
    }

    const subChannels= await Subscription.aggregate([
        {
            $match:{subscriber:new mongoose.Types.ObjectId(channelId)}
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel",
                pipeline:[{
                    $project:{
                        username:1,
                        fullName:1,
                        avatar:1
                    }
                }]
            }
        },
        {
            $project:{
                channel:1,
                createdAt:1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,subChannels,"Subbed channels fetched"))

})

export {  toggleSubscription,getChannelSubs,getSubbedChannel}