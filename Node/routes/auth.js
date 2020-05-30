import express from 'express';
import passport from 'passport';
import initPassport from "../conf/passport";
initPassport(passport);

const router = express.Router();

//로그인을해도 메인화면으로 가는건 동일하지만 로그인시에는 닉네임이 떠야함
router.post('/login',
    passport.authenticate(
        'local-login',
        {
            successRedirect: '/',
            failureRedirect: '/',
            failureFlash: true
        }
    ));

router.post('/register',
    passport.authenticate(
        'local-register',
        {
            successRedirect: '/',
            failureRedirect: '/',
            failureFlash: true
        }
    ));

// 페이코 로그인
app.get('/payco',
    passport.authenticate('payco')
);

app.get('/payco/callback',
    passport.authenticate('payco', {
        failureRedirect: '/',
        successRedirect : '/'
    })
);
export default router;
