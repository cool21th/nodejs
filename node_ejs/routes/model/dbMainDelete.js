// pool를 이용한 sql 처리
var pool  = require('./pool');
var mysql = require('mysql');



// page 2 지원자 정보 및 평가 등 지우는는 쿼리
exports.delApplyInfo = function( param, cb)
{
	// 커넥션 빌리고
	console.log("지원평가 전체정보 지우기 시작");
	pool.acquire(function( err, conn ){
		if( err ){
			// 커넥션을 확보 못했다.
			cb( err, [] );
		}else{
			// 빌렷다 -> 쿼리 -> 응답 -> 반납
			// 쿼리
			// 기준, 기준별 점수. 총점 원문
			sql = "delete from sse_ai_eval;"+"delete from sse_scoring;"+"delete from sse_scoring_summary;"+"update sse_apply_info set eval_yn  = 'N' where eval_yn  = 'Y';";
						conn.query(sql, function(err1, rows){
				// 반납
				console.log('delete 에러인가?????'+err1);
				pool.release( conn );
				// 응답
				cb( err1, rows );
			});
		}
	});
};
