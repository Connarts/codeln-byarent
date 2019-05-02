var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var upload = multer({
    dest: path.join(__dirname, '/img')
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});
var passport = require('passport');
var app = express();
var morgan = require('morgan');
var server = http.Server(app);
var mysql = require('mysql');
var session = require('express-session');
app.use(session({
    secret: '"xiooi-=-09R$NDJ&("]]csd90',
    resave: false,
    saveUninitialized: true
}));
// create db if it does not exit
var pool = mysql.createPool({
    connectionLimit: 15, // Default: 0
    host: 'localhost', // ?
    user: 'root',
    password: "",
    database: 'pyarent',
    acquireTimeout: 1800000 // 10000 is 10 secs
});

pool.on('acquire', function (connection) {
    console.log('Connection to DB with threadID %d acquired', connection.threadId);
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, function () {
    console.log('node server listening on port :', PORT);
});

var isEmpty = function (data) {
    if (typeof data === 'object') {
        if (JSON.stringify(data) === '{}' || JSON.stringify(data) === '[]') {
            return true;
        } else if (!data) {
            return true;
        }
        return false;
    } else if (typeof data === 'string') {
        if (!data.trim()) {
            return true;
        }
        return false;
    } else if (typeof data === 'undefined') {
        return true;
    } else {
        return false;
    }
};

/**
 * It is important to note that res.render() will look in a views folder for the view.
 * So we only have to define pages/index since the full path is views/pages/index.
 */
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('node_modules'));
app.use(express.static('assets'));
app.use(express.static('img'));

// set morgan to log info about our requests for development use.
app.use(morgan('dev'));

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// for parsing multipart/form-data
// app.use(upload.array()); // removing this line fixed the unexpected field problem. // https://github.com/expressjs/multer/issues/690#issuecomment-444177975


//-- routing
app.get('/', function (req, res) {
    // res.type('text/html');
    // res.contentType('*/*');
    // res.sendFile(__dirname + '/index.html');

    var sqlquery1 = "SELECT * FROM houses LIMIT 12";
    pool.query(sqlquery1, function (error1, results1, fields1) {
        console.log('selected houses', results1); // results[0].id ...
        if (error1) throw error1;
        // show user!

        var sqlquery2 = "SELECT id, file FROM pictures LIMIT 64";
        pool.query(sqlquery2, function (error2, results2, fields2) {
            console.log('selected pictures', results2); // results[0].id ...
            if (error2) throw error2;
            // show user!

            res.render('pages/index', {
                houses: results1,
                pictures: results2
            });
        });

    });

    
});

app.get('/login', function (req, res) {
    // res.sendFile(__dirname + '/comein.html');
    res.render('pages/comein');
});

app.get('/logout', function (req, res) {
    // res.sendFile(__dirname + '/comein.html');
    res.render('pages/index');
});

app.get('/signup', function (req, res) {
    // res.sendFile(__dirname + '/comein.html');
    res.render('pages/comein');
});

app.get('/house', function (req, res) {
    // res.sendFile(__dirname + '/house.html');
    console.log('house', req.query.id); // req.query('id') req.url
    
    if (req.session.loggedin == true) {
        
    }
    // res.render('pages/house');

    var sqlquery1 = "SELECT * FROM houses WHERE id = " + req.query.id;
    pool.query(sqlquery1, function (error1, results1, fields1) {
        console.log('selected house to show', results1); // results[0].id ...
        if (error1) throw error1;
        // show user!
        var sqlquery2 = "SELECT * FROM pictures WHERE id = " + req.query.id;
        pool.query(sqlquery2, function (error2, results2, fields2) {
            console.log('selected house to show', results2); // results[0].id ...
            if (error2) throw error2;
            // show user!
            console.log('selected pictures for house to show', results2);
            console.log('user obj', JSON.stringify(req.session.user));
            res.render('pages/house', {
                house: results1[0], // since it's only one house
                pictures: results2,
                user: JSON.stringify(req.session.user), // JSON.stringify(req.session.user) 
                loggedin: req.session.loggedin
            });

        });

    });

});

app.get('/cart', function (req, res) {
    // res.sendFile(__dirname + '/cart.html');
    console.log('000000000000000', isEmpty(req.session.user));
    res.render('pages/cart', {
        user: (isEmpty(req.session.user) ? false : JSON.stringify(req.session.user)), // JSON.stringify(req.session.user) 
        loggedin: (isEmpty(req.session.loggedin) ? false : req.session.loggedin )
    });
});

app.get('/sale', function (req, res) {
    // res.sendFile(__dirname + '/cart.html');
    var sqlquery1 = "SELECT * FROM houses";
    pool.query(sqlquery1, function (error1, results1, fields1) {
        console.log('selected houses', results1); // results[0].id ...
        if (error1) throw error1;
        // show user!

        var sqlquery2 = "SELECT * FROM pictures";
        pool.query(sqlquery2, function (error2, results2, fields2) {
            console.log('selected pictures', results2); // results[0].id ...
            if (error2) throw error2;
            // show user!

            res.render('pages/sale', {
                houses: results1,
                pictures: results2,
                user: JSON.stringify(req.session.user),
                loggedin: req.session.loggedin
            });
        });

    });
});

app.get('/dashboard', function (req, res) {
    // res.sendFile(__dirname + '/byarent.html');
    res.render('pages/dashboard');
});

app.get('/admin', function (req, res) {
    // res.sendFile(__dirname + '/byarent.html');
    res.render('pages/admin');
});

