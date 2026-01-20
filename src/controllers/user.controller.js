import { asyncHandler } from "../utils/AsyncHandler.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { apiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { Address } from "../models/address.model.js";
import { MAX_ADDRESS_PER_USER } from "../constants.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        console.log("refresh token saved to data base");

        return { accessToken, refreshToken };

    } catch (error) {
        console.error(error);

        throw new apiError(500, "Something went wrong, While generating Access and Resfresh Token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // user register todo's

    // take info from user
    // validation like not empty fields
    // check if user already register
    // create user object - and then create new entry in database
    // remove password and refreshToken fields from response
    // check for user creation
    // return resonse

    console.log(req.body);
    const { fullName, userName, email, password, phoneNumber } = req.body;



    if ([fullName, userName, email, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { userName: userName?.toLowerCase() }]
    })

    if (existedUser) {
        throw new apiError(409, "User with email or username already exist")
    }

    const user = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        password,
        email,
        phoneNumber: phoneNumber ? phoneNumber : ""
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new apiError(500, "Something went wrong, While creating user")
    }
    console.log(createdUser, "User Registered Successfully✅");
    return res
        .status(201)
        .json(new apiResponse(201, createdUser, "User Registered Successfullt"))
});

const loginUser = asyncHandler(async (req, res) => {
    // user login todo's

    // get data from the user
    // find user by both email and username
    // check if user exist
    // if exist check password is correct
    // if password is correct generate Access and Refresh Token
    // after this remove password and refresh token fields from response
    // and also send them to user in cookies

    const { email, userName, password } = req.body

    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (!user) {
        throw new apiError(400, "User not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, {
        $set: { isActive: true }
    });

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");



    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        },
            "User LoggedIN Successfully"
        ))
})

const logOutUser = asyncHandler(async (req, res) => {
    const user = req.user;

    const updatedUser = await User.findByIdAndUpdate(user._id, {
        $unset: { refreshToken: 1 },
        $set: { isActive: false }
    });

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new apiResponse(200, {}, "User Logout Successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies?.refreshAccessToken || req.body.refreshToken;

    if (!incomingToken) {
        throw new apiError(400, "Unauthorized Request")
    }

    const decodedToken = jwt.verify(incomingToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new apiError(404, "User not found")
    }

    if (!(incomingToken === user?.refreshToken)) {
        throw new apiError(401, "Invalid refresh token")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(200, {
            accessToken,
            refreshToken
        }, "Access Token Generated Successfully"))
})

const changeUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new apiError(400, "All fields are required")
    }

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid old password")
    }
    if (oldPassword === newPassword) {
        throw new apiError(400, "New password must be different from old password")
    }

    user.password = newPassword;
    await user.save({
        validateBeforeSave: false
    });

    res.status(200)
        .json(new apiResponse(200, {}, "Password changed successfully"))
})

const editUserDetails = asyncHandler(async (req, res) => {
    // edit user details todo's

    // get new user details from user
    // validate new user details
    // check if email or username already exist
    // update user details in database
    // return response to user

    const { fullName, userName, email, phoneNumber } = req.body;

    if ([fullName, userName, email, phoneNumber].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { userName: userName.toLowerCase() }],
        _id: { $ne: req.user._id }
    });

    if (existedUser) {
        throw new apiError(409, "User with email or username already exist");
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        fullName,
        userName: userName.toLowerCase(),
        email,
        phoneNumber,
    }, { new: true }).select("-password -refreshToken");

    res.status(200)
        .json(new apiResponse(200, updatedUser, "User details updated successfully"));

});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(new apiResponse(200, req.user, "Current user fetched successfully"))
});

const addUserAddress = asyncHandler(async (req, res) => {
    // add user address todo's

    // get address info from user
    // validate address fields
    // create address object and save to database
    // return response to user

    const { fullName, phoneNumber, street, city, state, postalCode, country, type, isDefault } = req.body;

    if (!fullName || !phoneNumber || !street || !city || !state || !postalCode || !country) {
        throw new apiError(400, "(fullName, phoneNumber, street, city, state, postalCode, country) All fields are required")
    }

    const addressesLimit = await Address.countDocuments({ user: req.user._id });
    if (addressesLimit >= MAX_ADDRESS_PER_USER) {
        throw new apiError(400, "Maximum address limit reached")
    }

    const userAddress = await Address.create({
        fullName,
        phoneNumber,
        street,
        city,
        state,
        country,
        postalCode,
        type: type ? type : "shipping",
        isDefault: isDefault ? isDefault : false,
        user: req.user._id
    });

    await User.findByIdAndUpdate(req.user._id, {
        $push: { Addresses: userAddress._id }
    })

    res.status(201)
        .json(new apiResponse(201, userAddress, "Address added successfully"));
});

