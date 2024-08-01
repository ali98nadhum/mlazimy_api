const router = require("express").Router();
const {registerAdmin, login} = require("../controllers/authController");
const { verifyTokenAdmin } = require("../middlewares/verifyToken");


router.post("/register" ,verifyTokenAdmin, registerAdmin);

router.post("/login" , login);

module.exports = router;