var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var adminicon = `<img width="35vh" src="https://raw.githubusercontent.com/RyanL-29/CSIT314/master/CSIT314/html/admin.png">`;
var reportericon = `<img width="35vh" src="https://raw.githubusercontent.com/RyanL-29/CSIT314/master/CSIT314/html/reporter.png">`;
var usericon = `<img width="35vh" src ="https://raw.githubusercontent.com/RyanL-29/CSIT314/master/CSIT314/html/Breezeicons-actions-22-im-user-online.svg.png">`
var openicon = `<img width="35vh" src ="https://raw.githubusercontent.com/RyanL-29/CSIT314/master/CSIT314/html/open.png">`
var closeicon = `<img width="35vh" src ="https://raw.githubusercontent.com/RyanL-29/CSIT314/master/CSIT314/html/close.png">`
var processingicon = `<img width="35vh" src ="https://raw.githubusercontent.com/RyanL-29/CSIT314/master/CSIT314/html/processing.png">`
//MySQL Connection=========================================
var connection = mysql.createConnection({
    host: 'aniprivate.mynetgear.com',
    port: 65433,
    user: 'ani',
    password: 'Yuimy83726',
    database: 'csit334'
});
//=========================================================

//Recover the connection if timeout =======================
connection.on('error', err => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connection.createConnection;
        } else {
            throw err;
        }
    });
//=========================================================
var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.redirect('/home');
});
//Login page==============================================
app.post('/auth', function (request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (results) {
                if (results.length > 0) {
                    request.session.loggedin = true;
                    request.session.username = username;
                    request.session.bugsubmit = false;
                    if (results[0].admin == 1) { request.session.admin = true; }
                    else if (results[0].reporter == 1) { request.session.reporter = true; }
                    else { request.session.user = true; }
                    response.redirect('/home');
                    response.end();
                } else {
                    response.redirect('/auth');
                    response.end();
                }
            }
            else {
                response.redirect('/auth');
                response.end();
            }
			
		});
	} else {
        response.redirect('/auth');
		response.end();
	}
});
//=========================================================
app.get('/welcome2us', function (request, response) {
	response.sendFile(path.join(__dirname + '/html/register.html'));
});
//Register page============================================
app.post('/register', function (request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var email = request.body.email;
	if (username && password && email) {
		connection.query('INSERT INTO accounts (username, password, email) VALUES (?,?,?)', [username, password, email], function (error, results) {
			if (error) {
				response.send('Something went wrong!! Error info:' + error);
			} else {
				request.session.loggedin = true;
                request.session.username = username;
                request.session.bugsubmit = false;
				response.redirect('/home');
			}
			response.end();
		});
	} else {
		response.send('Please enter Username, Password and Email !!');
		response.end();
	}
});
//========================================================


