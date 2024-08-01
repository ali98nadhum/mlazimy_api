const router = require("express").Router();
const {getAllCategorys, createNewCategory, getOneCategory, updateCategory, deleteCategory, test} = require("../controllers/categoryControllers");
const photoUpload = require("../middlewares/photoUpload");
const { verifyTokenAdmin } = require("../middlewares/verifyToken");


router.route("/")
.get(getAllCategorys)
.post(verifyTokenAdmin ,photoUpload.single("image") , createNewCategory)


router.route("/:id")
.get(getOneCategory)
.put(verifyTokenAdmin ,photoUpload.single("image") , updateCategory)
.delete(verifyTokenAdmin ,deleteCategory)


module.exports = router;