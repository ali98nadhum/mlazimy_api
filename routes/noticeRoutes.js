const router = require("express").Router();
const { verifyTokenAdmin } = require("../middlewares/verifyToken");
const {signUserNotice, verifieCode, getAllUsers, deleteUser} = require("../controllers/noticeController")


router.get("/" , verifyTokenAdmin, getAllUsers);
router.delete("/:id" , verifyTokenAdmin,deleteUser)
router.post("/signup" , signUserNotice);
router.post("/verifiecode" , verifieCode);


module.exports = router;