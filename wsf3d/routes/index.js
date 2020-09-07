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

var auth = require('./auth');
var pool = require('./mysql_config');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	auth.checkAuth(req).then(
		function(result) {
			res.render('index');  
		},
		function(error) {
			res.redirect('/login');
		}
	);
});

router.get('/tutorial/:page', function(req, res, next) {
	auth.checkAuth(req).then(
		function(result) {

			console.log(req.params.page);

			res.render('tutorial', req.params);  
		},
		function(error) {
			res.redirect('/login');
		}
	);
});

router.get('/login', function(req, res, next) {
	res.render('login');      
});

router.get('/stats', function(req, res, next) {
	auth.checkAuth(req).then(
		function(user) {
			query = `select * from (select count(*) as cnt1, sum(total_time) as sum1 from labels where date(convert_tz(submitted_at, '+00:00', '+03:00')) = date(convert_tz(CURRENT_TIMESTAMP, '+00:00', '+03:00')) and user = ?) as t1 join (select count(*) as cnt2, sum(total_time) as sum2 from labels where user = ?) as t2`;

			pool.query(query, [user, user], function (err, rows, fields) {				
				if (!err) {
					res.render('stats', rows[0]);  
				} else {
					res.status(500).send('Database error');
				}
			});			
		},
		function(error) {
			res.redirect('/login');
		}
	);
});

router.get('/userstats/:user', function(req, res, next) {
});


module.exports = router;
