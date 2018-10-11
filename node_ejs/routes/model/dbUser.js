//User 관련된 DB 처리
var pool  = require('./pool');
var mysql = require('mysql');
var moment = require('moment');

// var bcrypt = require('bcrypt');
// const saltRounds = 10;
var now = moment().format('YYYYMMDD');


// Page 1 로그인 처리
exports.loginSql = function( param, cb )
{
	var password = param.upw;
	pool.acquire(function( err, conn ){
		if( err ){
			cb( err, [] );
		}else{
			sql = "select user_id uid, user_nm name  from sse_user_info where user_id=? and password=?;";
			conn.query(sql, [param.uid, param.upw], function(err1, rows){
				console.log(rows);
				pool.release( conn );
				cb( err1, rows );
			});
		}
	});
};
