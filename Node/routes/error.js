import express from "express";

const router = express();

// 없는 페이지 접속
router.use((req, res, next) => {
    res.status(404).render('error');
});

// 고장
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error');
});

export default router;
