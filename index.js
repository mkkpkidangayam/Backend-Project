const express = require("express");
const app = express();
// const session = require('express-session');
// const userForm = require("./controller/userForm");
const cookies = require("cookie-parser");

const dotenv = require("dotenv");
const dbConnect = require("./config/dbConnection");
dotenv.config({ path: "./config/.env" });

dbConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookies());



// User registration SignUp & Login
const userRoute = require("./Routes/userlog");
app.use("/api", userRoute);

// User authorization
const userformRoute = require("./Routes/userFormRoutes");
app.use("/api", userformRoute);

//admin restration
const adminformRoute = require("./Routes/adminRoute");
app.use("/api", adminformRoute);

// Localhost Port
app.listen(process.env.PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server running on port: ${process.env.PORT}`);
  }
});
