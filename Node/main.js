import path from "path";

import connection from './conf/dbInfo';
import bCrypt from "bcrypt";

const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const initPassport = require('./conf/passport');
const FileStore = require('session-file-store')(session);
const multer = require('multer'); // 이미지저장


const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

const checkNotAuth = (req, res, next) => {
    //인증허가됨
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
};

app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new FileStore()
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
initPassport(passport);

app.get('/example', (req, res) => {

    res.render('promise_example.ejs');
});
app.get('/example/1', (req, res) => {
    // var resData = {'info':req.body.email};
    var resData = {'info': 'email'};
    // var resData = "email";
    // return resData;
    res.json(resData);

});
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/images/rooms');
        },
        filename: function (req, file, cb) {
            cb(null, new Date().valueOf() + path.extname(file.originalname));
        }
    }),
});
app.post('/up', upload.array('img', 5), (req, res) => {
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

app.get('/', checkNotAuth, (req, res) => {
    //로그인 인증 실패시 다시 여기로 들어옴.

    //req.flash() 딱한번만 (console.log() 포함)
    var message = req.flash().error;
    res.render('example.ejs', {'message': message});
});

app.post('/send_data', (req, res) => {
    console.log(req);
    var resData = {'email': req.body.email, 'password': req.body.password, 'nickname': req.body.nickname}
    res.json(resData);
});
app.get('/dashboard', checkAuth, (req, res) => {
    //passport에서   //반환된 user가 이곳에서 req.user이다.
    res.render('dashboard.ejs', {nickname: req.user.nickname});
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session.save(function () {
        res.redirect('/');
    });
});

//인증요청하면서 인증후 어디로 redirect 될건지
app.post('/', passport.authenticate('local-login', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}));

app.post('/register', passport.authenticate('local-register', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}));


app.listen(3000, () => console.log('Server On'));