//Home page===============================================
app.get('/home', function (request, response) {
    if (request.session.loggedin) {
        request.session.bugsubmit = false;
        var icon;
        if (request.session.admin == true) { icon = adminicon; }
        else if (request.session.reporter == true) { icon = reportericon; }
        else if (request.session.user == true) { icon = usericon; }
        else { icon = usericon; }
		response.setHeader('Content-type', 'text/html');
        response.write(`<!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
                <title>home</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
                    <style media="screen">
                        #welcome{
                            padding-top: 60px;
          padding-bottom: 50px;
          text-align: center;
        }
        .image{
         width: 200px;
        }
        #center{
         margin-left: auto;
         margin-right: auto;
        }
        table tr td{
          padding-bottom: 30px;
          text-align: center;
        }
      </style>
  </head>
                <body>
                    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                        <div class="container-fluid">
                            <a class="navbar-brand" href="/">Bug Tracker</a>
                            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <div class="collapse navbar-collapse" id="navbarText">
                                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                    <li class="nav-item">
                                        <a class="nav-link active" aria-current="page" href="/">Home</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/report">New Bug</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/aboutUs">About Us</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/bug">Bug Record</a>
                                    </li>
                                </ul>
                            </div>
                                <ul class="navbar-nav me-auto mb-2 mb-lg-0 navbar-right">
                                <a class="user" href="#" style="color: white; text-decoration: inherit; white-space: nowrap;">`+ icon + ` Welcome ! `+ request.session.username + `</a>
                                </ul>
                        </div>
                    </nav>

                    <h1 id="welcome">Welcome to Bug Tracker</h1>

                    <table id="center">
                        <tr>
                            <td> <a href="/report"><img src="https://raw.githubusercontent.com/RyanL-29/CSIT314/master/CSIT314/html/add.png" alt="" class="image"> </a> </td>

  </tr>
                            <tr>
                                <td><a href="/report">New Bug</a></td>
                            </tr>
</table>



                        <footer class="text-center text-white fixed-bottom" style="background-color: #000000;">
                            <!-- Grid container -->
  <div class="container p-4"></div>
                            <!-- Grid container -->
  <div class="container p-4 pb-0">
                                <!-- Section: Social media -->
      <section class="mb-4">
                                    <!-- Facebook -->
        <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button"
                                    > Contact Us</a>

                                    <!-- Twitter -->
        <a class="btn btn-outline-light btn-floating m-1" href="/aboutUs" role="button"
                                    >About Us</a>

                                </section>
                                <!-- Section: Social media -->
    </div>
                            <!-- Grid container -->
  <!-- Copyright -->
  <div class="text-center p-3" style="background-color: rgba(0, 0, 0, 0.2);">
                                &#169; 2020 Copyright:
    <a class="text-white" href="https://mdbootstrap.com/">MDBootstrap.com</a>
                            </div>
                            <!-- Copyright -->
</footer>
  </body>
</html>`);
	response.end();
	} else {
        request.session.bugsubmit = false;
		response.setHeader('Content-type', 'text/html');
        response.write(`<!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
                <title>home</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
                    <style media="screen">
                        #welcome{
                            padding-top: 60px;
          padding-bottom: 50px;
          text-align: center;
        }
        .image{
         width: 200px;
        }
        #center{
         margin-left: auto;
         margin-right: auto;
        }
        table tr td{
          padding-bottom: 30px;
          text-align: center;
        }
      </style>
  </head>
                <body>
                    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                        <div class="container-fluid">
                            <a class="navbar-brand" href="/">Bug Tracker</a>
                            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <div class="collapse navbar-collapse" id="navbarText">
                                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                    <li class="nav-item">
                                        <a class="nav-link active" aria-current="page" href="/">Home</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/report">New Bug</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/aboutUs">About Us</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/bug">Bug Record</a>
                                    </li>
                                </ul>
                            </div>
                                <ul class="navbar-nav me-auto mb-2 mb-lg-0 navbar-right">
                                <a class="user" href="#" style="color: white; text-decoration: inherit; white-space: nowrap;">Welcome ! Guest</a>
                                <a class="user" href="#" style="color: white; text-decoration: inherit; white-space: nowrap;">&nbsp;&nbsp;|&nbsp;&nbsp;</a>
                                <a class="user" href="/login" style="color: white; text-decoration: inherit; white-space: nowrap;">Login</a>
                                </ul>
                        </div>
                    </nav>

                    <h1 id="welcome">Welcome to Bug Tracker</h1>

                    <table id="center">
                        <tr>
                            <td> <a href="/report"><img src="https://raw.githubusercontent.com/RyanL-29/CSIT314/master/CSIT314/html/add.png" alt="" class="image"> </a> </td>

  </tr>
                            <tr>
                                <td><a href="/report">New Bug</a></td>
                            </tr>
</table>



                        <footer class="text-center text-white fixed-bottom" style="background-color: #000000;">
                            <!-- Grid container -->
  <div class="container p-4"></div>
                            <!-- Grid container -->
  <div class="container p-4 pb-0">
                                <!-- Section: Social media -->
      <section class="mb-4">
                                    <!-- Facebook -->
        <a class="btn btn-outline-light btn-floating m-1" href="#!" role="button"
                                    > Contact Us</a>

                                    <!-- Twitter -->
        <a class="btn btn-outline-light btn-floating m-1" href="/aboutUs" role="button"
                                    >About Us</a>

                                </section>
                                <!-- Section: Social media -->
    </div>
                            <!-- Grid container -->
  <!-- Copyright -->
  <div class="text-center p-3" style="background-color: rgba(0, 0, 0, 0.2);">
                                &#169; 2020 Copyright:
    <a class="text-white" href="https://mdbootstrap.com/">MDBootstrap.com</a>
                            </div>
                            <!-- Copyright -->
</footer>
  </body>
</html>`);
	response.end();
	}
	
});
//=========================================================
//Report page==============================================
app.get('/report', function (request, response) {
    if (request.session.loggedin) {
        request.session.bugsubmit = false;
        response.sendFile(path.join(__dirname + '/html/New_bug.html'));
    }
    else {
        response.sendFile(path.join(__dirname + '/html/login.html'));
    }
});
//========================================================
//Login page
app.get('/login', function (request, response) {
    if (!request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/html/login.html'));
    }
    else {
        response.redirect('/home');
    }
});
//========================================================
//
//Record bug==============================================
app.post('/recordbug', function (request, response) {
    if (request.session.loggedin) {
        let date_ob = new Date();
        // current date
        // adjust 0 before single digit date
        let date = ("0" + date_ob.getDate()).slice(-2);

        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

        // current year
        let year = date_ob.getFullYear();

        // current hours
        let hours = date_ob.getHours();

        // current minutes
        let minutes = date_ob.getMinutes();

        // current seconds
        let seconds = date_ob.getSeconds();
        var subject = request.body.subject;
        var errorcode = request.body.errorcode;
        var description = request.body.description;
        var username = request.session.username;
        var time = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
        if (subject && errorcode && description) {
            connection.query('INSERT INTO report (username, subject, errorcode, description, time) VALUES (?,?,?,?,?)', [username, subject, errorcode, description, time], function (error, results) {
                if (error) {
                    response.send('Something went wrong!! Error info:' + error);
                } else {
                    request.session.bugsubmit = true;
                    response.redirect('/submitted');
                }
                response.end();
            });
        } else {
            response.send('Please enter Username, Password and Email !!');
            response.end();
        }
    }
    else {
        response.sendFile(path.join(__dirname + '/html/login.html'));
    }
});

