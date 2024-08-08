const asyncHandler = require("express-async-handler");
const {NoticeModel, VaildateSignNotice}  = require("../models/Notice");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");



// ==================================
// @desc Sign user notice
// @route /api/notice/sigin
// @method POST
// @access public
// ==================================
module.exports.signUserNotice = asyncHandler(async (req , res) => {
    const {error} = VaildateSignNotice(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }

    // is user exist ?
    let user = await NoticeModel.findOne({email:req.body.email})
    if(user){
        return res.status(400).json({message:"هذا الاميل مشترك بخدمه الاشعارات بالفعل"})
    }

    // hash reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');


    // make new user
    user = new NoticeModel({
        name:req.body.name,
        email:req.body.email,
        class: req.body.class,
        passwordRestCode: hashResetCode,
        passwordRestExpires: Date.now() + 10 * 60 * 1000,
        passwordRestVerified: false,
    })

    // save to db
    await user.save()

    // send code for email
    try {
        await sendEmail({
            email: user.email,
            subject: "كود التفعيل الخاص بك صالح لمده 10 دقائق فقط",
            message: `
            <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">أهلاً ${user.name}</h2>
                <p style="font-size: 18px; color: #555;">هذا هو رمز التفعيل الخاص بك:</p>
                <h1 style="font-size: 36px; color: #007BFF;">${resetCode}</h1>
                <p style="font-size: 16px; color: #999;">صلاحيه كود التفعيل الخاص بك مده 10 دقائق فقط.</p>
                <p style="font-size: 14px; color: #aaa;">إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.</p>
            </div>
        `
        })
    } catch (err) {
        user.passwordRestCode = undefined
        user.passwordRestExpires = undefined
        user.passwordRestVerified = undefined

        await user.save();
    }

    res.status(201).json({message:"تم الاشتراك بخدمه الاشعارات قم بتاكيد الحساب من خلال الكود الذي وصل للاميل"})
})


// ==================================
// @desc Sign user notice
// @route /api/notice/sigin
// @method POST
// @access public
// ==================================
module.exports.verifieCode = asyncHandler(async(req , res) => {
    const hashResetCode = crypto.createHash('sha256').update(req.body.resetCode).digest('hex');
    const user = await NoticeModel.findOne({
        passwordRestCode:hashResetCode,
        passwordRestExpires: {$gt : Date.now()}
    })

    if(!user){
        return res.status(400).json({message: "الكود الذي تم ادخاله غير صالح او منتهي الصلاحيه "})
    }

    user.passwordRestVerified = true;
    await user.save();

    res.status(200).json({message: "تم تاكد الاشتراك بنجاح "})
})



// ==================================
// @desc Get all users
// @route /api/notice
// @method GET
// @access private (only admin)
// ==================================
module.exports.getAllUsers = asyncHandler(async(req , res) => {
    const users = await NoticeModel.find({})
    res.status(200).json({results:users.length});
})


// ==================================
// @desc felete user notice
// @route /api/notice/:id
// @method DELETE
// @access private (only admin)
// ==================================
module.exports.deleteUser = asyncHandler(async(req , res) => {
    const user = await NoticeModel.findById(req.params.id);
    if(!user){
        return res.status(404).json({message: "المستخدم غير متوفر او تم حذفه"})
    }

    await NoticeModel.findByIdAndDelete(req.params.id);

    res.status(200).json({message: "تم مسح المستخدم بنجاح"})
})