const mongoose = require("mongoose");
const joi = require("joi");

// Category Schema
const CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "اسم الماده مطلوب"],
      unique: true,
      trim: true,
      minlength: [3, "الاسم قصير جدا"],
      maxlength: [50, "الاسم طويل جدا"],
    },

    image: {
      type: Object,
      required: [true, "الصوره مطلوبه"],
      default: {
        url: "",
        publicId: null,
      },
    },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model("CategoryModel", CategorySchema);

// Vaildate create category
function VaildateCreatCategory(obj){
    const schema = joi.object({
      title: joi.string().trim().required().min(3).max(50).messages({
        "string.base": `يجب ان تكون اسم الماده نص.`,
        "string.empty": `اسم الماده مطلوب.`,
        "string.min": `الاسم قصير جدا.`,
        "string.max": `الاسم طويل جدا.`,
        "any.required": `اسم الماده مطلوب.`
      })
    })
  
    return schema.validate(obj)
  }


  // Vaildate update category
function VaildateUpdateCategory(obj){
    const schema = joi.object({
      title: joi.string().trim().min(3).max(50).messages({
        "string.base": `يجب ان تكون اسم الماده نص.`,
        "string.empty": `اسم الماده مطلوب.`,
        "string.min": `الاسم قصير جدا.`,
        "string.max": `الاسم طويل جدا.`,
      })
    })
  
    return schema.validate(obj)
  }

module.exports = {
  CategoryModel,
  VaildateCreatCategory,
  VaildateUpdateCategory
};
