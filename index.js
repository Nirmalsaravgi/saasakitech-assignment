require('dotenv').config();
const express = require("express");
const {connectToMongoDB} = require('./connect');
const csvRoute = require("./routes/csvDataRouter");
const dataRouter = require("./routes/dataRetrievalRouter");

connectToMongoDB(process.env.MONGODB_URI).then(console.log("Mongodb Connected"));

const app = express();
const PORT = process.env.PORT || 8000;

app.use('/', csvRoute);
app.use('/api', dataRouter)

app.listen(PORT, () => console.log(`Server is started at PORT ${PORT}`));