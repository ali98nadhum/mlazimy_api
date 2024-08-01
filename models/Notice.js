const mongoose = require("mongoose");
const joi = require("joi");




const NoticeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      minlength: 6,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },

    class: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D", "E", "F", "مسائي"],
    },
    passwordRestCode: String,
    passwordRestExpires: Date,
    passwordRestVerified: Boolean,
  },
  { timestamps: true }
);

const NoticeModel = mongoose.model("NoticeModel", NoticeSchema);

// Vaildate sgin user for notice
function VaildateSignNotice(obj) {
    const schema = joi.object({
      name: joi.string().trim().required().min(6).max(30).messages({
        'string.base': 'يجب أن يكون الاسم نصاً',
        'string.empty': 'الاسم مطلوب',
        'string.min': 'يجب أن يحتوي الاسم على 6 أحرف على الأقل',
        'string.max': 'يجب ألا يتجاوز الاسم 30 حرفًا',
        'any.required': 'الاسم مطلوب'
      }),
      email: joi.string().trim().email().required().custom((value, helpers) => {
        const domain = value.split('@')[1];
        if (!domain.endsWith('gmail.com')) {
          return helpers.message('البريد الالكتروني الموقت غير مسموح');
        }
        return value;
      }).messages({
        'string.base': 'يجب أن يكون البريد الإلكتروني نصاً',
        'string.email': 'يجب أن يكون البريد الإلكتروني صالحًا',
        'string.empty': 'البريد الإلكتروني مطلوب',
        'any.required': 'البريد الإلكتروني مطلوب'
      }),
      class: joi.string().required().valid("A", "B", "C", "D", "E", "F", "مسائي").messages({
        'string.base': 'يجب أن تكون الفئة نصاً',
        'any.only': 'A , B , C , D , E , F , Evening يرجى اختيار واحده من الشعب التاليه',
        'any.required': 'اختيار الشعبه مطلوب'
      })
    });
  
    return schema.validate(obj);
  }

module.exports = { 
    NoticeModel,
    VaildateSignNotice
 };
