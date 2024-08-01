const asyncHandler = require("express-async-handler");
const path = require("path");
const {
  CategoryModel,
  VaildateCreatCategory,
  VaildateUpdateCategory,
} = require("../models/Category");
const fs = require("fs");
const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
} = require("../utils/cloudinary");
const { subCategorysModel } = require("../models/SubCategory");
const { deleteFile , authorize } = require("../utils/googleDrive");



// ==================================
// @desc Get all category
// @route /api/category
// @method GET
// @access public
// ==================================
module.exports.getAllCategorys = asyncHandler(async (req, res) => {
  const categorys = await CategoryModel.find();
  res.status(200).json({ data: categorys });
});


// ==================================
// @desc Get category by id
// @route /api/category/:id
// @method GET
// @access public
// ==================================
module.exports.getOneCategory = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1; 
  const limit = req.query.limit * 1 || 6; 
  const skip = (page - 1) * limit;

  const category = await CategoryModel.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "لا توجد ماده لهذا المعرف" });
  }

  const subcategories = await subCategorysModel
    .find({ category: req.params.id })
    .skip(skip)
    .limit(limit);

  const totalSubcategories = await subCategorysModel.countDocuments({ category: req.params.id });

  res.status(200).json({ data: category, subcategories, total: totalSubcategories });
});



// ==================================
// @desc Creat new category
// @route /api/category
// @method POST
// @access Private (only admin)
// ==================================
module.exports.createNewCategory = asyncHandler(async (req, res) => {
  // validtion if not found image
  if (!req.file) {
    return res.status(400).json({ message: "قم بوضع صوره" });
  }

  // validtion input data
  const { error } = VaildateCreatCategory(req.body);
  if (error) {
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    fs.unlinkSync(imagePath);
    return res.status(400).json({ message: error.details[0].message });
  }

  // Check if category title is unique
  const existingCategory = await CategoryModel.findOne({
    title: req.body.title,
  });
  if (existingCategory) {
    fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: "اسم الماده موجود بالفعل. يرجى اختيار اسم مختلف." });
  }

  // Upload image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // save category to DB
  const category = await CategoryModel.create({
    title: req.body.title,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  // send res to client
  res.status(201).json({ message: "تم اضافه الماده بنجاح" });

  // Remov image from local server
  fs.unlinkSync(imagePath);
});



// ==================================
// @desc Update category
// @route /api/category/:id
// @method PUT
// @access private (only admin)
// ==================================
module.exports.updateCategory = asyncHandler(async (req, res) => {
  // vaildation input data from user
  const { error } = VaildateUpdateCategory(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const updateData = {};
  // update title
  if (req.body.title) {
    updateData.title = req.body.title;
  }

  // update category image
  if (req.file) {
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);
    updateData.image = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    // delete the old image if found
    const category = await CategoryModel.findById(req.params.id);
    if (category.image.publicId !== null) {
      await cloudinaryDeleteImage(category.image.publicId);
    }
    // delete image from local server
    fs.unlinkSync(imagePath);
  }
  // update category in DB
  const updatedCategory = await CategoryModel.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true }
  );

  // send res from user
  res.status(200).json(updatedCategory);
});




// ==================================
// @desc delete category
// @route /api/category/:id
// @method DELETE
// @access private (only admin)
// ==================================
module.exports.deleteCategory = asyncHandler(async (req, res) => {
  // Get category from DB
  const category = await CategoryModel.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "لا يوجد ماده بهذا المعرف" });
  }

  // Get all subcategories related to this category
  const subcategories = await subCategorysModel.find({ category: req.params.id });

  // Get Google Drive authorization
  const authClient = await authorize();

  // Delete images of all subcategories from Cloudinary
  for (const subcategory of subcategories) {
    if (subcategory.image && subcategory.image.publicId) {
      await cloudinaryDeleteImage(subcategory.image.publicId);
    }
    if (subcategory.file && subcategory.file.publicId) {
      await deleteFile(authClient, subcategory.file.publicId);
    }
  }

  // Delete all subcategories from DB
  await subCategorysModel.deleteMany({ category: req.params.id });

  // delete the image from cloudnary
  await cloudinaryDeleteImage(category.image.publicId);
  

  // delete category from db
  await CategoryModel.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "تم حذف الماده بنجاح" });
});



