import path from "path";
import dotenv from 'dotenv';

const __dirname = path.resolve();

const envFound = dotenv.config({path: path.join(__dirname, '/src/conf/.env')});
if (envFound.error) {
    // This error should crash whole process

    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
    jwt_secret: process.env.JWT_SECRET,

    oauth: {
        kakao: {
            rest_api_key: process.env.KAKAO_REST_API_KEY,
            client_secret: process.env.KAKAO_CLIENT_SECRET,
            admin_key: process.env.KAKAO_ADMIN_KEY,
            callback_url: process.env.KAKAO_CALLBACK_URL
        },
        naver: {
            client_id: process.env.NAVER_CLIENT_ID,
            client_secret: process.env.NAVER_CLIENT_SECRET,
            callback_url: process.env.NAVER_CALLBACK_URL
        }
    }
};