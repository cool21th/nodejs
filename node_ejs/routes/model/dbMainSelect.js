// pool를 이용한 sql 처리
var pool  = require('./pool');
var mysql = require('mysql');
var moment = require('moment');
var now = moment().format('YYYYMMDD');

// excuteMain 기준정보 가져오기
exports.getCriteriaInfo = function( param, cb)
{
	pool.acquire(function( err, conn ){
		if( err ){

			cb( err, [] );
		}else{

			sql = "select q_num, q_tlnt_desc, count(*) from sse_criteria_info where valid_dt >=? group by q_num order by q_num;";
			conn.query(sql, [now], function(err1, rows){
				pool.release( conn );
				cb( err1, rows );
			});
		}
	});
};

// detail 기준정보 가져오기
exports.getCriteriaDetailInfo = function( param, cb)
{
	pool.acquire(function( err, conn ){
		if( err ){

			cb( err, [] );
		}else{

			sql = "select apply_dt, apply_type_cd, apply_job_cd,q_num, q_tlnt_desc, max(case when c_num =  '01' then eval_crt_desc end) as c1_desc , max(case when c_num =  '02' then eval_crt_desc end) as c2_desc, max(case when c_num =  '03' then eval_crt_desc end) as c3_desc, max(case when c_num =  '04' then eval_crt_desc end) as c4_desc from sse_criteria_info where valid_dt >=? group by apply_dt, apply_type_cd, apply_job_cd,q_num ;";
			conn.query(sql, [now], function(err1, rows){
				pool.release( conn );
				cb( err1, rows );
			});
		}
	});
};


// page 2 지원자 정보를 모두 가져오는 쿼리
exports.getApplyInfo = function( param, cb)
{
	// 커넥션 빌리고
	pool.acquire(function( err, conn ){
		if( err ){
			// 커넥션을 확보 못했다.
			cb( err, [] );
		}else{
			// 빌렷다 -> 쿼리 -> 응답 -> 반납
			// 쿼리
			sql = "SELECT sse_apply_info.apply_id as apply_id, sse_apply_info.han_nm as han_nm, sum(case when sse_scoring_summary.q_num =  '01' then round(sse_scoring_summary.q_num_score) end) as q1_score, sum(case when sse_scoring_summary.q_num =  '02' then round(sse_scoring_summary.q_num_score) end) as q2_score, sum(case when sse_scoring_summary.q_num =  '03' then round(sse_scoring_summary.q_num_score) end) as q3_score,sum(case when sse_scoring_summary.q_num =  '04' then round(sse_scoring_summary.q_num_score) end) as q4_score,sum(case when sse_scoring_summary.q_num =  '05' then round(sse_scoring_summary.q_num_score) end) as q5_score, sse_apply_info.eval_yn as eval_yn FROM sse_apply_info LEFT JOIN sse_scoring_summary ON sse_apply_info.apply_id = sse_scoring_summary.apply_id group by sse_apply_info.apply_id order by sse_apply_info.apply_id asc;";
			conn.query(sql, function(err1, rows){
				// 반납
				pool.release( conn );
				// 응답
				cb( err1, rows );
			});
		}
	});
};


// page 2 지원자 ajax 콜을 통한 정보를 모두 가져오는 쿼리
exports.getAjaxCallInfo = function( param, cb)
{
	// 커넥션 빌리고
	pool.acquire(function( err, conn ){
		if( err ){
			// 커넥션을 확보 못했다.
			cb( err, [] );
		}else{
			// 빌렷다 -> 쿼리 -> 응답 -> 반납
			// 쿼리
			console.log('@@@@@@@@@@@@@@@@@@@@@@@' + param);
			sql = "SELECT sse_apply_info.apply_id as apply_id, sse_apply_info.han_nm as han_nm, round(sse_scoring_summary.c1_score) as c1_score, round(sse_scoring_summary.c2_score) as c2_score, round(sse_scoring_summary.c3_score) as c3_score, round(sse_scoring_summary.c4_score) as c4_score, sse_apply_info.eval_yn as eval_yn FROM sse_apply_info JOIN sse_scoring_summary ON sse_apply_info.apply_id = sse_scoring_summary.apply_id and sse_apply_info.apply_id = '" + param + "';" ;
			conn.query(sql, function(err1, rows){
				// 반납
				pool.release( conn );
				// 응답
				cb( err1, rows );
			});
		}
	});
};

