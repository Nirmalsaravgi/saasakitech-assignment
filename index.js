const express = require("express");
const {connectToMongoDB} = require('./connect');
const csvRoute = require("./routes/csvDataRouter");

connectToMongoDB("mongodb://localhost:27017/stockData").then(console.log("Mongodb Connected"));

const app = express();
const PORT = 8000;

app.use('/', csvRoute);

app.listen(PORT, () => console.log(`Server is started at PORT ${PORT}`));