app.get('/submitted', function (request, response) {
    if (request.session.loggedin && request.session.bugsubmit == true) {
        response.sendFile(path.join(__dirname + '/html/submitted.html'));
    }
    else {
        response.redirect('/home');
    }
});

app.get('/aboutUs', function (request, response) {
        response.sendFile(path.join(__dirname + '/html/about_us.html'));
});

app.post('/close', function (request, response) {
    var issueID = request.body.issueID;
    if (issueID && request.session.loggedin) {
        connection.query('UPDATE report SET status = 2 WHERE id = ?', [issueID], function (error, results) {
            if (error) {
                response.send('Something went wrong!! Error info:' + error);
            } else {
                response.redirect('/bug');
            }
            response.end();
        });
    }

});

app.post('/processing', function (request, response) {
    var issueID = request.body.issueID;
    if (issueID && request.session.loggedin) {
        connection.query('UPDATE report SET status = 1 WHERE id = ?', [issueID], function (error, results) {
            if (error) {
                response.send('Something went wrong!! Error info:' + error);
            } else {
                response.redirect('/bug');
            }
            response.end();
        });
    }

});

app.post('/reopen', function (request, response) {
    var issueID = request.body.issueID;
    if (issueID && request.session.loggedin) {
        connection.query('UPDATE report SET status = 0 WHERE id = ?', [issueID], function (error, results) {
            if (error) {
                response.send('Something went wrong!! Error info:' + error);
            } else {
                response.redirect('/bug');
            }
            response.end();
        });
    }

});

