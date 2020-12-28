import {Router} from 'express';
import UploadService from "../../services/upload";
import path from "path";
import multer from "multer";

const route = Router();

const __dirname = path.resolve("src");
const filePath = path.join(__dirname, '/public/images/rooms');

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

export default (app) => {
    app.use('/upload', route);

    // 이미지 업로드
    route.post('/images', upload.array('img', 5), async (req, res) => {
        const imagesDTO = {
            'image_1': req.files[0].filename,
            'image_2': req.files[1].filename,
            'image_3': req.files[2].filename,
            'image_4': req.files[3].filename,
            'image_5': req.files[4].filename,
        };

        const uploadServiceInstance = new UploadService();
        const result = await uploadServiceInstance.insertImages(imagesDTO);

        return res.json(result);
    });

    // 방 정보 전체 업로드
    route.post('/info', async (req, res) => {
        const roomDTO = {
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

        const uploadServiceInstance = new UploadService();
        const result = await uploadServiceInstance.insertRoomInfo(roomDTO);

        return res.json(result);
    });
};