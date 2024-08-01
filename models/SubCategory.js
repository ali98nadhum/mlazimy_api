const mongoose = require("mongoose");
const joi = require("joi");

const subCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      minlength: 10,
      maxlength: 200,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "CategoryModel",
      required: true,
    },

    image: {
      type: Object,
      required: true,
      default: {
        url: "",
        publicId: null,
      },
    },

    file: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
      required: true,
    },
  },
  { timestamps: true }
);

const subCategorysModel = mongoose.model("subCategorysModel",subCategorySchema);

// validate create subcategory
function validateCreateSubcategory(obj) {
    const schema = joi.object({
        title: joi.string().trim().required().min(5).max(200).messages({
            "string.base": `يجب أن يكون العنوان نصاً.`,
            "string.empty": `العنوان مطلوب.`,
            "string.min": `االعنوان قصير جدا`,
            "string.max": `العنوان طويل جدا`,
            "any.required": `العنوان مطلوب.`
        }),
        description: joi.string().trim().required().min(25).max(750).messages({
          'string.base': 'يجب أن تكون الوصف نصاً',
          'string.empty': 'الوصف مطلوب',
          'string.min': 'يجب أن يحتوي الوصف على عشر أحرف على الأقل',
          'string.max': 'يجب ألا يتجاوز الوصف 200 حرف',
          'any.required': 'الوصف مطلوب'
      }),
        category: joi.string().trim().required().messages({
            "string.empty": `يجب اختيار ماده لهذا المحاضره`,
            "any.required": `يجب اختيار ماده لهذا المحاضره`
        })
    });

    return schema.validate(obj);
}


// validate update subcategory
function validateUpdateSubcategory(obj) {
  const schema = joi.object({
      title: joi.string().trim().min(5).max(200).messages({
        "string.empty": `لا يمكن ان يكون العنوان فارغ`,
        "string.min": `االعنوان قصير جدا`,
        "string.max": `العنوان طويل جدا`,
    }),
    description: joi.string().trim().min(25).max(750).messages({
      'string.base': 'يجب أن تكون الوصف نصاً',
      'string.min': 'يجب أن يحتوي الوصف على عشر أحرف على الأقل',
      'string.max': 'يجب ألا يتجاوز الوصف 200 حرف',
  }),
      category: joi.string().trim()
  });

  return schema.validate(obj);
}

module.exports = {
  subCategorysModel,
  validateCreateSubcategory,
  validateUpdateSubcategory
};
