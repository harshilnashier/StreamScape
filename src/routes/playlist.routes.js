import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPlaylist,addVideos,getPlaylist,getUserPlaylists,deletePlaylist,updatePlaylist,removeVideo } from "../controllers/playlist.controller.js";

const router=Router();

router.route("/").post(verifyJWT,createPlaylist);

router.route("/add-videos/:playlistId/:videoId").post(verifyJWT,addVideos);

router.route("/get-playlist/:playlistId").get(verifyJWT,getPlaylist);

router.route("/get-user-playlist/:userId").get(verifyJWT,getUserPlaylists);

router.route("/delete-playlist/:playlistID").post(verifyJWT,deletePlaylist);

router.route("/update-playlist/:playlistId").post(verifyJWT,updatePlaylist);

router.route("/remove-video/:playlistId/:videoId").post(verifyJWT,removeVideo);

export default router