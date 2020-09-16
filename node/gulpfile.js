const gulp = require('gulp'); // Gulp 모듈 호출
const concat = require('gulp-concat');

gulp.task('combine:js', ['lint-js'], async function () {
    return gulp.src('/node/public/css/js/**/*.js')
        .pipe(concat('scriptAll.js'))
        .pipe(gulp.dest('project/dist/js'));
});

gulp.task('default', ['combine:js']);

// Gulp.task() 를 사용해 기본(Default) 테스크를 정의
gulp.task('default', async function () {
    console.log('gulp default 일이 수행되었습니다!!!');
});

