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
app.set('trust proxy', 1);
app.use(express.json());
app.use(cors({
    origin: '*',
  }));
app.use(xss());
app.use(hpp());
app.use(helmet());
app.use(rateLimiting({
    windowMs: 10 * 60 * 1000,
    max:100
}))





// Routes
app.use("/category" , require("./routes/categoryRouts"));
app.use("/subcategory" , require("./routes/subCategoryRoutes"));
app.use("/auth" , require("./routes/authRoutes"));
app.use("/notice" , require("./routes/noticeRoutes"));
app.use("/work" , require("./routes/workRoutes"));


// Run Server
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is run on port ${port}`))