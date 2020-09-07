/**
BSD 3-Clause License

Copyright (c) 2020, MindEarth
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var express = require('express');
var CryptoJS = require("crypto-js");

var pool = require('./mysql_config');

var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
	query = 'select count(*) as cnt from users where lcase(?) = uname and md5(?) = psw';	

	pool.query(query, [req.body.uname, req.body.psw], function (err, rows, fields) {
		if (!err) {
		    if (rows[0].cnt == 1) {
		    	today = new Date();

				res.cookie('uname', req.body.uname);
				res.cookie('secret', CryptoJS.MD5(today.getDate()).toString())

				res.redirect('/');
		    } else {
		    	res.redirect('/login');
		    }
		} else {
		    res.status(500).send('Database error');
		}
	});
});

router.get('/logout', function(req, res, next) {
	res.clearCookie('uname');
	res.clearCookie('secret');

	res.redirect('/');	
});

function checkAuth(req) {
	return new Promise(function(resolve, reject) {
  		if (req.cookies.uname === undefined || req.cookies.secret === undefined) {
  			reject();
  		}

		query = "select count(*) as cnt from users where lcase(?) = uname";

		pool.query(query, [req.cookies.uname], function (err, rows, fields) {
			if (!err) {
			    if (rows[0].cnt == 1) {

			    	today = new Date();
			    	
			    	if (req.cookies.secret === CryptoJS.MD5(today.getDate()).toString() ) {
			    		resolve(req.cookies.uname);
			    	}		    		    
			    }
			}

			reject();
		});
	});
}

module.exports = {
	"router": router,
	"checkAuth": checkAuth
};
