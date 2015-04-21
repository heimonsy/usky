// 这个gulp文件写的非常搓，求前端大神优化

var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rev = require('gulp-rev');
var del = require('del');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var inject = require('gulp-inject');

var watch = require('gulp-watch');

var paths = {
    scripts: [
        "./resources/assets/js/**/*.js",
    ]
};

gulp.task('sass-dev', function () {
    return sass('resources/assets/sass/main.scss', {sourcemap: true})
        .on('error', function (err) {
          console.error('Error!', err.message);
        })
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('resources/assets/dist/css'));
});

gulp.task('sass', function (cb) {
    var opts = {comments:true, spare:true};
    return sass('resources/assets/sass/main.scss', {sourcemap: true})
        .on('error', function (err) {
          console.error('Error!', err.message);
        })
        .pipe(minifyCSS(opts))
        .pipe(gulp.dest('resources/assets/dist/css'));
});

gulp.task('scripts-dev', function () {
    return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('resources/assets/dist/js'));
});

gulp.task('scripts', function (cb) {
    gulp.src(paths.scripts)
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('resources/assets/dist/js'))
    .on('end', function () {
        cb(null);
    });
});

gulp.task('rev', ['sass', 'scripts'], function () {
    del(['public/build/css/*', 'public/build/js/*', 'public/build/rev-manifest.json'], function (err, deletedFiles) {
        console.log('Files deleted:', deletedFiles.join(', '));
    });
    return gulp.src(["resources/assets/dist/css/*.css", "resources/assets/dist/js/*.js"], {base: 'resources/assets/dist'})
    .pipe(gulp.dest('public/build'))
    .pipe(rev())
    .pipe(gulp.dest('public/build'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('public/build'));

});

gulp.task('rev-dev', function () {
    del(['public/build/css/*', 'public/build/js/*', 'public/build/rev-manifest.json'], function (err, deletedFiles) {
        console.log('Files deleted:', deletedFiles.join(', '));
    });

    return gulp.src(["resources/assets/dist/css/*.css", "resources/assets/dist/js/*.js"], {base: 'resources/assets/dist'})
    .pipe(gulp.dest('public/build'))
    .pipe(rev())
    .pipe(gulp.dest('public/build'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('public/build'));
});

gulp.task('index-dev', function () {
  var target = gulp.src('./resources/apps/regist/index.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src(['build/js/main-*.js', 'build/css/main-*.css'], {read: false, cwd: './public'});
  return target.pipe(inject(sources))
    .pipe(gulp.dest('./public/regist/'));
});

gulp.task('index', ['rev'],  function () {
     gulp.start('index-dev');
});

gulp.task('clean', function () {
    gulp.src('public/regist/*')
        .pipe(clean({force: true}));

    gulp.src('resources/assets/dist/*')
      .pipe(clean({force: true}));
    gulp.src('public/build/*')
      .pipe(clean({force: true}));
});

gulp.task('develop', ['sass-dev', 'scripts-dev'], function () {
    return gulp.start("rev-dev")
            .start("watch");
});

gulp.task('production', ['index']);

gulp.task('watch', function () {
    watch('resources/assets/dist/css/*.css', function () {
         gulp.start('rev-dev');
    });
    watch('resources/assets/js/**/*.js', function () {
         gulp.start('scripts-dev');
    });
    watch('resources/assets/dist/js/*.js', function () {
         gulp.start('rev-dev');
    });
    watch('resources/assets/sass/**/*.scss', function () {
         gulp.start('sass-dev');
    });
    watch('public/build/**/*', function () {
         gulp.start('index-dev');
    });
});