// page 3 지원자 정보 및 평가 등 전부다 가져오는 쿼리
exports.getEvalApplyInfo1 = function( param, cb)
{
	// 커넥션 빌리고
	console.log("지원평가 전체정보 가져오기 시작");
	pool.acquire(function( err, conn ){
		if( err ){
			// 커넥션을 확보 못했다.
			cb( err, [] );
		}else{
			// 빌렷다 -> 쿼리 -> 응답 -> 반납
			// 쿼리
			// 기준, 기준별 점수. 총점 원문
			console.log("지원평가  전체정보 가져오기 에러 없음"+ param.id);
			sql = "select apply_id as apply_info_ApId, han_nm as apply_id_nm from sse_apply_info  order by apply_info_ApId asc;"+ "select apply_id as sse_scoring_ApId, q_num as sse_scoring_q, c_num as sse_scoring_C, scoring_point as sse_scoring_points from sse_scoring where apply_id='" + param.id + "'  order by sse_scoring_ApId, sse_scoring_q, sse_scoring_C asc;" + "select apply_id as original_ApId, q_num as Original_q, text from sse_original_text where apply_id='"+ param.id + "' order by original_ApId, Original_q asc;";
			// + "select apply_id as sse_scoring_ApId, q_num as sse_scoring_q, c_num as sse_scoring_C, scoring_point as sse_scoring_points from sse_scoring where apply_id='" + param.id + "'  order by apply_id, q_num, c_num asc;" + "select apply_id as original_ApId, q_num as Original_q, text from sse_original_text where apply_id='"+ param.id + "'order by apply_id, q_num, c_num asc;"
			conn.query(sql, function(err1, rows){
				// 반납
				console.log(rows);
				pool.release( conn );
				// 응답
				cb( err1, rows );
			});
		}
	});
};

// page 3 지원자 정보를 모두 가져오는 쿼리
exports.getApplyInfo1 = function( param, cb)
{
	// 커넥션 빌리고
	console.log("3 지원평가 명단 리스트 가져오기 시작 rows2");
	pool.acquire(function( err, conn ){
		if( err ){
			// 커넥션을 확보 못했다.
			cb( err, [] );
		}else{
			// 빌렷다 -> 쿼리 -> 응답 -> 반납
			// 쿼리
			console.log("3 지원평가 명단 리스트 가져오기 에러없음");
			sql = "select apply_id, han_nm, eval_yn from sse_apply_info where eval_yn='Y' order by apply_id asc";
			conn.query(sql, function(err1, rows){
				// 반납
				// console.log(rows);
				pool.release( conn );
				// 응답
				cb( err1, rows );
			});
		}
	});
};

// page 3 지원자 전체 점수정보를 가져오는 쿼리
exports.getEvalTotApplyInfo = function( param, cb)
{
	// 커넥션 빌리고
	console.log("지원평가 가져오기 시작 rows1");
	pool.acquire(function( err, conn ){
		if( err ){
			// 커넥션을 확보 못했다.
			cb( err, [] );
		}else{
			// 빌렷다 -> 쿼리 -> 응답 -> 반납
			// 쿼리
			// 기준, 기준별 점수. 총점 원문
			console.log("지원평가 가져오기 에러 없음"+ param.id);
			sql = "SELECT A.apply_id as apply_id, A.han_nm as han_nm, round(B.total_score) as tot_score\
						, sum(case when B.q_num =  '01' then round(B.q_num_score) end) as q_score1\
						, sum(case when B.q_num =  '02' then round(B.q_num_score) end) as q_score2\
						, sum(case when B.q_num =  '03' then round(B.q_num_score) end) as q_score3\
						, sum(case when B.q_num =  '04' then round(B.q_num_score) end) as q_score4\
						, max(case when B.q_num =  '01' then B.text_summary end) as sumText1\
						, max(case when B.q_num =  '02' then B.text_summary end) as sumText2\
						, max(case when B.q_num =  '03' then B.text_summary end) as sumText3\
						, max(case when B.q_num =  '04' then B.text_summary end) as sumText4\
						, A.eval_yn as eval_yn \
							FROM sse_apply_info A JOIN sse_scoring_summary B ON A.apply_id = B.apply_id	and A.apply_id = '" + param.id + "' group by B.apply_id;";
			conn.query(sql, function(err1, rows){
				// 반납
				pool.release( conn );
				// 응답
				cb( err1, rows );

			});
		}
	});
};

