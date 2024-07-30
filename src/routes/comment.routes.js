import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComments, deleteComment, getAllVideoComments, updateCommet } from "../controllers/comment.controller.js";
``
const router=Router()

router.route("/create/:channelId/:videoId").post(verifyJWT,addComments);
router.route("/vid-comments/:videoID").get(verifyJWT,getAllVideoComments);
router.route("/delete-comment/:commentId").post(verifyJWT,deleteComment);
router.route("/update-comment/:commentId").post(verifyJWT,updateCommet);

export default router