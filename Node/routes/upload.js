import express from "express";
import connection from "../conf/dbInfo";
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

router.post('/images', upload.array('img', 5), (req, res) => {
    console.log(req.files);

    const storeImages = {
        'image_1': req.files[0].filename,
        'image_2': req.files[1].filename,
        'image_3': req.files[2].filename,
        'image_4': req.files[3].filename,
        'image_5': req.files[4].filename,
    };

    const sql = 'insert into `images` set ?';
    connection.query(sql, storeImages, (err, result) => {
        if (err) throw  err;

        const sql = 'select * from `images` where `image_1`=?';
        connection.query(sql, storeImages.image_1, (err, result) => {
            if (err) throw  err;

            let resData = {
                'key': true,
                'image': result[0].image_1
            };

            return res.json(resData);
        });
    });
});

// 방 정보 전체 업로드
router.post('/info', (req, res) => {
    const info = {
        'name': req.body.name,
        'country': req.body.country,
        'region': req.body.region,
        'simple_info': JSON.stringify(req.body.simpleInfo),
        'location': JSON.stringify(req.body.location),
        'intro_info': req.body.introInfo,
        'value': JSON.stringify(req.body.value),
        'image': req.body.image,
        // 'host_name':req.user.nickname
        'host_name': 'Xerar' // 로그인없이 등록 할 수 있도록 수정
    };

    const sql = 'insert into `room` set ?';
    connection.query(sql, info, (err, result) => {
        if (err) throw  err;

        const resData = {
            'key': true,
            'roomNum': result.insertId
        };

        return res.json(resData);
    });
});
export default router;
