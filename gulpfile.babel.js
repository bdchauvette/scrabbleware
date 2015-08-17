import gulp from 'gulp';
import babel from 'gulp-babel';

gulp.task('build', () => {
  const babelConfig = { plugins: ['object-assign'] };

  return gulp.src('src/*.js')
    .pipe(babel(babelConfig))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
  gulp.watch('src/*.js', ['build']);
});

gulp.task('default', ['build', 'watch']);
