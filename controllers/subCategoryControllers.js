const asyncHandler = require("express-async-handler");
const {
  subCategorysModel,
  validateCreateSubcategory,
  validateUpdateSubcategory,
} = require("../models/SubCategory");
const { CategoryModel } = require("../models/Category");
const {uploadsFile , deleteFile , authorize} = require("../utils/googleDrive")
const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
} = require("../utils/cloudinary");


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
  const totalSubcategoury = await subCategorysModel.countDocuments();
  res.status(200).json({results:totalSubcategoury , page , data:subCategory});
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
    return res.status(400).json({ message: "لم يتم إضافة صورة للمحاضرة" });
  }

 // validtion if not found pdf file
  if (!req.files || !req.files.file || !req.files.file[0]) {
    return res.status(400).json({ message: "لم يتم إضافة محاضرة" });
  }

   // vaildtion input data
  const { error } = validateCreateSubcategory(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Check if subcategoty title is unique
  const existingSubcategory = await subCategorysModel.findOne({
    title: req.body.title,
  });
  if (existingSubcategory) {
    return res.status(400).json({ message: "اسم المحاضرة موجود بالفعل. يرجى اختيار اسم مختلف." });
  }

  // Check if category exists in the database
  const categoryExists = await CategoryModel.findById(req.body.category);
  if (!categoryExists) {
    return res.status(400).json({ message: "هذه المادة غير موجودة أو تم حذفها" });
  }

  try {
    // Upload image to Cloudinary
    const uploadedImage = await cloudinaryUploadImage(req.files.image[0].buffer, req.files.image[0].originalname);

    // upload file to Google Drive
    const uploadFile = await uploadsFile(req , res)

    // save subcategory in DB
    const subcategory = await subCategorysModel.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      image: {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      },
      file: {
        webViewLink: uploadFile.fileLinks.webViewLink,
        webContentLink: uploadFile.fileLinks.webContentLink,
        publicId: uploadFile.fileLinks.publicId,
      },
    });
    res.status(201).json({ data: subcategory, message: "تم إضافة المحاضرة بنجاح" });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ message: "حدث خطأ أثناء إضافة المحاضرة", error: error.message });
  }
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
    return res.status(400).json({ message: error.details[0].message });
  }

  const updateData = {};
  // update title
  if (req.body.title) {
    updateData.title = req.body.title;
  }

  // update description
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
    const uploadedImage = await cloudinaryUploadImage(req.file.buffer, req.file.originalname);
    updateData.image = {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    };

    // delete the old image if found
    const subcategory = await subCategorysModel.findById(req.params.id);
    if (subcategory.image.publicId !== null) {
      await cloudinaryDeleteImage(subcategory.image.publicId);
    }
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