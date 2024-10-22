const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require("body-parser");
const {uploadStockData} = require("../controllers/csvDataController")

const router = express.Router();

router.use(bodyParser.urlencoded({extended:true}));
router.use(express.static(path.resolve(__dirname,'public')));

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        return cb(null, './public/uploads');
    },
    filename:(req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({storage: storage});

router.post('/upload', upload.single('file'), uploadStockData);

module.exports = router;