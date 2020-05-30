import express from 'express';
import connection from '../conf/dbInfo';
const router = express.Router();

//리팩토링[JS파일만들고 주소값 넣어서 render위지 다르게 설정하기]
const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.render('index');
};


router.get('/', checkAuth, (req, res) => {
    const nickname = req.user.nickname;
    res.render('index', {'nickname':nickname});
});

router.get('/logout', (req, res) => {
    req.logout();
    req.session.save(function(){
        res.redirect('/');
    });
});

export default router;  // 단하나의 모듈
// export {router}; //ES6
// module.exports = router; // nodeJS
