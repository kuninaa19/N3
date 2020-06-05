import express from 'express';
import connection from '../conf/dbInfo';
import path from "path";
import multer from "multer";

const router = express.Router();

const filePath = path.join(__dirname, '../public/images/rooms');

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, filePath);
        },
        filename: function (req, file, cb) {
            cb(null, new Date().valueOf() + path.extname(file.originalname));
        }
    }),
});

router.post('/upload', upload.array('img', 5), (req, res) => {
    console.log(req.files);

    const storeImages = {
        'image_1': req.files[0].filename,
        'image_2': req.files[1].filename,
        'image_3': req.files[2].filename,
        'image_4': req.files[3].filename,
        'image_5': req.files[4].filename,
    };

    connection.query('insert into `images` set ?', storeImages, (err, result) => {
        if (err) throw  err;

        connection.query('select * from `images` where `image_1`=?', storeImages.image_1, (err, result) => {
            if (err) throw  err;

            let resData = {
                'imageUrl': result[0].image_1
            };

            return res.json(resData);
        });
    });
});

export default router;
