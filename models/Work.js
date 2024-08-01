const mongoose = require("mongoose");
const joi = require("joi");

const WorkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      minlength: 25,
      maxlength: 750,
    },
    image: {
      type: Object,
      required: true,
      default: {
        url: "",
        publicId: null,
      },
    },
    link: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const WorkModel = mongoose.model("WorkModel", WorkSchema);

function validateCreateWork(obj) {
    const schema = joi.object({
        title: joi.string().trim().required().min(10).max(100).messages({
            'string.base': 'يجب أن يكون العنوان نصاً',
            'string.empty': 'العنوان مطلوب',
            'string.min': 'يجب أن يحتوي العنوان على 10 أحرف على الأقل',
            'string.max': 'يجب ألا يتجاوز العنوان 100 حرف',
            'any.required': 'العنوان مطلوب'
        }),
        description: joi.string().trim().required().min(25).max(750).messages({
            'string.base': 'يجب أن تكون الوصف نصاً',
            'string.empty': 'الوصف مطلوب',
            'string.min': 'يجب أن يحتوي الوصف على 25 حرف على الأقل',
            'string.max': 'يجب ألا يتجاوز الوصف 750 حرف',
            'any.required': 'الوصف مطلوب'
        }),
        link: joi.string().required().messages({
            'string.base': 'يجب أن يكون الرابط نصاً',
            'string.empty': 'الرابط مطلوب',
            'any.required': 'الرابط مطلوب'
        })
    });

    return schema.validate(obj);
}



function validateUpdateWork(obj) {
    const schema = joi.object({
        title: joi.string().trim().min(10).max(100).messages({
            'string.base': 'يجب أن يكون العنوان نصاً',
            'string.min': 'يجب أن يحتوي العنوان على 10 أحرف على الأقل',
            'string.max': 'يجب ألا يتجاوز العنوان 100 حرف',
        }),
        description: joi.string().trim().min(25).max(750).messages({
            'string.base': 'يجب أن تكون الوصف نصاً',
            'string.min': 'يجب أن يحتوي الوصف على 25 حرف على الأقل',
            'string.max': 'يجب ألا يتجاوز الوصف 750 حرف',
        }),
        link: joi.string().messages({
            'string.base': 'يجب أن يكون الرابط نصاً',
        })
    });

    return schema.validate(obj);
}

module.exports = {
  WorkModel,
  validateCreateWork,
  validateUpdateWork
};
