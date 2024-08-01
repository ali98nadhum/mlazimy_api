const asyncHandler = require("express-async-handler");
const {
  subCategorysModel,
  validateCreateSubcategory,
  validateUpdateSubcategory,
} = require("../models/SubCategory");
const fs = require("fs");
const { CategoryModel } = require("../models/Category");
const { cloudinaryUploadImage, cloudinaryDeleteImage } = require("../utils/cloudinary");
const {uploadsFile , deleteFile , authorize} = require("../utils/googleDrive")
const path = require("path");



// ==================================
// @desc Get all subcategory
// @route /api/subcategory
// @method GET
// @access public
// ==================================
module.exports.getAllSubcategory = asyncHandler(async (req, res) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 6 || 6;
    const skip = (page-1) * limit;
  const subCategory = await subCategorysModel.find({}).skip(skip).limit(limit);
  res.status(200).json({results:subCategory.length , page , data:subCategory});
});


// ==================================
// @desc Get one subcategory
// @route /api/subcategory/:id
// @method GET
// @access public
// ==================================
module.exports.getOneSubcategory = asyncHandler(async (req , res) => {
  const subcategory = await subCategorysModel.findById(req.params.id);
  if(!subcategory){
    return res.status(404).json({message: "لا توجد هذا المحاضره او تم مسحها "});
  }
  res.status(200).json({data:subcategory})
})




// ==================================
// @desc Creat new subcategory
// @route /api/subcategory
// @method POST
// @access Private (only admin)
// ==================================
module.exports.createSubcategory = asyncHandler(async (req, res) => {
  // validtion if not found image
  if (!req.files || !req.files.image || !req.files.image[0]) {
    const filePath = path.join(__dirname,`../files/${req.files.file[0].filename}`);
    fs.unlinkSync(filePath);
    return res.status(400).json({ message: "لم تتم اضافه صوره للمحاضره" });
  }

  // validtion if not found pdf file
  if (!req.files || !req.files.file || !req.files.file[0]) {
    if (req.files.image) {
      const imagePath = path.join(__dirname,`../images/${req.files.image[0].filename}`);
      fs.unlinkSync(imagePath);
    }
    return res.status(400).json({ message: "لم تتم اضافه محاضره" });
  }

  // vaildtion input data
  const { error } = validateCreateSubcategory(req.body);
  if (error) {
    const imagePath = path.join(__dirname,`../images/${req.files.image[0].filename}`);
    const filePath = path.join(__dirname,`../files/${req.files.file[0].filename}`);
    fs.unlinkSync(imagePath);
    fs.unlinkSync(filePath);
    return res.status(400).json({ message: error.details[0].message });
  }

  // Check if subcategoty title is unique
  const existingSubcategory = await subCategorysModel.findOne({
    title: req.body.title,
  });
  if (existingSubcategory) {
    const imagePath = path.join(__dirname,`../images/${req.files.image[0].filename}`);
    const filePath = path.join(__dirname,`../files/${req.files.file[0].filename}`);
    fs.unlinkSync(imagePath);
    fs.unlinkSync(filePath);
    return res
      .status(400)
      .json({ message: "اسم المحاضره موجود بالفعل. يرجى اختيار اسم مختلف." });
  }


  // Check if category exists in the database
  const categoryExists = await CategoryModel.findById(req.body.category);
  if (!categoryExists) {
    return res
      .status(400)
      .json({ message: "هذا الماده غير موجوده او تم مسحها" });
  }

  // upload image
  const imagePath = path.join( __dirname,`../images/${req.files.image[0].filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // upload file
  const filePath = path.join(__dirname,`../files/${req.files.file[0].filename}`);
  const fileResult = await uploadsFile(req, res, filePath);

  //   save subcategory in DB
  const subcategory = await subCategorysModel.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
    file: {
      webViewLink: fileResult.fileLinks.webViewLink,
      webContentLink: fileResult.fileLinks.webContentLink,
      publicId: fileResult.fileLinks.publicId,
    },
  });
  res.status(201).json({ data: subcategory, message: "تم اضافه المحاضره بنجاح" });

  // remove image form local server
  fs.unlinkSync(imagePath);
  fs.unlinkSync(filePath);
});

// ==================================
// @desc Update subcategory
// @route /api/subcategory/:id
// @method PUT
// @access private (only admin)
// ==================================
module.exports.updateSubcategory = asyncHandler(async(req , res) =>{
  // vaildation input data from user
  const { error } = validateUpdateSubcategory(req.body);
  if (error) {
    if (req.file) {
      const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
      fs.unlinkSync(imagePath);
    }
    return res.status(400).json({ message: error.details[0].message });
  }

  const updateData = {};
  // update title
  if (req.body.title) {
    updateData.title = req.body.title;
  }

  // updaye description
  if(req.body.description){
    updateData.description = req.body.description;
  }

  // update category
  if(req.body.category){
    const category = await CategoryModel.findById(req.body.category);
    if(!category){
      return res.status(404).json({message:"الماده التي تضيف اليها المحاضره غير موجوده او قد تم مسحها"})
    }
    updateData.category = req.body.category;
  }

  // update subcategory image
  if (req.file) {
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);
    updateData.image = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    // delete the old image if found
    const subcategory = await subCategorysModel.findById(req.params.id);
    if (subcategory.image.publicId !== null) {
      await cloudinaryDeleteImage(subcategory.image.publicId);
    }
    // delete image from local server
    fs.unlinkSync(imagePath);
  }
  // update category in DB
  const updatedCategory = await subCategorysModel.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true }
  );

  // send res from user
  res.status(200).json({message:"تم تحديث معلومات المحاضره بنجاح"});
})


// ==================================
// @desc delete subcategory
// @route /api/subcategory
// @method POST
// @access Private (only admin)
// ==================================
module.exports.deleteSubcategory = asyncHandler(async (req , res) =>{
  // get subcategoty from DB
  const subcategory = await subCategorysModel.findById(req.params.id);
  if(!subcategory){
    return res.status(404).json({message: "لا توجد محاضره لهذا المعرف"});
  }
  // delete image form cloudnary
  await cloudinaryDeleteImage(subcategory.image.publicId);

  // delete file from google derive
  const authClient = await authorize();
  await deleteFile(authClient , subcategory.file.publicId);

  // delete subcategory from DB
  await subCategorysModel.findByIdAndDelete(req.params.id);

  res.status(200).json({message:"تم مسح المحاضره بنجاح"})
})