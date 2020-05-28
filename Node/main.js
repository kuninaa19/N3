const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const initPassport = require('./conf/passport');
const FileStore = require('session-file-store')(session);

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

app.use('/public', express.static(__dirname + '/public'));

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


app.get('/', checkNotAuth, (req, res) => {
    //로그인 인증 실패시 다시 여기로 들어옴.
    console.log('get join url');

    //req.flash() 딱한번만 (console.log() 포함)
    var message = req.flash().error;
    res.render('example.ejs', {'message': message});
});

app.get('/dashboard', checkAuth, (req, res) => {
    //passport에서   //반환된 user가 이곳에서 req.user이다.
    res.render('dashboard.ejs', {nickname: req.user.nickname});
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session.save(function(){
        res.redirect('/');
    });
});

//인증요청하면서 인증후 어디로 redirect 될건지
app.post('/', passport.authenticate('local-login', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}));

app.post('/register', passport.authenticate('local-register',{
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}));


app.listen(3000, () => console.log('Server On'));
