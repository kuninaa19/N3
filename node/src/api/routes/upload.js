import express from "express";
import connection from "../../conf/dbInfo.js";
import path from "path";
import multer from "multer";
import asyncHandler from "express-async-handler";

const router = express.Router();

const __dirname = path.resolve();

const filePath = path.join(__dirname, '../public/images/rooms');

// 이미지 업로드
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

// 이미지 DB 저장
const insertImages = (images) => {
    return new Promise((resolve) => {
        const sql = 'INSERT INTO `images` SET ?';
        connection.query(sql, images, (err) => {
            if (err) throw  err;

            let resData = {
                'key': true,
                'image': images.image_1
            };

            resolve(resData);
        });
    }).catch(error => {
        console.log(`insertImage 에러 발생: ${error}`);

        const resData = {
            'key': false
        };
        return resData;
    });
};

// 이미지 업로드
router.post('/images', upload.array('img', 5), asyncHandler(async (req, res) => {
    const images = {
        'image_1': req.files[0].filename,
        'image_2': req.files[1].filename,
        'image_3': req.files[2].filename,
        'image_4': req.files[3].filename,
        'image_5': req.files[4].filename,
    };

    const result = await insertImages(images);

    return res.json(result);
}));

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

    const sql = 'INSERT INTO `room` SET ?';
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
