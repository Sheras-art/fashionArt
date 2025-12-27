const registerUser = async (req, resp)=>{
    return resp.status(200).json({
        message: "ok"
    })
}

export {registerUser};