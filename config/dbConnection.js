const { tryCatch } = require("../middleware/trycatchHandler");
const mongoose = require("mongoose");

const dbConnect = tryCatch(async () => {
  const connect = await mongoose.connect(process.env.DB_URL_ATLAS);
  console.log(
    `Database connected on ${connect.connection.host} - ${connect.connection.name}`
  );
});

module.exports = dbConnect;

// const mongoose = require("mongoose");

// const dbConnect = () => {
//   mongoose
//     .connect(process.env.DB_URL)
//     .then(() => console.log("Database Connected "))
//     .catch((err) => console.log(err));
// };

// module.exports = dbConnect;
