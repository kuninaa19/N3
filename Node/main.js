import path from "path";

import connection from './conf/dbInfo';
import bCrypt from "bcrypt";
import config from './conf/config';

const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const initPassport = require('./conf/passport');
const FileStore = require('session-file-store')(session);
const multer = require('multer'); // 이미지저장
// var request = require('request');
const request = require('request-promise-native');

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

app.use('/static', express.static(path.join(__dirname, 'public')));

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

app.get('/payment/approve', (req, res) => {

    const headers = {
        'Authorization': 'KakaoAK ' + config.oauth.kakao.admin_key,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    };

    const params = {
        'cid': 'TC0ONETIME',
        'tid': req.session.tid,
        'partner_order_id': 'test',
        'partner_user_id': 'test',//req.user.email
        'pg_token': req.query.pg_token
    };

    const options = {
        url: 'https://kapi.kakao.com/v1/payment/approve',
        method: 'POST',
        headers: headers,
        form: params
    };

    async function get_info() {
        try {
            const result = await request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    return JSON.parse(body);
                }
            });
            //처리완료되면 DB에 예약 내용저장
            // 창닫고 예약페이지로 이동
            let val = JSON.parse(result);

            val.date = JSON.stringify(req.session.date);
            val.amount = JSON.stringify(val.amount);
            const sql = 'insert into `order` set ?';
            connection.query(sql, val, (err, result) => {
                if (err) throw  err;

                res.send("<script>opener.location.href=`https://hotelbooking.kro.kr/rooms/13`; window.close();</script>");
            });

        } catch (e) {
            console.log(e)
        }
    }

    get_info();
});

// 결제 취소시 창 닫기
app.get('/payment/cancel', (req, res) => {
    res.send("<script>window.close();</script>");
});

// 결제 실패시 알림창 뜨고 다시 시도
app.get('/payment/fail', (req, res) => {
    res.send("<script>alert('다시 시도해 주세요'); window.close();</script>");
});

app.post('/payment/ready', (req, res) => {
    console.log(req.body);

    const headers = {
        'Authorization': 'KakaoAK ' + config.oauth.kakao.admin_key,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    };

    const params = {
        'cid': 'TC0ONETIME',
        'partner_order_id': 'test',
        'partner_user_id': 'test',//req.user.email
        'item_name': req.body.hotel_name,
        'quantity': req.body.quantity, //상품수량
        'total_amount': req.body.price,
        'tax_free_amount': 0,
        'approval_url': 'https://hotelbooking.kro.kr/payment/approve',
        'fail_url': 'https://hotelbooking.kro.kr/payment/fail',
        'cancel_url': 'https://hotelbooking.kro.kr/payment/cancel',
    };

    const options = {
        url: 'https://kapi.kakao.com/v1/payment/ready',
        method: 'POST',
        headers: headers,
        form: params
    };

    // 오리지날 request 모듈 콜백 비동기라 return은 안됨
    /*
      function callback(error, response, body) {
          // console.log(error);
          if (!error && response.statusCode === 200) {
              let res = JSON.parse(body);
              // console.log(res.next_redirect_pc_url);
              console.log(body);
              return body;
          }
      }
      request(options, callback);
      */

    //promise를 통한 return 값 전달
    /*
        function get_info(){
            return new Promise(function(resolve, reject){
                request(options, function (error, response, body) {
                    // in addition to parsing the value, deal with possible errors
                    if (error) return reject(error);
                    try {
                        // JSON.parse() can throw an exception if not valid JSON
                        resolve(JSON.parse(body));
                    } catch(e) {
                        reject(e);
                    }
                });
            });
        }

        get_info().then(function(val) {
            console.log(val);
            // return val;
            return res.json(val);
        }).catch(function(err) {
            console.err(err);
        });
    */

    async function get_info() {
        try {
            const result = await request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    // let fa = JSON.parse(body)
                    return body;
                }
            });

            const val = JSON.parse(result);
            //세션에 tid(결제 고유 번호) 저장 - 없으면 결제 승인완료 안됨
            req.session.tid = val.tid;
            // 예약하려는 날짜 저장
            req.session.date = req.body.date;
            req.session.save(() => {
                return res.json(val.next_redirect_pc_url);
            });
        } catch (e) {
            console.log(e)
        }
    }

    get_info();
});

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

//이미지 업로드
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
app.post('/image/upload', upload.single('img'), (req, res) => {
    console.log(req.file);
    const storeImages = {
        'image_1': req.file.filename,
    };
    connection.query('insert into `image` set ?', storeImages, (err, result) => {
        if (err) throw  err;
        connection.query('select * from `image` where `image_1`=?', storeImages.image_1, (err, result) => {
            if (err) throw  err;
            let resData = {
                'key': true,
                'imageUrl': result[0].image_1
            };
            return res.json(resData);
        });
    });
});

app.post('/store', (req, res) => {
    console.log(req.body);
    const info = {
        'imageUrl': req.body._image,
        'simple_info': JSON.stringify(req.body.simpleInfo),
        'country': req.body._country,
        'region': req.body._region,
        'name': req.body._name
    };
    connection.query('insert into `example` set ?', info, (err, result) => {
        if (err) throw  err;
        const resData = {
            'key': true,
            'name': req.body.simpleInfo
        };
        return res.json(resData);
    });
});


app.get('/', checkNotAuth, (req, res) => {
    //로그인 인증 실패시 다시 여기로 들어옴.

    //req.flash() 딱한번만 (console.log() 포함)
    var message = req.flash().error;
    res.render('example.ejs', {'message': message});
});

app.post('/send_data', (req, res) => {
    var resData = {'email': req.body.email, 'password': req.body.password, 'nickname': req.body.nickname}
    res.json(resData);
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
