// /*
//  * 디비 커넥션을 미리 잡아두고 관리 한다.;
//  * 요청이 몰렸을때 균일한 처리 속도및 디비 연결성을 보장한다;
//  * npm install generic-pool@2.5 --save;
//  * 버전에 따른 사용법이 다르다;
//  */
// 모듈 가져오기
var Pool 		  = require('generic-pool').Pool;
var mysql 		= require('mysql');
var config = require('../../config/db_connect');

// 풀링 생성
var pool        = new Pool({
	name:'',
	create:function( cb )   {
		var connection;

		if (process.env.NODE_ENV == 'production') {
  	 	console.log("Production DB Mode");
			connection = mysql.createConnection(config.database.development);
		} else if (process.env.NODE_ENV == 'development') {
  		console.log("Development DB Mode");
			connection = mysql.createConnection(config.database.local);
		}

		connection.connect(function(err){
			// 풀링에게 커넥션 객체를 보내줘야함
			cb( err, connection );
		});
	}, // cb를 통해 커넥션을 보내준다 (최대 max값 만큼)
	destroy:function( conn ){
		if( conn ) conn.end();
	}, // 커넥션 객체를 보내서 연결 종료 (최대 max값 만큼)
	max:20,
	min:3,
	log:false, // 커넥션수를 계속 모니터링 하여 코드상에 어디가 반납 하고 있지 않는지 확인한다.
	idleTimeoutMillis:600*1000
});
// 이벤트 등록 (오류, 해제)
process.on('uncaughtException', (err) => {
    // 전체 구동중 예외 상황 발생시 이쪽으로 모두 전달된다.
	console.log( 'uncaughtException', err );
});
// exit등 타이밍 고려
process.on('beforeExit', (code) => {
	// 반납
	pool.drain(function(){
		pool.destoryAllNow();
	});
});

// 객체 모듈화
module.exports  = pool;
