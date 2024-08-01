const asyncHandler = require('express-async-handler');
const bcrypt = require("bcryptjs");
const {UserModel, VaildateRegisterUser, VaildateLoginUser} = require("../models/User")


// ==================================
// @desc Register New User
// @route /api/auth/register
// @method POST
// @access Private (only admin)
// ==================================
module.exports.registerAdmin = asyncHandler(async(req , res) =>{
    // validation user data
    const {error} = VaildateRegisterUser(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    }

    // is user exist ?
    let user = await UserModel.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({message:"هذا المستخدم موجود بالفعل"})
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password , salt);

    // make new user
    user = new UserModel({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword
    })

    // save user in DB
    await user.save();

    res.status(200).json({message: "تم التسجيل بنجاح"})
})


// ==================================
// @desc Login user
// @route /api/auth/login
// @method POST
// @access Public
// ==================================
module.exports.login = asyncHandler(async (req , res) => {
    // 1- Validation
    const {error} = VaildateLoginUser(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }

    // 2- is user exist ?
    const user = await UserModel.findOne({email:req.body.email});
    if(!user){
        return res.status(400).json({message:"خطا في الاميل او كلمه السر"})
    }

    // 3- check the password
    const isPasswordMatch = await bcrypt.compare(req.body.password , user.password);
    if(!isPasswordMatch){
        return res.status(400).json({message:"خطا في الاميل او كلمه السر"})
    }

    // 4- Generate token
    const token = user.generateAuthToken();

    res.status(200).json({
        _id:user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        token
    })
})