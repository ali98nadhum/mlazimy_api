const router = require("express").Router();
const {createNewWork, getAllWork, getOneWork, deleteWork, updateWork} = require("../controllers/workController");
const { verifyTokenAdmin } = require("../middlewares/verifyToken");
const photoUpload = require("../middlewares/photoUpload");


router.route("/")
.get(getAllWork)
.post(verifyTokenAdmin,photoUpload.single("image"), createNewWork)

router.route("/:id")
.get(getOneWork)
.put(verifyTokenAdmin ,photoUpload.single("image"), updateWork)
.delete(verifyTokenAdmin,deleteWork)


module.exports = router;