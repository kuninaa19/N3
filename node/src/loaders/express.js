import express from 'express';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import methodOverride from 'method-override';
import routes from '../api';

export default async (app) => {
    const __dirname = path.resolve("src");

    app.use(cors());
    app.use(helmet());
    app.enable('trust proxy');
    app.use(morgan("dev"));
    app.use(compression());

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '/views'));
    app.use('/static', express.static(path.join(__dirname, '/public')));

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cookieParser());

    app.use(methodOverride('_method'));

    app.use('/', routes());

    // error 404 없는 페이지 접속
    app.use((req, res) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        // next(err);

        res.status(404).render('error');
    });

    // Error 500
    app.use((err, req, res) => {
        console.error(err.stack);
        res.status(500).render('error');
    });
};