// page 3 지원자 전체 점수정보를 가져오는 쿼리
exports.getExcelTotApplyInfo = function( param, cb)
{
	// 커넥션 빌리고
	console.log("지원평가 가져오기 시작 rows1");
	pool.acquire(function( err, conn ){
		if( err ){
			// 커넥션을 확보 못했다.
			cb( err, [] );
		}else{
			// 빌렷다 -> 쿼리 -> 응답 -> 반납
			// 쿼리
			// 기준, 기준별 점수. 총점 원문
			console.log("지원평가 가져오기 에러 없음"+ param.id);
			sql = "SELECT sse_apply_info.apply_id as apply_id, sse_apply_info.han_nm as han_nm \
						, round(sse_scoring_summary.total_score) as tot_score \
						, sum(case when sse_scoring_summary.q_num =  '01' then round(sse_scoring_summary.q_num_score) end) as q1_score \
						, sum(case when sse_scoring_summary.q_num =  '01' then round(sse_scoring_summary.c1_score) end) as q1_c1_score \
						, sum(case when sse_scoring_summary.q_num =  '01' then round(sse_scoring_summary.c2_score) end) as q1_c2_score \
						, sum(case when sse_scoring_summary.q_num =  '01' then round(sse_scoring_summary.c3_score) end) as q1_c3_score \
						, sum(case when sse_scoring_summary.q_num =  '01' then round(sse_scoring_summary.c4_score) end) as q1_c4_score \
						, sum(case when sse_scoring_summary.q_num =  '02' then round(sse_scoring_summary.q_num_score) end) as q2_score \
						, sum(case when sse_scoring_summary.q_num =  '02' then round(sse_scoring_summary.c1_score) end) as q2_c1_score \
						, sum(case when sse_scoring_summary.q_num =  '02' then round(sse_scoring_summary.c2_score) end) as q2_c2_score \
						, sum(case when sse_scoring_summary.q_num =  '02' then round(sse_scoring_summary.c3_score) end) as q2_c3_score \
						, sum(case when sse_scoring_summary.q_num =  '02' then round(sse_scoring_summary.c4_score) end) as q2_c4_score \
						, sum(case when sse_scoring_summary.q_num =  '03' then round(sse_scoring_summary.q_num_score) end) as q3_score \
						, sum(case when sse_scoring_summary.q_num =  '03' then round(sse_scoring_summary.c1_score) end) as q3_c1_score \
						, sum(case when sse_scoring_summary.q_num =  '03' then round(sse_scoring_summary.c2_score) end) as q3_c2_score \
						, sum(case when sse_scoring_summary.q_num =  '03' then round(sse_scoring_summary.c3_score) end) as q3_c3_score \
						, sum(case when sse_scoring_summary.q_num =  '03' then round(sse_scoring_summary.c4_score) end) as q3_c4_score \
						, sum(case when sse_scoring_summary.q_num =  '04' then round(sse_scoring_summary.q_num_score) end) as q4_score \
						, sum(case when sse_scoring_summary.q_num =  '04' then round(sse_scoring_summary.c1_score) end) as q4_c1_score \
						, sum(case when sse_scoring_summary.q_num =  '04' then round(sse_scoring_summary.c2_score) end) as q4_c2_score \
						, sum(case when sse_scoring_summary.q_num =  '04' then round(sse_scoring_summary.c3_score) end) as q4_c3_score \
						, sum(case when sse_scoring_summary.q_num =  '04' then round(sse_scoring_summary.c4_score) end) as q4_c4_score \
						, sse_apply_info.eval_yn as eval_yn FROM sse_apply_info LEFT JOIN sse_scoring_summary ON sse_apply_info.apply_id = sse_scoring_summary.apply_id  group by sse_apply_info.apply_id;";
			conn.query(sql, function(err1, rows){
				// 반납
				pool.release( conn );
				// 응답
				cb( err1, rows );

			});
		}
	});
};



// page 3 지원자 세부 평가정보를 가져오는 쿼리
exports.getEvalApplyInfo = function( param, cb)
{
	// 커넥션 빌리고
	console.log("지원평가 가져오기 시작 rows3");
	pool.acquire(function( err, conn ){
		if( err ){
			// 커넥션을 확보 못했다.
			cb( err, [] );
		}else{
			// 빌렷다 -> 쿼리 -> 응답 -> 반납
			// 쿼리
			// 기준, 기준별 점수. 총점 원문
			console.log("지원평가 가져오기 에러 없음"+ param.id);
			sql = "select apply_id, q_num, c_num, round(scoring_point) as scoring_point,ground_stc_text_1,ground_stc_text_2,ground_stc_text_3 from sse_scoring where apply_id='" + param.id + "'  order by apply_id, q_num, c_num asc;";
			conn.query(sql, function(err1, rows){
				// 반납
				// console.log(rows);
				pool.release( conn );
				// 응답
				cb( err1, rows );
			});
		}
	});
};

//지원자 원문정보 가져오는 쿼리
exports.getOriginalInfo = function( param, cb )
{
	console.log("지원평가 original text 가져오기 시작 rows4");
	pool.acquire(function( err, conn ) {
		if( err ){
			// 커넥션을 확보 못했다.
			cb( err, [] );
		}else{
			// 빌렷다 -> 쿼리 -> 응답 -> 반납
			// 쿼리
			sql = "select apply_id, q_num, text from sse_original_text where apply_id='"+ param.id + "'order by apply_id, q_num asc;";
			conn.query(sql, function(err1, rows) {
				// 반납
				// console.log(rows);
				pool.release( conn );
				// 응답
				cb( err1, rows );
			});
		}
	});
};

//detail search 정보 ApplyId 가져오기
exports.getSearchApplyInfo = function( param, cb )
{
	console.log("Search Keyword에 해당하는 정보 가져오기 시작");
	pool.acquire(function( err, conn ) {
		if( err ){
			// 커넥션을 확보 못했다.
			cb( err, [] );
		}else{
			// 빌렷다 -> 쿼리 -> 응답 -> 반납
			// 쿼리
			console.log("지원평가 가져오기 에러 없음 param:"+ param);
			console.log("지원평가 가져오기 에러 없음 param.id:"+ param.id);
			sql = "SELECT apply_id, han_nm, eval_yn FROM sse_apply_info where apply_id like '%" + param.id + "' or han_nm like '" + param.id + "%' limit 1;";
			conn.query(sql, function(err1, rows) {
				// 반납
				// console.log(rows);
				pool.release( conn );
				// 응답
				cb( err1, rows );
			});
		}
	});
}
