import {Router} from 'express';

import host from './routes/user/host';
import info from './routes/user/info';
import message from './routes/user/message';
import trip from './routes/user/trip';
import auth from './routes/auth';
import index from './routes/index';
import kakaoPay from './routes/kakao_pay';
import papago from './routes/papago';
import room from './routes/room';
import upload from './routes/upload';

export default () => {
    const app = Router();

    host(app);
    info(app);
    message(app);
    trip(app);
    room(app);
    index(app);
    auth(app);
    upload(app);
    kakaoPay(app);
    papago(app);

    return app;
};