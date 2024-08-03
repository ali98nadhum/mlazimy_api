const asyncHandler = require("express-async-handler");
const {
  WorkModel,
  validateCreateWork,
  validateUpdateWork,
} = require("../models/Work");
const {
  cloudinaryUploadImage,
  cloudinaryDeleteImage,
} = require("../utils/cloudinary");

// ==================================
// @desc Get all work
// @route /api/work
// @method GET
// @access Private (only admin)
// ==================================
module.exports.getAllWork = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 6 || 6;
  const skip = (page - 1) * limit;
  const works = await WorkModel.find({}).skip(skip).limit(limit);
  const totalCount = await WorkModel.countDocuments();
  res.status(200).json({
    results: works.length,
    totalResults: totalCount,
    page: page,
    data: works,
  });
});

// ==================================
// @desc Get work by id
// @route /api/work/:id
// @method GET
// @access Private (only admin)
// ==================================
module.exports.getOneWork = asyncHandler(async (req, res) => {
  const work = await WorkModel.findById(req.params.id);
  if (!work) {
    return res
      .status(404)
      .json({ message: "هذا الفرصه غير متوفره او تم حذفها" });
  }

  res.status(200).json({ data: work });
});

// ==================================
// @desc Creat new work
// @route /api/work
// @method POST
// @access Private (only admin)
// ==================================
module.exports.createNewWork = asyncHandler(async (req, res) => {
  // validtion if not found image
  if (!req.file) {
    return res.status(400).json({ message: "يجب وضع صوره" });
  }

  // validtion input data
  const { error } = validateCreateWork(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const result = await cloudinaryUploadImage(
      req.file.buffer,
      req.file.originalname
    );
    // save category to DB
    const work = await WorkModel.create({
      title: req.body.title,
      description: req.body.description,
      link: req.body.link,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });

    // send res to user
    res.status(201).json({ message: "تم اضافه الفرصه بنجاح", work });
  } catch (error) {
    res.status(500).json({ message: "فشل رفع الصورة إلى Cloudinary" });
  }
});

// ==================================
// @desc Update work
// @route /api/work/:id
// @method PUT
// @access Private (only admin)
// ==================================
module.exports.updateWork = asyncHandler(async (req, res) => {
  // vaildation input data from user
  const { error } = validateUpdateWork(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const updateData = {};
  // update title
  if (req.body.title) {
    updateData.title = req.body.title;
  }

  //   update des
  if (req.body.description) {
    updateData.description = req.body.description;
  }

  // update link
  if (req.body.link) {
    updateData.link = req.body.link;
  }

  // update category image
  if (req.file) {
    const result = await cloudinaryUploadImage(
      req.file.buffer,
      req.file.originalname
    );
    updateData.image = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    // delete the old image if found
    const work = await WorkModel.findById(req.params.id);
    if (work.image.publicId !== null) {
      await cloudinaryDeleteImage(work.image.publicId);
    }
  }

  // update category in DB
  const updatedWork = await WorkModel.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true }
  );

  // send res from user
  res.status(200).json(updatedWork);
});

// ==================================
// @desc Delete work
// @route /api/work/:id
// @method DELETE
// @access Private (only admin)
// ==================================
module.exports.deleteWork = asyncHandler(async (req, res) => {
  // get work from DB
  const work = await WorkModel.findById(req.params.id);
  if (!work) {
    return res
      .status(404)
      .json({ message: "هذا الفرصه غير موجوده او تم حذفها" });
  }

  // delete image form cloudnary
  await cloudinaryDeleteImage(work.image.publicId);

  // delete subcategory from DB
  await WorkModel.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "تم مسح الفرصه بنجاح" });
});