app.post('/login', function (req, res) {
    // handle post request, validate data with database.
    // how to handle wrong password with right email or more rearly, right password and wrong password.
    var sqlquery = "SELECT * FROM users WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "' ";
    pool.query(sqlquery, function (error, results, fields) {
        console.log('selected data from db, logging In...', results[0]); // error sometimes, maybe when there's no db conn: ...
        if (error) throw error;
        // !
        console.log(req.body.password, 'selected...', req.body.email );
        if (req.body.email == 'admin@byarent.com' && req.body.password == 'password') {
            req.session.admin = true;

            res.redirect('/admin');
            
        } else if (isEmpty(results) ) {
            // res.status(502).send('could not log in, wrong login details, try again.');
            res.status(502).redirect('/login?l=n');
        } else {
            console.log('12345 ', req.session.id);
            console.log('\nfields:\n', fields, '\nresults:\n', results);
            // results[0].email & results[0].email
            if (error) throw error;
            req.session.user = results[0]
            req.session.loggedin = true;

            res.redirect('/sale');

        }
    });
});

app.post('/signup', function (req, res) {
    var sqlquery = "INSERT INTO users(email, fullname, password) VALUES ('" + req.body.Remail + "', '" + req.body.Rfullname + "', '" + req.body.Rpassword + "' )";
    pool.query(sqlquery, function (error, results, fields) {
        console.log('inserted data from: ', results);
        if (error) throw error;
        // connected!
        if (results.affectedRows === 1) {
            // req.session.user = req.body;
            req.session.loggedin = true;
            res.redirect('/sale');
        }
    });
});

app.post('/addhouse', upload.array('pictures', 12), function (req, res, next) {
    // req.files is array of `pictures` files
    // req.body will contain the text fields, if there were any
    console.log('files', req.files);
    /* var tmp_path = req.files.recfile.path;
    var target_path = 'uploads/' + req.files.recfile.name;
    fs.readFile(tmp_path, function (err, data) {
        fs.writeFile(target_path, data, function (err) {
            res.render('complete');
        })
    }); */

    /***
     *  // https://stackoverflow.com/questions/31530200/node-multer-unexpected-field/31532067
        // When using the "single" data come in "req.file" regardless of the attribute "name".
        var tmp_path = req.file.path;

        // The original name of the uploaded file stored in the variable "originalname".
        var target_path = 'img/' + req.file.originalname;

        //A better way to copy the uploaded file.
        var src = fs.createReadStream(tmp_path);
        var dest = fs.createWriteStream(target_path);
        src.pipe(dest);
        src.on('end', function () {
            res.render('complete');
        });
        src.on('error', function (err) {
            res.render('error');
        });
    */

    

    // handle post request, validate data with database.
    // how to handle wrong password with right email or more rearly, right password and wrong password.
    var sqlquery = "INSERT INTO houses(description, item_name, price) VALUES ('" + req.body.description + "', '" + req.body.type + "', '" + req.body.price + "' )";
    pool.query(sqlquery, function (error, results, fields) {
        console.log('inserted data from: ', results);
        console.log('error data from: ', error);
        console.log('fields data from: ', fields);
        if (error) throw error;
        // connected!
        if (results.affectedRows === 1) {
            // req.session.user = req.body;
            // add pictures --select the last item from the houses table and insert pictures
            var sqlquery_ = "SELECT id FROM houses WHERE description = '" + req.body.description + "' AND item_name = '" + req.body.type + "'AND price = '" + req.body.price + "' ";
            // loop through the files and save them to db and disk

            pool.query(sqlquery_, function (error, results, fields) {
                // repeat this query for all the number of pictures
                Object.entries(req.files).forEach(
                    ([key, value]) => {
                        console.log('key:', key, 'value:', value);
                        /** When using the "single"
                         data come in "req.file" regardless of the attribute "name". 
                        **/
                        var tmp_path = value.path;

                        /** The original name of the uploaded file
                            stored in the variable "originalname".
                        **/
                        var target_path = 'img/' + value.originalname;

                        /** A better way to copy the uploaded file. **/
                        var src = fs.createReadStream(tmp_path);
                        var dest = fs.createWriteStream(target_path);
                        src.pipe(dest);
                        src.on('end', function () {
                            // res.render('complete');
                            console.log('complete');

                            var sqlquery__ = "INSERT INTO pictures(id, file) VALUES ('" + results[0].id + "', '" + value.originalname + "' )";
                            pool.query(sqlquery__, function (error, results, fields) {
                                // inserted in db
                                console.log('inserted in db');

                            });
                        });
                        src.on('error', function (err) {
                            // res.render('error');
                            console.log('error');
                        });

                    }
                );
            });
            res.redirect('/admin?added=yes');
        } else {
            res.redirect('/admin?added=no');
        }
    });

});

const handleError = (err, res) => {
    res.status(500)
        .contentType("text/plain")
        .end("Oops! Something went wrong!");
};

app.post("/sendcart", (req, res) => {

    console.log('cart', req.body);
    res.redirect('/cart?added=no');
    /* var sqlquery = "INSERT INTO orders(item_name, item_id, user_id) VALUES ('" + req.body.Remail + "', '" + req.body.Rfullname + "', '" + req.body.Rpassword + "' )";
    pool.query(sqlquery, function (error, results, fields) {
        console.log('inserted data from: ', results);
        if (error) throw error;
        // connected!
        if (results.affectedRows === 1) {
            // req.session.user = req.body;
            req.session.loggedin = true;
            res.redirect('/sale');
        }
    });
        */
    } 
);

// https://scotch.io/tutorials/use-ejs-to-template-your-node-application

// https://github.com/Connarts/codeln-byarent.git

// https://stackoverflow.com/questions/15772394/how-to-upload-display-and-save-images-using-node-js-and-express855.00.