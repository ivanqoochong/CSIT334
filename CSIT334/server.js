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
    if (request.session.loggedin) { response.redirect('/home'); }
    else { response.redirect('/login');}
    
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
                    if (results[0].tourist == 1) { request.session.role = "tourist"; request.session.toursubmit = false;}
                    else { request.session.role = "user"; }
                    response.redirect('/home');
                    response.end();
                } else {
                    response.redirect('/login');
                    response.end();
                }
            }
            else {
                response.redirect('/login');
                response.end();
            }
			
		});
	} else {
        response.redirect('/login');
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
                request.session.role = "user";
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
    if (request.session.loggedin && request.session.role == "tourist") {
        request.session.toursubmit = false;
        response.sendFile(path.join(__dirname + '/html/tourist_home.html'));
    }
    else if (request.session.loggedin && request.session.role == "user")
    {
        response.sendFile(path.join(__dirname + '/html/home.html'));
    }
    else {
        response.redirect('/login');
    }
});
//=========================================================
//Add tour page============================================
app.get('/addtour', function (request, response) {
    if (request.session.loggedin && request.session.role == "tourist") {
        response.sendFile(path.join(__dirname + '/html/create_tour.html'));
    }
    else {
        response.sendFile(path.join(__dirname + '/html/login.html'));
    }
});
//========================================================

//Login page============================================
app.get('/login', function (request, response) {
    if (!request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/html/login.html'));
    }
    else {
        response.redirect('/home');
    }
});
//========================================================