const setDefaultUserAddress = asyncHandler(async (req, res) => {
    // set default user address todo's

    // get address id from user
    // validate address id
    // check if address exist and belong to user
    // set all other addresses isDefault to false
    // set selected address isDefault to true
    // return response to user

    const addressId = req.body._id;
    const userId = req.user._id;

    if (!addressId || addressId.trim() === "") {
        throw new apiError(400, "Address ID is required")
    }

    const checkAddressWithUser = await Address.findOne({ _id: new mongoose.Types.ObjectId(addressId), user: userId });

    if (!checkAddressWithUser) {
        throw new apiError(404, "Address not found")
    }

    //set all other addresses isDefault to false

    await Address.updateMany({
        user: userId,
    }, {
        $set: { isDefault: false }
    })

    // set selected address isDefault to true

    await Address.updateOne({
        user: userId,
        _id: new mongoose.Types.ObjectId(addressId)
    }, {
        $set: { isDefault: true }
    },)

    res.status(200)
        .json(new apiResponse(200, {}, "Default address set successfully"));
});

const updateUserAddress = asyncHandler(async (req, res) => {
    // update user address todo's

    // get address id and new address info from user
    // validate address id and new address fields
    // check if address exist and belong to user
    // update address info in database
    // return response to user

    const addressId = req.body._id;
    const userId = req.user._id;
    const { fullName, phoneNumber, street, city, state, postalCode, country, type, isDefault } = req.body;

    if (!fullName || !phoneNumber || !street || !city || !state || !postalCode || !country) {
        throw new apiError(400, "(fullName, phoneNumber, street, city, state, postalCode, country) All fields are required")
    }

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
        throw new apiError(400, "Invalid address ID")
    }

    const checkAddressWithUser = await Address.findOne({ _id: addressId, user: userId });

    if (!checkAddressWithUser) {
        throw new apiError(404, "Address not found")
    }

    const updateAddress = await Address.findOneAndUpdate({
        _id: addressId, user: userId
    }, {
        fullName,
        phoneNumber,
        street,
        city,
        state,
        postalCode,
        country,
        type: type ? type : "shipping",
        isDefault: isDefault ? isDefault : false,
    })

    res.status(200)
        .json(new apiResponse(200, updateAddress, "Address updated successfully"));

});

const deleteUserAddress = asyncHandler(async (req, res) => {
    // delete user address todo's

    // get address id from user
    // validate address id
    // check if address exist and belong to user
    // delete address from database
    // return response to user

    const { _id } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw new apiError(400, "Invalid address ID");
    }

    const existingAddress = await Address.findOne({ _id: _id, user: userId });

    if (!existingAddress) {
        throw new apiError(404, "Address not found");
    }

    await Address.findOneAndDelete({ _id: _id, user: userId });

    await User.findByIdAndUpdate(userId, {
        $pull: { Addresses: existingAddress._id }
    });

    res.status(200)
        .json(new apiResponse(200, {}, "Address deleted successfully"));
});

const getUserAddresses = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).populate("Addresses");
    if (!user) {
        throw new apiError(404, "User not found");
    }

    return res.status(200)
        .json(new apiResponse(200, user.Addresses, "User addresses fetched successfully"))
});

const assignUserRole = asyncHandler(async (req, res) => {
    // assign user role todo's

    // get user id and role
    // validate user id and role
    // check if user exist
    // assign role to user
    // return response

    const { _id, role } = req.body;
    
    if (!_id || !role) {
        throw new apiError(400, "User id and role are reuired")
    }

    const existingOwner = await User.findOne({ role: "owner" });
    if (!existingOwner._id.equals(req.user._id)) {
        throw new apiError(403, "Only owner can assign roles");
    }

    const allowedRoles = ["user", "admin", "owner"];
    if (!allowedRoles.includes(role)) {
        throw new apiError(400, "Invalid role")
    }
    if (role === "owner") {
        const existingOwner = await User.findOne({ role: "owner" });
        if (existingOwner) {
            throw new apiError(409, "Owner already exists");
        }
    }
    if (req.user._id.toString() === _id) {
        throw new apiError(400, "You cannot change your own role")
    }

    const user = await User.findById(_id);
    if (!user) {
        throw new apiError(404, "User not found")
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.status(200)
        .json(new apiResponse(200, {}, "User role updated successfully"))
});

const transferOwnership = asyncHandler(async (req, res) => {

    const { newOwnerId } = req.body;

    if (!newOwnerId) {
        throw new apiError(400, "New owner ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(newOwnerId)) {
        throw new apiError(400, "Invalid new owner ID");
    }

    const newOwner = await User.findById(newOwnerId);

    if (!newOwner) {
        throw new apiError(404, "New owner userId not found");
    }

    const currentOwner = await User.findOne({ role: "owner" });

    if (!currentOwner) {
        throw new apiError(404, "Current owner not found");
    }

    if (!req.user._id.equals(currentOwner._id)) {
        throw new apiError(403, "You are not the current owner");
    }

    if (currentOwner._id.equals(newOwner._id)) {
        throw new apiError(400, "New owner is the same as current owner");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        currentOwner.role = "admin";
        await currentOwner.save({ session, validateBeforeSave: false });

        newOwner.role = "owner";
        await newOwner.save({ session, validateBeforeSave: false });

        await session.commitTransaction();
        session.endSession();

        res.status(200)
            .json(new apiResponse(200, {}, "Ownership transferred successfully"));

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        throw new apiError(500, "Something went wrong while transferring ownership");

    } finally {
        session.endSession();
    }
});

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeUserPassword,
    getCurrentUser,
    addUserAddress,
    setDefaultUserAddress,
    updateUserAddress,
    getUserAddresses,
    deleteUserAddress,
    editUserDetails,
    assignUserRole,
    transferOwnership
};