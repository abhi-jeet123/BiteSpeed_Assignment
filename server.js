const app = require("./app");
const mongoose = require("mongoose");

const url =
  "mongodb+srv://abhijeettrigunait1234:xnla5RTpdF6gtJLt@cluster0.qsqf5fh.mongodb.net/?retryWrites=true&w=majority";

const connectConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const port = 3000;

mongoose.connect(url, connectConfig).then(() => {
  app.listen(port, () => {
    console.log("DB Connection succesful");
    console.log(`Server is running in port ${port}...`);
  });
});

// app.listen(port, () => {
//   console.log(`Server is running in port ${port}...`);
// });
