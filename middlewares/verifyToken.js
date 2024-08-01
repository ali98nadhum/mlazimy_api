const jwt = require("jsonwebtoken");


// verify Token
function verifyToken(req , res , next){
    const authToken = req.headers.authorization;
    if(authToken){
        const token = authToken.split(" ")[1];
        try {
            const decodedPayload = jwt.verify(token , process.env.JWT_SECRET);
            req.user = decodedPayload;
            next();
        } catch (error) {
            return res.status(401).json({message:"invalid token"})
        }
    } else {
        return res.status(401).json({message:"قم بتسجيل الدخول"})
    }
}

// Verify token for admin\
function verifyTokenAdmin(req , res , next){
    verifyToken(req , res , () => {
        if(req.user.isAdmin){
            next()
        }else{
            return res.status(403).json({message: "لا يمكنك الدخول لهذا المسار"})
        }
    })
}


module.exports = {
    verifyToken,
    verifyTokenAdmin
}