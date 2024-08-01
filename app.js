const express = require("express");
const connectToDB = require("./config/connectToDB");
require("dotenv").config();
const cors = require('cors');
const xss = require("xss-clean");
const rateLimiting = require("express-rate-limit");
const hpp = require("hpp");
const helmet = require("helmet");





// Connect to DB 
connectToDB();

const app = express();

// Middlewarss
app.use(express.json());
app.use(cors());
app.use(xss());
app.use(hpp());
app.use(helmet());
app.use(rateLimiting({
    windowMs: 10 * 60 * 1000,
    max:100
}))





// Routes
app.use("/api/category" , require("./routes/categoryRouts"));
app.use("/api/subcategory" , require("./routes/subCategoryRoutes"));
app.use("/api/auth" , require("./routes/authRoutes"));
app.use("/api/notice" , require("./routes/noticeRoutes"));
app.use("/api/work" , require("./routes/workRoutes"));


// Run Server
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is run on port ${port}`))