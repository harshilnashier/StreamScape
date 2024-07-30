import { Router } from "express";
import {  updatePost,deletePost,createCommunityPost,getAllCommunityPost,getChannelPost } from "../controllers/community.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();
router.route("/").post(verifyJWT,createCommunityPost);
router.route("/all-post").get(verifyJWT,getAllCommunityPost);
router.route("/channel-post/:channelId").get(verifyJWT, getChannelPost);
router.route("/delete-post/:postId").post(verifyJWT,deletePost);
router.route("/update-post/:postId").post(verifyJWT,updatePost)

export default router