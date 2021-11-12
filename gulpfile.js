const { src, dest, series, watch } = require(`gulp`);
const gulp = require(`gulp`);
const del = require(`del`);
const babel = require(`gulp-babel`);
const htmlCompressor = require(`gulp-htmlmin`);
const htmlValidator = require(`gulp-html`);
const cssLinter = require(`gulp-stylelint`);
const jsLinter = require(`gulp-eslint`);
const jsCompressor = require(`gulp-uglify`);
const cssCompressor = require(`gulp-uglifycss`);
const browserSync = require(`browser-sync`);
const reload = browserSync.reload;
let browserChoice = `default`;

async function brave () {
    browserChoice = `brave browser`;
}

async function chrome () {
    browserChoice = `google chrome`;
}

async function edge () {
    browserChoice = `microsoft edge`;
}

async function firefox () {
    browserChoice = `firefox`;
}

async function opera () {
    browserChoice = `opera`;
}

async function safari () {
    browserChoice = `safari`;
}

async function vivaldi () {
    browserChoice = `vivaldi`;
}

async function allBrowsers () {
    browserChoice = [
        `brave browser`,
        `google chrome`,
        `microsoft-edge`,
        `firefox`,
        `opera`,
        `safari`,
        `vivaldi`
    ];
}

let validateHTML = () => {
    return gulp.src(
        `html/*.html`)
        .pipe(htmlValidator());
};

let compressHTML = () => {
    return src([`*.html`])
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod`));
};

let compressCSS = () => {
    return src(`css/*.css`)
        .pipe(cssCompressor())
        .pipe(dest(`prod/css`));
};

let transpileJSForDev = () => {
    return src(`js/*.js`)
        .pipe(babel())
        .pipe(dest(`temp/js`));
};

let transpileJSForProd = () => {
    return src(`js/*.js`)
        .pipe(babel())
        .pipe(jsCompressor())
        .pipe(dest(`prod/js`));
};

let lintCSS = () => {
    return src(`css/*.css`)
        .pipe(cssLinter(
            {
                failAfterError: false,
                reporters: [
                    {formatter: `string`, console: true}
                ]
            }
        ));
};

let lintJS = () => {
    return src(`js/*.js`)
        .pipe(jsLinter())
        .pipe(jsLinter.formatEach(`compact`));
};

let serve = () => {
    browserSync({
        notify: true,
        port: 9000,
        reloadDelay: 50,
        browser: browserChoice,
        server: {
            baseDir: [
                `temp`,
                `css`,
                `./`,
                `js`
            ]
        }
    });

    watch(`js/*.js`,
        series(lintJS, transpileJSForDev)
    ).on(`change`, reload);

    watch(`css/*.css`,
        series(lintCSS)
    ).on(`change`, reload);

    watch(`*.html`,
        series(validateHTML)
    ).on(`change`, reload);
};

async function clean() {
    let fs = require(`fs`),
        i,
        foldersToDelete = [`temp`, `prod`];

    for (i = 0; i < foldersToDelete.length; i++) {
        try {
            fs.accessSync(foldersToDelete[i], fs.F_OK);
            process.stdout.write(`\n\tThe ` + foldersToDelete[i] +
                ` directory was found and will be deleted.\n`);
            del(foldersToDelete[i]);
        } catch (e) {
            process.stdout.write(`\n\tThe ` + foldersToDelete[i] +
                ` directory does NOT exist or is NOT accessible.\n`);
        }
    }

    process.stdout.write(`\n`);
}

async function listTasks () {
    let exec = require(`child_process`).exec;

    exec(`gulp --tasks`, function (error, stdout, stderr) {
        if (null !== error) {
            process.stdout.write(`An error was likely generated when invoking ` +
                `the “exec” program in the default task.`);
        }

        if (`` !== stderr) {
            process.stdout.write(`Content has been written to the stderr stream ` +
                `when invoking the “exec” program in the default task.`);
        }

        process.stdout.write(`\n\tThis default task does ` +
            `nothing but generate this message. The ` +
            `available tasks are:\n\n${stdout}`);
    });
}

exports.brave = series(brave, serve);
exports.firefox = series(firefox, serve);
exports.chrome = series(chrome, serve);
exports.opera = series(opera, serve);
exports.edge = series(edge, serve);
exports.safari = series(safari, serve);
exports.vivaldi = series(vivaldi, serve);
exports.allBrowsers = series(allBrowsers, serve);
exports.validateHTML = validateHTML;
exports.compressHTML = compressHTML;
exports.compressCSS = compressCSS;
exports.transpileJSForDev = transpileJSForDev;
exports.transpileJSForProd = transpileJSForProd;
exports.lintJS = lintJS;
exports.lintCSS = lintCSS;
exports.build = series(
    compressCSS,
    compressHTML,
    transpileJSForProd
);
exports.default = series(
    lintJS,
    lintCSS,
    validateHTML,
    transpileJSForDev,
    serve
);
exports.clean = clean;
exports.listTasks = listTasks;