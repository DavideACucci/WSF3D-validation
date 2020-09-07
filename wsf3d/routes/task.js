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
      res.render('task');  
    },
    function(error) {
      res.redirect('/');
    }
  );
});

router.get('/gettask/:user', function(req, res, next) {
  //var query = 'select * from tasks order by rand() limit 1';

  // old query
  // var query = 'select * from tasks where n_executed < 10 and enabled = 1 and not exists (select id from labels where user = ? and labels.task_id = tasks.id) order by priority, tasks.id asc limit 1';

  // faster but when there are a lot of active users tasks gets assigned too many times
  //var query = 'select * from tasks where n_executed < 10 and enabled = 1 and tasks.id > (select coalesce(max(task_id),0) from labels where user = ?) order by priority, tasks.id asc limit 1'

  // should reduce this effect
  // var query = 'select * from ( select * from tasks where n_executed < 10 and enabled = 1 and tasks.id > (select coalesce(max(task_id),0) from labels where user = ?) order by priority, id asc limit 100 ) as t order by rand() limit 1'

  // slower query but safer
  var query = 'select * from (select * from tasks where n_executed < 8 and enabled = 1 and not exists (select id from labels where lcase(user) = lcase(?) and labels.task_id = tasks.id) order by priority, tasks.id asc limit 25) as t order by rand() limit 1';
  
  pool.query(query, [req.params.user], function (err, rows, fields) {
    if (!err && rows.length === 1) {
      res.status(200).json(rows[0]);
    } else {
      res.status(500).send('Database error');
    }
  });
});

router.get('/solvetask/:data', function(req, res, next) {

  td = JSON.parse(decodeURIComponent(req.params.data));

  query = 
    `update tasks set n_executed = n_executed + 1 where id = ?;
    insert into labels (task_id, task_type, user, skip, reason, click_x, click_y, floors, total_time, loading_time, solving_time, canvas_w, canvas_h) values (?, ?, lcase(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  pool.query(query, 
      [
        td.task_id,
        td.task_id, 
        td.task_type, 
        td.user, 
        td.skip, 
        td.skip === true ? td.reason : null,
        td.skip === false ? td.click.x : null, 
        td.skip === false ? td.click.y : null, 
        td.skip === false ? td.floors : null, 
        (td.time_stats.completed - td.time_stats.start)/1000.0,
        (td.time_stats.loaded - td.time_stats.start)/1000.0,
        (td.time_stats.completed - td.time_stats.loaded)/1000.0,
        td.canvas_w,
        td.canvas_h
      ], 
      function (err, rows, fields) {
        if (!err) {
            res.status(200).send('Ok');
        } else {
            res.status(500).send('Database error');
        }
  });
});

module.exports = router;
