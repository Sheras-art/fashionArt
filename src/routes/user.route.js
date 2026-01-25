import { Router } from "express";
import { 
    addUserAddress, 
    assignUserRole, 
    changeUserPassword, 
    deleteUserAddress, 
    editUserDetails, 
    getCurrentUser, 
    getUserAddresses, 
    loginUser, 
    logOutUser, 
    registerUser, 
    setDefaultUserAddress, 
    transferOwnership, 
    updateUserAddress } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlerwares/auth.middleware.js";
import authorizeRoles from "../middlerwares/authorizeRoles.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);

// Secured routes for user can be added here

userRouter.route("/logout").post(verifyJWT, logOutUser);
userRouter.route("/change-password").post(verifyJWT, changeUserPassword);
userRouter.route("/edit-user-details").post(verifyJWT, editUserDetails);
userRouter.route("/current-user").post(verifyJWT, getCurrentUser);
userRouter.route("/add-user-address").post(verifyJWT, addUserAddress);
userRouter.route("/delete-user-address").post(verifyJWT, deleteUserAddress);
userRouter.route("/user-addresses").post(verifyJWT, getUserAddresses);
userRouter.route("/update-user-address").post(verifyJWT, updateUserAddress);
userRouter.route("/set-default-user-address").post(verifyJWT, setDefaultUserAddress);
userRouter.route("/assign-user-role").post(verifyJWT, authorizeRoles("owner"), assignUserRole);
userRouter.route("/transfer-ownership").post(verifyJWT, authorizeRoles("owner"), transferOwnership);

export { userRouter }