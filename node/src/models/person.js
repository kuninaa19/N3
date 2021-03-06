import db from '../loaders/mysql';
import logger from '../loaders/logger';

//이미 가입된 회원인지 확인[local,naver,kakao]
async function getPerson(email) {
    return new Promise((resolve, reject) => {
        db((err, connection) => {
            const sql = 'SELECT * FROM `person` WHERE `email` = ?';
            connection.query(sql, email, (err, rows) => {
                connection.release();
                if (err) {
                    throw reject(err);
                }
                resolve(rows);
            });
        });
    }).catch((err) => {
        console.log('getPerson Error', err);
        logger.error(err);
        return false;
    });
}

//회원가입 [ local,kakao,naver]
async function storePerson(person) {
    return new Promise((resolve, reject) => {
        db((err, connection) => {
            const sql = 'INSERT INTO `person` SET ?';
            connection.query(sql, person, (err) => {
                connection.release();
                if (err) {
                    console.log('insertPerson Error', err);
                    logger.error(err);
                    throw reject(err);
                }
                resolve();
            });
        });
    }).catch((err) => {
        console.log('insertPerson error', err);
        logger.error(err);
        return false;
    });
}

// 유저정보 DB 삭제
async function deletePerson(nickname) {
    return new Promise((resolve, reject) => {
        db((err, connection) => {
            const sql = 'DELETE FROM `person` WHERE nickname = ?';
            connection.query(sql, nickname, (err) => {
                connection.release();
                if (err) throw reject(err);

                resolve(true);
            });
        });
    }).catch((err) => {
        console.log(err);
        return false;
    });
}

export default {
    getPerson,
    storePerson,
    deletePerson,
};
