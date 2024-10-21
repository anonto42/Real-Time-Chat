import express from "express";
import { getUserProfile, login, logout, newUser } from "../controllers/user.controller.js";
import { singleAvatarUpload } from "../middlewares/multer.js";
import isAuthenticated from "../middlewares/auth.js";

const route = express.Router();

route.route("/login").post( login )

route.route("/logout").post( logout )

route.route("/userCreate").post( singleAvatarUpload , newUser )

route.route("/user").post( isAuthenticated , getUserProfile )

export { route }