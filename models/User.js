const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Generate Auth Token
UserSchema.methods.generateAuthToken = function(){
    return jwt.sign({id:this._id , isAdmin:this.isAdmin , username:this.username} , process.env.JWT_SECRET , {
        expiresIn: "60d"
    })
}

const UserModel = mongoose.model("UserModel", UserSchema);


// Vaildate Register user
function VaildateRegisterUser(obj) {
    const schema = joi.object({
        username: joi.string().min(3).max(30).trim().required().messages({
            'string.base': 'اسم المستخدم يجب أن يكون نصًا',
            'string.empty': 'اسم المستخدم مطلوب',
            'string.min': 'اسم المستخدم قصير جدا',
            'string.max': 'اسم المستخدم طويل جدا',
            'any.required': 'اسم المستخدم مطلوب'
        }),
        email: joi.string().trim().email().required().messages({
            'string.base': 'البريد الإلكتروني يجب أن يكون نصًا',
            'string.empty': 'البريد الإلكتروني مطلوب',
            'string.email': 'يجب أن يكون بريدًا إلكترونيًا صالحًا',
            'any.required': 'البريد الإلكتروني مطلوب'
        }),
        password: joi.string().trim().min(8).required().messages({
            'string.base': 'كلمة المرور يجب أن تكون نصًا',
            'string.empty': 'كلمة المرور مطلوبة',
            'string.min': 'كلمه المرور قصيره يجب ان تكون 8 احرف على الاقل',
            'any.required': 'كلمة المرور مطلوبة'
        })
    });

    return schema.validate(obj);
}



// Vaildate login user
function VaildateLoginUser(obj){
    const schema = joi.object({
        email: joi.string().trim().email().required().messages({
            'string.base': 'البريد الإلكتروني يجب أن يكون نصًا',
            'string.empty': 'البريد الإلكتروني مطلوب',
            'string.email': 'يجب أن يكون بريدًا إلكترونيًا صالحًا',
            'any.required': 'البريد الإلكتروني مطلوب'
        }),
        password: joi.string().trim().required().messages({
            'string.base': 'كلمة المرور يجب أن تكون نصًا',
            'string.empty': 'كلمة المرور مطلوبة',
            'any.required': 'كلمة المرور مطلوبة'
        })
    })

    return schema.validate(obj)
}

module.exports = {
  UserModel,
  VaildateRegisterUser,
  VaildateLoginUser
};