app.get('/bug', function (request, response) {
    var bugContent = `&nbsp`;
    var statusicon;
    connection.query('SELECT * FROM report', function (error, results, fields) {
        if (results) {
            if (results.length > 0) {
                if (request.session.admin == 1 || request.session.reporter == 1) {
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].status == 0) { statusicon = openicon; }
                        else if (results[i].status == 1) { statusicon = processingicon; }
                        else if (results[i].status == 2) { statusicon = closeicon; }
                        else { statusicon = openicon; }
                        bugContent += `<div class="list-group" style="width:50%; margin-left:auto; margin-right:auto; margin-bottom:15px;">
                                <a href="/detail?rn=`+ results[i].id + `" class="list-group-item list-group-item-action flex-column align-items-start">
                                  <div class="d-flex w-100 justify-content-between">
                                    <!--title-->
                                    <h5 class="mb-1" id="title">` + results[i].subject + ` Error: ` + results[i].errorcode + `</h5>
                                    <!--date-->
                                    <small id="date">                                   
                                    <div>
                                    <form style="display:inline;" action="close" method="post">
                                        <input type="submit" name="upvote" value="Close" />
                                        <input name='issueID' type='hidden' value='`+ results[i].id + `'>
                                    </form>
                                    <form style="display:inline;" action="processing" method="post">
                                        <input type="submit" name="upvote" value="Processing" />
                                        <input name='issueID' type='hidden' value='`+ results[i].id + `'>
                                    </form>
                                    <form style="display:inline;" action="reopen" method="post">
                                        <input type="submit" name="reopen" value="Re-Open" />
                                        <input name='issueID' type='hidden' value='`+ results[i].id + `'>
                                    </form>
                                    </div>
                                    Published on:\n `+ results[i].time + ` ` + statusicon + `
                                   </small>
                                  </div>
                                  <!--creator-->
                                  <small>Created By: ` + results[i].username + `</small>
                                   <br>
                                  <small>Issue ID: #` + results[i].id + `</small>
                                </a>
                              </div>`;
                    }
                }
                else {
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].status == 0) { statusicon = openicon; }
                        else if (results[i].status == 1) { statusicon = processingicon; }
                        else if (results[i].status == 2) { statusicon = closeicon; }
                        else { statusicon = openicon; }
                        if (results[i].username == request.session.username) {
                            bugContent += `<div class="list-group" style="width:50%; margin-left:auto; margin-right:auto; margin-bottom:15px;">
                                <a href="/detail?rn=`+ results[i].id + `" class="list-group-item list-group-item-action flex-column align-items-start">
                                  <div class="d-flex w-100 justify-content-between">
                                    <!--title-->
                                    <h5 class="mb-1" id="title">` + results[i].subject + ` Error: ` + results[i].errorcode + `</h5>
                                    <!--date-->
                                    <small id="date">                                   
                                    <div>
                                    <form style="display:inline;" action="close" method="post">
                                        <input type="submit" name="upvote" value="Close" />
                                        <input name='issueID' type='hidden' value='`+ results[i].id + `'>
                                    </form>
                                    <form style="display:inline;" action="reopen" method="post">
                                        <input type="submit" name="reopen" value="Re-Open" />
                                        <input name='issueID' type='hidden' value='`+ results[i].id + `'>
                                    </form>
                                    </div>
                                    Published on:\n `+ results[i].time + ` ` + statusicon + `
                                   </small>
                                  </div>
                                  <!--creator-->
                                  <small>Created By: ` + results[i].username + `</small>
                                   <br>
                                  <small>Issue ID: #` + results[i].id + `</small>
                                </a>
                              </div>`;
                        }
                        else {
                            bugContent += `<div class="list-group" style="width:50%; margin-left:auto; margin-right:auto; margin-bottom:15px;">
                                    <a href="/detail?rn=`+ results[i].id + `" class="list-group-item list-group-item-action flex-column align-items-start">
                                      <div class="d-flex w-100 justify-content-between">
                                        <!--title-->
                                        <h5 class="mb-1" id="title">` + results[i].subject + ` Error: ` + results[i].errorcode + `</h5>
                                        <!--date-->
                                        <small id="date">Published on:\n `+ results[i].time + ` ` + statusicon + `</small>
                                      </div>
                                      <!--creator-->
                                      <small>Created By: ` + results[i].username + `</small>
                                       <br>
                                      <small>Issue ID: #` + results[i].id + `</small>
                                    </a>
                                  </div>`;
                        }
                    }
                }
                var html = `<!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
                <title>home</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
                    <style media="screen">
                        #welcome{
                            padding-top: 60px;
          padding-bottom: 50px;
          text-align: center;
        }
        .image{
         width: 200px;
        }
        #center{
         margin-left: auto;
         margin-right: auto;
        }
        table tr td{
          padding-bottom: 30px;
          text-align: center;
        }
      </style>
  </head>
                <body>
                    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                        <div class="container-fluid">
                            <a class="navbar-brand" href="/">Bug Tracker</a>
                            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <div class="collapse navbar-collapse" id="navbarText">
                                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                    <li class="nav-item">
                                        <a class="nav-link active" aria-current="page" href="/">Home</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/report">New Bug</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/aboutUs">About Us</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/bug">Bug Record</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                <br>`
                    + bugContent +
                    `</body>
</html>`
                response.setHeader('Content-type', 'text/html');
                response.write(html);
                response.end();
            } else {
                response.setHeader('Content-type', 'text/html');
                response.send('No Issue Yet');
                response.end();
            }
        } else {
            response.redirect('/home');
        }
    });
});
//========================================================

