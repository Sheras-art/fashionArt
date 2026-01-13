import { asyncHandler } from "../utils/AsyncHandler.js";
import { apiResponse } from "../utils/ApiResponse.js";
import { apiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
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

    const { fullName, userName, email, password, phoneNumber } = req.body;

    if ([fullName, userName, email, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { userName: userName.toLowerCase() }]
    })

    if (existedUser) {
        throw new apiError(409, "User with email or password already exist")
    }

    const user = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        password,
        email,
        phoneNumber: phoneNumber ? phoneNumber : ""
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new apiError(500, "Something went wrong, While creating user")
    }

    return res
        .status(201)
        .json(new apiResponse(201, createdUser, "User Registered Successfullt"))

})

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

const logOutUser = asyncHandler(async()=>{

})

export { registerUser, loginUser };