const mongoose = require("mongoose");

module.exports = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connect to DB ^_^");
    } catch (error) {
        console.log("Connection failed to DB ): "  , error);
    }
}