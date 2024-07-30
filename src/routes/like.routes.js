import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleVideoLike,toggleCommentLike,getAllLikedVideos,toggleCommunityPostLike } from "../controllers/like.controller.js";

const router=Router();
router.use(verifyJWT)

router.route("/vid-like/:videoId").post(toggleVideoLike);
router.route("/comment-like/:commentId").post(toggleCommentLike);
router.route("/post-like/:postId").post(toggleCommunityPostLike);
router.route("/get-liked-vid").get(getAllLikedVideos);

export default router;