//add tour================================================
app.post('/writetour', function (request, response) {
    if (request.session.loggedin && request.session.role == "tourist") {
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
        var description = request.body.description;
        var username = request.session.username;
        var time = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
        if (subject && description) {
            connection.query('INSERT INTO tour (username, title, description, date) VALUES (?,?,?,?)', [username, subject, description, time], function (error, results) {
                if (error) {
                    response.send('Something went wrong!! Error info:' + error);
                } else {
                    request.session.toursubmit = true;
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
    if (request.session.loggedin && request.session.toursubmit == true) {
        response.sendFile(path.join(__dirname + '/html/submitted.html'));
    }
    else {
        response.redirect('/home');
    }
});

app.get('/delete', function (request, response) {
    var tid = request.query.tid;
    var username = request.session.username;
    if (tid && request.session.loggedin && request.session.role == "tourist") {
        connection.query('DELETE FROM tour WHERE id = ? AND username = ?', [tid, username], function (error, results) {
            if (error) {
                response.send('Something went wrong!! Error info:' + error);
            } else {
                response.redirect('/tourlist');
            }
            response.end();
        });
    }

});
//========================================================

//Get tour list===========================================
app.get('/tourlist', function (request, response) {
    var tourhtml = "&nbsp";
    if (request.session.loggedin) {
        connection.query('SELECT * FROM tour', function (error, results, fields) {
            if (results) {
                if (results.length > 0) {
                    for (var i = 0; i < results.length; i++) {
                     tourhtml +=  `
          <div class="list-group">
            <a href="/tour_detail?tid=` + results[i].id + `" class="list-group-item list-group-item-action flex-column align-items-start">
              <div class="d-flex w-100 justify-content-between">
                <!--tittle-->
                <h5 class="mb-1" id="tittle">` + results[i].title + `</h5>

                <!--date-->
                <div class="">
                  <small id="date">` + results[i].date + `</small>
                  <p> <small>Rating:</small> ` + results[i].rating + ` </p>
                </div>
              </div>
              <!--creator-->
              <small>Created By:</small>
              <small id="username">` + results[i].username + `</small>
            </a>
          </div>



  `;
                    }
                    html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    <title>show tour</title>


  </head>
  <body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <a class="navbar-brand" href="/home">Tour Guy</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="/home">Home <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item active">
            <a class="nav-link" href="/review">Review Tour<span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item active">
            <a class="nav-link" href="#">My profile <span class="sr-only">(current)</span></a>
          </li>
        </ul>
        <form class="form-inline my-2 my-lg-0" action="search" method="get">
          <input class="form-control mr-sm-2" name ="keyword" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-primary" type="submit">Search</button>
        </form>
      </div>
    </nav>


    <br>
`+ tourhtml +`
</body>
</html>`
                    response.setHeader('Content-type', 'text/html');
                    response.write(html);
                    response.end();
                } else {
                    response.setHeader('Content-type', 'text/html');
                    response.send('No Tour Yet');
                    response.end();
                }
            } else {
                response.redirect('/home');
            }
        });
    }
    else {
        response.redirect('/login');
    }
});
//========================================================

//Search tour=============================================
app.get('/search', function (request, response) {
    var keyword = request.query.keyword;
    var tourhtml = "&nbsp";
    if (request.session.loggedin) {
        connection.query('SELECT * FROM tour WHERE id LIKE ? OR title LIKE ? OR description LIKE ?', [keyword, keyword, keyword], function (error, results, fields) {
            if (results) {
                if (results.length >= 0) {
                    for (var i = 0; i < results.length; i++) {
                        tourhtml += `
          <div class="list-group">
            <a href="/tour_detail?tid=` + results[i].id + `" class="list-group-item list-group-item-action flex-column align-items-start">
              <div class="d-flex w-100 justify-content-between">
                <!--tittle-->
                <h5 class="mb-1" id="tittle">` + results[i].title + `</h5>

                <!--date-->
                <div class="">
                  <small id="date">` + results[i].date + `</small>
                  <p> <small>Rating:</small> ` + results[i].rating + ` </p>
                </div>
              </div>
              <!--creator-->
              <small>Created By:</small>
              <small id="username">` + results[i].username + `</small>
            </a>
          </div>



  `;
                    }
                    html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    <title>show tour</title>


  </head>
  <body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <a class="navbar-brand" href="/home">Tour Guy</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="/home">Home <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item active">
            <a class="nav-link" href="/review">Review Tour<span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item active">
            <a class="nav-link" href="#">My profile <span class="sr-only">(current)</span></a>
          </li>
        </ul>
        <form class="form-inline my-2 my-lg-0" action="search" method="get">
          <input class="form-control mr-sm-2" name ="keyword" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-primary" type="submit">Search</button>
        </form>
      </div>
    </nav>


    <br>
`+ tourhtml + `
</body>
</html>`
                    response.setHeader('Content-type', 'text/html');
                    response.write(html);
                    response.end();
                } else {
                    response.setHeader('Content-type', 'text/html');
                    response.send('No Tour Yet');
                    response.end();
                }
            } else {
                response.redirect('/home');
            }
        });
    }
    else {
        response.redirect('/login');
    }
});
//========================================================

//Join tour===============================================

app.get('/join', function (request, response) {
    if (request.session.loggedin) {
        var tid = request.query.tid;
        var username = request.session.username;
        connection.query('INSERT INTO joined (username, tour_id) VALUES (?,?)', [username, tid], function (error, results, fields) {
            if (error) {
                response.redirect('/tour_detail?tid=' + tid);
            } else {
                response.redirect('/tour_detail?tid='+ tid);
            }
            response.end();
        });

    }
    else {
        response.redirect('/login');
    }
});

//========================================================

//Cancel tour=============================================

app.get('/cancel', function (request, response) {
    if (request.session.loggedin) {
        var tid = request.query.tid;
        var username = request.session.username;
        connection.query('DELETE FROM joined WHERE username = ? and tour_id = ?', [username, tid], function (error, results, fields) {
            if (error) {
                response.redirect('/tour_detail?tid=' + tid);
            } else {
                response.redirect('/tour_detail?tid=' + tid);
            }
            response.end();
        });

    }
    else {
        response.redirect('/login');
    }
});

//========================================================

//Detail tour=============================================

app.get('/tour_detail', function (request, response) {
    var tid = request.query.tid;
    var username = request.session.username;
    var tourDetail = `&nbsp`;
    if (request.session.loggedin) {
        connection.query('SELECT * FROM tour WHERE id = ?', [tid], function (error, results, fields) {
            connection.query('SELECT * FROM joined WHERE tour_id = ? and username = ?', [tid, username], function (error1, results1, fields) {
            if (results) {
                if (results.length >= 0) {
                    if (request.session.role == "tourist" && request.session.username == results[0].username) {
                        tourDetail += `<div class="left">
                      <div class="right">
                        <div class="card" style="width: 18rem;">
                          <div class="card-body">
                            <h5 class="card-title"> Username: <a id="username">`+ results[0].username + `</a></h5>
                          </div>
                          <ul class="list-group list-group-flush">
                            <li class="list-group-item"> Rating: <a id="rating">`+ results[0].rating + `</a> </li>
                            <li class="list-group-item"> Created Date: <a id="date">`+ results[0].date + `</a></li>
                            <li class="list-group-item"><a href="/delete?tid=` + results[0].id + `" class="btn btn-warning">Delete Tour</a></li>
                          </ul>
                        </div>
                      </div>
                      <div id="accordion">
                        <div class="card">
                          <div class="card-header">
                            <h5 class="mb-0">

                                <p id="tittle">` + results[0].title + `</p>

                            </h5>
                          </div>
                          <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
                            <div class="card-body">
                              `+ results[0].description + `
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>`}
                      else if (request.session.role == "tourist") {
                            tourDetail += `<div class="left">
                      <div class="right">
                        <div class="card" style="width: 18rem;">
                          <div class="card-body">
                            <h5 class="card-title"> Username: <a id="username">`+ results[0].username + `</a></h5>
                          </div>
                          <ul class="list-group list-group-flush">
                            <li class="list-group-item"> Rating: <a id="rating">`+ results[0].rating + `</a> </li>
                            <li class="list-group-item"> Created Date: <a id="date">`+ results[0].date + `</a></li>
                          </ul>
                        </div>
                      </div>
                      <div id="accordion">
                        <div class="card">
                          <div class="card-header">
                            <h5 class="mb-0">

                                <p id="tittle">` + results[0].title + `</p>

                            </h5>
                          </div>
                          <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
                            <div class="card-body">
                              `+ results[0].description + `
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>`}
                    else {
                       console.log(results1.length);
                        if (results1.length > 0) {
                                
                                tourDetail += `<div class="left">
                      <div class="right">
                        <div class="card" style="width: 18rem;">
                          <div class="card-body">
                            <h5 class="card-title"> Username: <a id="username">`+ results[0].username + `</a></h5>
                          </div>
                          <ul class="list-group list-group-flush">
                            <li class="list-group-item"> Rating: <a id="rating">`+ results[0].rating + `</a> </li>
                            <li class="list-group-item"> Created Date: <a id="date">`+ results[0].date + `</a></li>
                            <li class="list-group-item"><a href="/cancel?tid=` + tid + `" class="btn btn-warning">Cancel</a></li>
                          </ul>
                        </div>
                      </div>
                      <div id="accordion">
                        <div class="card">
                          <div class="card-header">
                            <h5 class="mb-0">

                                <p id="tittle">` + results[0].title + `</p>

                            </h5>
                          </div>
                          <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
                            <div class="card-body">
                              `+ results[0].description + `
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>`
                            }
                            else {
                                tourDetail += `<div class="left">
                      <div class="right">
                        <div class="card" style="width: 18rem;">
                          <div class="card-body">
                            <h5 class="card-title"> Username: <a id="username">`+ results[0].username + `</a></h5>
                          </div>
                          <ul class="list-group list-group-flush">
                            <li class="list-group-item"> Rating: <a id="rating">`+ results[0].rating + `</a> </li>
                            <li class="list-group-item"> Vote: <form class="rating" method="post" action="rate">
                              <label>
                                <input type="radio" name="stars" value="1" />
                                <span class="icon">&#128970;</span>
                              </label>
                              <label>
                                <input type="radio" name="stars" value="2" />
                                <span class="icon">&#128970;</span>
                                <span class="icon">&#128970;</span>
                              </label>
                              <label>
                                <input type="radio" name="stars" value="3" />
                                <span class="icon">&#128970;</span>
                                <span class="icon">&#128970;</span>
                                <span class="icon">&#128970;</span>   
                              </label>
                              <label>
                                <input type="radio" name="stars" value="4" />
                                <span class="icon">&#128970;</span>
                                <span class="icon">&#128970;</span>
                                <span class="icon">&#128970;</span>
                                <span class="icon">&#128970;</span>
                              </label>
                              <label>
                                <input type="radio" name="stars" value="5" />
                                <span class="icon">&#128970;</span>
                                <span class="icon">&#128970;</span>
                                <span class="icon">&#128970;</span>
                                <span class="icon">&#128970;</span>
                                <span class="icon">&#128970;</span>
                              </label>
                            </form> </li>
                            <li class="list-group-item"> Created Date: <a id="date">`+ results[0].date + `</a></li>
                            <li class="list-group-item"><a href="/join?tid=`+ tid +`" class="btn btn-primary">Join Tour</a></li>
                          </ul>
                        </div>
                      </div>
                      <div id="accordion">
                        <div class="card">
                          <div class="card-header">
                            <h5 class="mb-0">

                                <p id="tittle">` + results[0].title + `</p>

                            </h5>
                          </div>
                          <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
                            <div class="card-body">
                              `+ results[0].description + `
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>`
                            }
                    }
                    
                }
                else {
                    response.setHeader('Content-type', 'text/html');
                    response.send('No Tour Yet');
                    response.end();
                }
            }
            else {
                response.setHeader('Content-type', 'text/html');
                response.send('No Tour Yet');
                response.end();
            }
            var html = `<!DOCTYPE html>
                <html lang="en" dir="ltr">
                  <head>
                    <meta charset="utf-8">
                    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
                    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
                    <title>show tour</title>
                    <style media="screen">
                    .rating {
                      display: inline-block;
                      position: relative;
                      height: 50px;
                      line-height: 50px;
                      font-size: 50px;
                    }

                    .rating label {
                      position: absolute;
                      top: 0;
                      left: 0;
                      height: 100%;
                      cursor: pointer;
                    }

                    .rating label:last-child {
                      position: static;
                    }

                    .rating label:nth-child(1) {
                      z-index: 5;
                    }

                    .rating label:nth-child(2) {
                      z-index: 4;
                    }

                    .rating label:nth-child(3) {
                      z-index: 3;
                    }

                    .rating label:nth-child(4) {
                      z-index: 2;
                    }

                    .rating label:nth-child(5) {
                      z-index: 1;
                    }

                    .rating label input {
                      position: absolute;
                      top: 0;
                      left: 0;
                      opacity: 0;
                    }

                    .rating label .icon {
                      float: left;
                      color: transparent;
                    }

                    .rating label:last-child .icon {
                      color: #000;
                    }

                    .rating:not(:hover) label input:checked ~ .icon,
                    .rating:hover label:hover input ~ .icon {
                      color: #09f;
                    }

                    .rating label input:focus:not(:checked) ~ .icon:last-child {
                      color: #000;
                      text-shadow: 0 0 5px #09f;
                    }
                    .left{
                      margin-left: auto;
                      margin-right: auto;
                      width: 800px;
                    }

                    .right{
                      margin-right: auto;
                      margin-left: 5px;
                      display: inline-block;
                      float: right;
                    }

                    </style>

                  </head>
                  <body>
                    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                      <a class="navbar-brand" href="#">Tour Guy</a>
                      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                      </button>

                      <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav mr-auto">
                          <li class="nav-item active">
                            <a class="nav-link" href="/home">Home <span class="sr-only">(current)</span></a>
                          </li>
                          <li class="nav-item active">
                            <a class="nav-link" href="/tourlist">Review Tour<span class="sr-only">(current)</span></a>
                          </li>
                          <li class="nav-item active">
                            <a class="nav-link" href="#">My profile <span class="sr-only">(current)</span></a>
                          </li>
                        </ul>
                        <form class="form-inline my-2 my-lg-0">
                          <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
                          <button class="btn btn-primary" type="submit">Search</button>
                        </form>
                      </div>
                    </nav>
                <br>`
                                + tourDetail +
                                `
            <script type="text/javascript">
                $(':radio').change(function() {
                  $.post( "rate", {"rate": this.value, "tid": ` + tid + `});
                });
            </script>
            </body>
                </html>`
            response.setHeader('Content-type', 'text/html');
            response.write(html);
            response.end();
            });
        });
    }
    else {
        response.redirect('/login');
    }
});

//========================================================

//Rate ===================================================
app.post('/rate', function (request, response) {
    console.log(request.body.rate);
    console.log(request.body.tid);
    var rate = request.body.rate;
    var tid = request.body.tid
    if (request.session.loggedin) {
        connection.query('SELECT rating FROM tour WHERE id = ?', [tid], function (error, results, fields) {
            if (results.length > 0) { 
                var update_rate = (Number(results[0].rating) + Number(rate)) / 2;
                update_rate = Math.floor(update_rate);
                connection.query('UPDATE tour SET rating = ? WHERE id = ?', [update_rate, tid], function (error, results, fields) {
                if (error) {
                    response.redirect('/tour_detail?tid=' + tid);
                } else {
                    response.redirect('/tour_detail?tid=' + tid);
                }
            });
            }
        });
    }
});
//========================================================
var port = 5000;
app.listen(port);
console.log("Listening on: " + port)
