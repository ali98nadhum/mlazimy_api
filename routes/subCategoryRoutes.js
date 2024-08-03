const router = require("express").Router();
const {getAllSubcategory, createSubcategory, getOneSubcategory, deleteSubcategory, updateSubcategory} = require("../controllers/subCategoryControllers")
const upload = require("../middlewares/photoAndFileUpload")
const photoUpload = require("../middlewares/photoUpload");
const { verifyTokenAdmin } = require("../middlewares/verifyToken");

router.route("/")
.get(getAllSubcategory)
.post(verifyTokenAdmin ,upload,createSubcategory)

router.route("/:id")
.get(getOneSubcategory)
.delete(verifyTokenAdmin,deleteSubcategory)
.put(verifyTokenAdmin,photoUpload.single("image"),updateSubcategory)


module.exports = router;