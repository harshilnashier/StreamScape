import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos,getVideobyID,updateVideo,uploadVideo,deleteVideo,togglePublish } from "../controllers/video.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router=Router();

router.route("/").get(getAllVideos);

router.route("/publish-video").post( verifyJWT,
    upload.fields(
    [
        {name:"thumbnail", maxCount:1},
        {name:"videoFile", maxCount:1}
    ]
) ,uploadVideo);

router.route("/vid/:videoId").get(getVideobyID);

router.route("/update-video/:videoId").post(verifyJWT,upload.single("thumbnail"),updateVideo);

router.route("/delete/:videoId").post(verifyJWT, deleteVideo);

router.route("/publish-status/:videoId").post(verifyJWT, togglePublish);

export default router

