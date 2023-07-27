const app = require("./app");
const mongoose = require("mongoose");

const url = process.env.CONNECTION_URL;
const connectConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const port = process.env.PORT;

mongoose.connect(url, connectConfig).then(() => {
  app.listen(port, () => {
    console.log("DB Connection succesful");
    console.log(`Server is running in port ${port}...`);
  });
});

// app.listen(port, () => {
//   console.log(`Server is running in port ${port}...`);
// });
