import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))

// provides us a limit on the json that is recieved via various mediums
app.use(express.json({
    limit:"16kb"
}))

// for encountering various types of url and they are handeled
app.use(express.urlencoded({
    // allows sending nested objects
    extended:true,
    limit:"16kb"
}))

// to utilise the files or images that are stored but are publically available for all
app.use(express.static("public"))

// allows access to cookie and also has a functionality regarding secure cookies...basically using cred operation
app.use(cookieParser())

import userRouter from"./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import communityRouter from "./routes/community.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"

app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/playlists",playlistRouter);
app.use("/api/v1/subscriptions",subscriptionRouter);
app.use("/api/v1/communities",communityRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/likes",likeRouter);

export default app;