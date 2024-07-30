import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleSubscription,getChannelSubs,getSubbedChannel } from "../controllers/subscription.controller.js";

const router=Router();
router.use(verifyJWT)

router.route("/:channelId").post(toggleSubscription)
router.route("/channel-subs/:channelId").post(getChannelSubs)
router.route("/subscribed-channels/:channelId").post(getSubbedChannel)


export default router
