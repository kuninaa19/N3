import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';

import connection from '../conf/dbInfo';

const LocalStrategy = require('passport-local').Strategy;

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});


export default router;  // 단하나의 모듈
// export {router}; //ES6
// module.exports = router; // nodeJS