//Detail report===========================================

app.get('/detail', function (request, response) {
    var id = request.query.rn;
    var status;
    var bugDetail = `&nbsp`;
    connection.query('SELECT * FROM report WHERE id = ?', [id], function (error, results, fields) {
        //console.log(results[0]);
        if (results[0].status == 0) { status = "Open <span style='padding-left:7em'>" + openicon + "</span>"; }
        else if (results[0].status == 1) { status = "Processing <span style='padding-left:7em'>" + processingicon + "</span>"; }
        else if (results[0].status == 2) { status = "Closed <span style='padding-left:7em'>" + closeicon + "</span>"; }
        else { status = "Error"; }
        if (results.length >= 0) {
            bugDetail += `<div class="left">
                <div class="right">
                    <div class="card" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title"> Error Code: <a id="username">` + results[0].errorcode + `</a></h5>
                            <p class="card-text"> Starter: <a id="errorcode">` + results[0].username + `</a> </p>
                        </div>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"> Status: <a id="status">` + status + `</a> </li>
                            <li class="list-group-item"> Created Date: <a id="date">` + results[0].time + `</a></li>
                        </ul>
                    </div>
                </div>
                <div id="accordion">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">

                                <p id="tittle">` + results[0].subject + `</p>

                            </h5>
                        </div>
                        <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
                            <div class="card-body">
                                ` + results[0].description + `
        </div>
                        </div>
                    </div>
                </div>
            </div>`
        }
        else {
            response.redirect('/bug');
            response.end();
        }
        var html = `<!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
                <title>home</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
                    <style media="screen">
                        #welcome{
                            padding-top: 60px;
          padding-bottom: 50px;
          text-align: center;
        }
        .image{
         width: 200px;
        }
        #center{
         margin-left: auto;
         margin-right: auto;
        }
        table tr td{
          padding-bottom: 30px;
          text-align: center;
        }
        .left{
          margin-left: auto;
          margin-right: auto;
          width: 800px;
          padding-right:5px;
        }

        .right{
          margin-right: auto;
          margin-left: auto;
          display: inline-block;
          float: right;
          padding-left:5px;
        }
      </style>
  </head>
                <body>
                    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                        <div class="container-fluid">
                            <a class="navbar-brand" href="/">Bug Tracker</a>
                            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <div class="collapse navbar-collapse" id="navbarText">
                                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                    <li class="nav-item">
                                        <a class="nav-link active" aria-current="page" href="/">Home</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/report">New Bug</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/aboutUs">About Us</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" href="/bug">Bug Record</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                <br>`
            + bugDetail +
            `</body>
</html>`
        response.setHeader('Content-type', 'text/html');
        response.write(html);
        response.end();
    });
});

//========================================================
app.listen(3000);
