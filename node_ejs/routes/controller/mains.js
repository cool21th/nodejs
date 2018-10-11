var express       = require('express');
var router        = express.Router();
var dbSelect      = require('../model/dbMainSelect');
var dbDelete      = require('../model/dbMainDelete');
var async         = require('async');
var PythonShell   = require('python-shell');
var moment        = require('moment');

var json2xls      = require('json2xls');
var fs            = require('fs');

var now           = moment().format('YYYYMMDD');



// 값 체크 함수 (비워있는지)
exports.isEmpty = ( value ) => {
  if( value == 'null' || typeof(value) === 'undefined' || value == ''
      || value == null || value == undefined ||
      (value != null && typeof value == "object" && !Object.keys(value).length )
    ){
      return true;
  }else
      return false;
};

// URL : /main 2 Page 내용
router.get('/', function(req, res, next) {
  // 세션 체크 =================================================================
  if( exports.isEmpty(req.session.uid) ){
    res.redirect('/users/login');
    return;
  }
  // ==========================================================================
  var uid   = req.session.uid;

  res.render('evExecuteMain', {uid:uid});
});


router.get('/load', function(req, res, next) {
  // 세션 체크 =================================================================
  if( exports.isEmpty(req.session.uid) ){
    res.redirect('/users/login');
    return;
  }
  // ==========================================================================

  var uid   = req.session.uid;
  var quid   = req.query.uid;
  var pageRows = parseInt(req.param('pageRows'));
  var start, end, pageInfo, startIndex, endIndex, mainIndex, result1Length, result2Length, cntY;
  var bDiffse = true;
  var result1 = {};
  var result2 = {};

  console.log('pageRows!!!!!!!!!!!!'+pageRows);
  if(req.query.mainIndex){
    mainIndex = parseInt(req.query.mainIndex);
    if((parseInt(mainIndex -2) <0)){
      startIndex = 0;
      if(mainIndex !=1){
        mainIndex=0;
      }
    } else{
    startIndex = parseInt(mainIndex -2);
    }
    start = parseInt(mainIndex*pageRows);
  }else{
    start = 0;
    mainIndex  = 0;
    startIndex = parseInt((start/ pageRows));
  }


  end = start+pageRows;
  // 평가인원 정보 가져오기 => 쿼리
  var promise1 = new Promise(function(resolve, reject){
          dbSelect.getApplyInfo({}, function( err, rows ){
              // 응답 => 렌더링

              if( err ){
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
          			res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
              }else{
                //console.log( rows );
                pageInfo = Math.ceil(rows.length/pageRows);
                console.log('evExcute pageInfo!!!!!!!!! start' + start);
                if((startIndex*1)+1 == pageInfo || end>= rows.length){
                  end = parseInt(start+ rows.length% pageRows);
                }
                console.log('evExcute pageInfo!!!!!!!!! start2' + start);
                if(pageInfo<5){
                  endIndex =pageInfo;
                  console.log('!!!!!startIndex',startIndex,'mainIndex',mainIndex,'endIndex',endIndex,'start',start,'end',end);

                }else{
                  if((parseInt(pageInfo- mainIndex)<0)){
                    startIndex = (pageInfo-5);
                    mainIndex = pageInfo-1;

                  }
                  endIndex = parseInt(startIndex +5);

                  if(endIndex >= pageInfo){
                  endIndex =pageInfo;
                  startIndex = parseInt(endIndex -5);
                  start = mainIndex*pageRows;
                  end = start+pageRows;
                    if(end>rows.length){
                        end = parseInt(start+ rows.length% pageRows);
                    }
                  console.log('startIndex',startIndex,'mainIndex',mainIndex,'start',start,'end',end);
                  }

                }
                var cnt = 0;

                for(var i =0 ;  i<rows.length ; i++){
                  if(rows[i].eval_yn =='N'){
                    cnt++;
                  }
                }
                console.log('cnt',cnt);

                result1 = rows;
                result1Length = rows.length;
                cntY = cnt;
                // console.log(result1);
                console.log('result1Length',result1Length);
                console.log('cntY type',typeof(cntY));
                console.log('cntY',cntY);
                console.log('result1Length type',typeof(result1Length));
                resolve("1 해결");

              }
          });

  });
  var promise2 = new Promise(function(resolve, reject){
        dbSelect.getCriteriaInfo({}, function( err, rows ){
            // 응답 => 렌더링

            if( err ){
              res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
              res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
            }else{
              console.log( rows[0] );
              console.log( '두번째 해결' );
              result2 = rows;
              result2Length = rows.length;
              // console.log(result2);
              resolve("2 해결");

              // console.log('==============',rows);
              // res.render('evExecute', { evListNum:rows, title:'평가 대상', uid:uid,quid:quid, name:req.session.name, cnt:rows.length, pageInfo:pageInfo, start:start, end: end, pageRows:pageRows});
            }
        });

  });
Promise.all([promise1, promise2]).then(function () {res.render('evExecute',{ evListNum:result1,evCriteria:result2, title:'평가 대상', uid:uid, quid:quid , name:req.session.name, cnt1:result1Length, cnt2:result2Length, cnt3:cntY, pageInfo:pageInfo, start:start,startIndex:startIndex, end: end,endIndex:endIndex,mainIndex:mainIndex, pageRows:pageRows}); });

});



//평가 상세화면으로 이동
router.get('/evDetail', function(req, res, next) {
  // 세션 체크 =================================================================
  if( exports.isEmpty(req.session.uid) ){
    res.redirect('/users/login');
    return;
  }
  // ==========================================================================
  var applyId   = req.query.id;
  var uid       = req.session.uid;
  console.log('evDetail uid'+uid);
  var results1={};// 지원자 리스트 업
  var results2={};// 선택된 지원자 토탈 점수
  var results3={};// 선택된 지원자 세부 점수
  var results4={};// 선택된 지원자 원문
  var results5={};// 기준
  var sumText=[];// 기준

  // 평가인원 정보 가져오기 => 쿼리
    console.log("evDetail outer" + applyId);
  //  왼쪽 테이블 정보 가져오기

	async.parallel( [
      function(callback){
        dbSelect.getEvalTotApplyInfo({id:applyId}, function( err, rows1 ){
              // 응답 => 렌더링
              if( err ){
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
              }else{
              console.log( "getEvalTotApplyInfo success" );
              results1 = rows1[0];
              // console.log('test1!!!!',rows1);
              // console.log('test2!!!!',rows1[0]);
              sumText = [results1.sumText1, results1.sumText2, results1.sumText3, results1.sumText4];
              console.log('@@@@@@@@@@@@@@@@@@@'+sumText);
              callback(null, rows1);

              }
        });
      },
      function(callback){
        dbSelect.getApplyInfo1({id:applyId}, function( err, rows2 ){
          console.log("evDetail inner" + applyId);
              // 응답 => 렌더링
              if( err ){
              res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
              res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
              }else{
              console.log( "getApplyInfo1 success" );
              results2 = rows2;
              console.log( "rows2" ,rows2 );
              console.log( "rows2[]" ,rows2[0] );
              console.log( "results2" ,results2 );
              callback(null, rows2);

            }
          });
      },
      function(callback){
        dbSelect.getEvalApplyInfo({id:applyId},function( err, rows3 ){
      		console.log("evDetail inner" + applyId);
      		  // 응답 => 렌더링
      		  if( err ){
      			res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
      				res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
      		  }else{
      			console.log( "getEvalApplyInfo success" );
      			results3 = rows3;
            callback(null, rows3);


      		  }
      	  });
      },
      function(callback){
        dbSelect.getOriginalInfo({id:applyId},function( err, rows4 ){
      	  console.log("evDetail inner" + applyId);
      		// 응답 => 렌더링
      		if( err ){
      		  res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
      				res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
      		}else{
      		  console.log( "getOriginalInfo success" );
      		  results4 = rows4;
            //results4 = rows4[0].replace('"',"").replace("\n"," ");
            // console.log( "results4:" + results4 );
            callback(null, rows4);
      		}
      	});
      },
      function(callback){
        dbSelect.getCriteriaDetailInfo({id:applyId},function( err, rows5 ){
      	  console.log("evDetail inner" + applyId);
      		// 응답 => 렌더링
      		if( err ){
      		  res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
      				res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
      		}else{
      		  console.log( "getCriteriaInfo success" );
      		  results5 = rows5;
            //results4 = rows4[0].replace('"',"").replace("\n"," ");
            // console.log( "results4:" + results4 );
            callback(null, rows5);
      		}
      	});
      }
  ], function(err, results){
    if(err)
      console.log(err);
    else{
        // var result = { SqlEvListTotScore:results1,SqlEvListNum:results2, SqlEvListScore:results3, SqlEvListText:results4, SqlEvCriteria:results5,title:'평가 상세', UpApplyId:applyId};
        // console.log('1',result.SqlEvListTotScore);
        // console.log('2',result.SqlEvListNum);
        // console.log('3',result.SqlEvListScore);
        // console.log('4',result.SqlEvListText);
        // console.log('5',result.SqlEvCriteria);
        res.render('detail', { SqlEvListTotScore:results1,SqlEvListNum:results2, SqlEvListScore:results3, SqlEvListText:results4,SqlEvCriteria:results5, title:'평가 상세', UpApplyId:applyId, uid:uid, sumText: sumText});
    }

  });

});



//ID 또는 이름 Search를 통한 평가 상세화면으로 이동
router.get('/evDetail/search', function(req, res, next) {
  // 세션 체크 =================================================================
  if( exports.isEmpty(req.session.uid) ){
    res.redirect('/users/login');
    return;
  }
  // ==========================================================================
  console.log(req.param('keyowrd'));
  var keyword = req.param('keyowrd');
  var searchResults={};
  var applyId ;
  var uid       = req.session.uid;

  var results1={};// 지원자 리스트 업
  var results2={};// 선택된 지원자 토탈 점수
  var results3={};// 선택된 지원자 세부 점수
  var results4={};// 선택된 지원자 원문
  var results5={};// 기준

  dbSelect.getSearchApplyInfo({id:keyword}, function( err, rows ){
      // 응답 => 렌더링
      console.log('getSearch start!!!!!!!!!!!!!!!!!!!!!!!!!');
      if( err ){
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
        res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
      }else if(rows.length ==0){
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
        res.end("<script>alert('정보를 가져오는데 실패하였습니다. 정확한 정보를 입력하세요');history.back();</script>");
      }
      else{
        console.log( rows );
        searchResults = rows[0];
        console.log('searchResults.eval_yn: '+searchResults.eval_yn);

        if(searchResults.eval_yn =='N'){
          res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
          res.end("<script>alert('평가가 미완료된 상태 입니다. 평가 완료후 진행하십시오');history.back();</script>");
        }else

        console.log('getSearch success!!!!!');
        console.log('rows!!!:'+searchResults);
        console.log(searchResults.apply_id);
        applyId = searchResults.apply_id;


          // 평가인원 정보 가져오기 => 쿼리
            console.log("evDetail outer" + applyId);
          //  왼쪽 테이블 정보 가져오기

        	async.parallel( [
              function(callback){
                dbSelect.getEvalTotApplyInfo({id:applyId}, function( err, rows1 ){
                      // 응답 => 렌더링
                      if( err ){
                        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                        res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
                      }else{
                        //console.log( rows );
                      console.log( "getEvalTotApplyInfo success" );
                      results1 = rows1[0];
                      // console.log( "results1: " + results1 );
                      callback(null, rows1);

                      }

                });
              },
              function(callback){
                dbSelect.getApplyInfo1({id:applyId}, function( err, rows2 ){
                  console.log("evDetail inner" + applyId);
                      // 응답 => 렌더링
                      if( err ){
                      res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                      res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
                      }else{
                      console.log( "getApplyInfo1 success" );
                      results2 = rows2;
                      // console.log( "results2: " + results2 );
                      callback(null, rows2);

                    }
                  });
              },
              function(callback){
                dbSelect.getEvalApplyInfo({id:applyId},function( err, rows3 ){
              		console.log("evDetail inner" + applyId);
              		  // 응답 => 렌더링
              		  if( err ){
              			res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
              				res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
              		  }else{
              			console.log( "getEvalApplyInfo success" );
              			results3 = rows3;
                    // console.log( "results3: " + results3 );
                    callback(null, rows3);


              		  }
              	  });
              },
              function(callback){
                dbSelect.getOriginalInfo({id:applyId},function( err, rows4 ){
              	  console.log("evDetail inner" + applyId);
              		// 응답 => 렌더링
              		if( err ){
              		  res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
              				res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
              		}else{
              		  console.log( "getOriginalInfo success" );
              		  results4 = rows4[0].text;
                    //results4 = rows4[0].replace('"',"").replace("\n"," ");
                    // console.log( "results4:" + results4 );
                    callback(null, rows4);
              		}
              	});
              },
              function(callback){
                dbSelect.getCriteriaDetailInfo({id:applyId},function( err, rows5 ){
              	  console.log("evDetail inner" + applyId);
              		// 응답 => 렌더링
              		if( err ){
              		  res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
              				res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
              		}else{
              		  console.log( "getCriteriaInfo success" );
              		  results5 = rows5;
                    //results4 = rows4[0].replace('"',"").replace("\n"," ");
                    // console.log( "results4:" + results4 );
                    callback(null, rows5);
              		}
              	});
              }
          ], function(err, results){
            if(err)
              console.log(err);
            else{
                var result = { SqlEvListTotScore:results1,SqlEvListNum:results2, SqlEvListScore:results3, SqlEvListText:results4, SqlEvCriteria:results5,title:'평가 상세', UpApplyId:applyId};
                console.log(result.SqlEvListTotScore);
                console.log(result.SqlEvListNum);
                console.log(result.SqlEvListScore);
                console.log(result.SqlEvListText);
                console.log(result.SqlEvCriteria);
                res.render('detail', { SqlEvListTotScore:results1,SqlEvListNum:results2, SqlEvListScore:results3, SqlEvListText:results4,SqlEvCriteria:results5, title:'평가 상세', UpApplyId:applyId, uid:uid});
            }

          });

      }

  });
});





router.get('/evList', function(req, res, next) {
  // 세션 체크 =================================================================
  if( exports.isEmpty(req.session.uid) ){
    res.redirect('/users/login');
    return;
  }
  // ==========================================================================
  console.log('데이터 평가진행 여부확인!!!!!');
  // 평가인원 데이터 초기화 시작 => 쿼리
  dbSelect.getApplyInfo({}, function( err, rows ){
      // 응답 => 렌더링
      if( err ){
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
  			res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
      }else{
        //console.log( rows );
        res.send({success : "select Successfully",status :200, err:err, evList:rows});
      }
  });

  // res.header('Content-type','application/json');
	// res.header('Charset','utf8');
	// res.send({success : "Updated Successfully",status :200, err:err});
    // res.json({success : "Updated Successfully",status : 200, err:err });
});


router.get('/excel', function(req, res, next) {
  // 세션 체크 =================================================================
  if( exports.isEmpty(req.session.uid) ){
    res.redirect('/users/login');
    return;
  }
  // ==========================================================================
  var evalTot = req.query.evalTot;
  console.log('evalTot'+evalTot);
  console.log('엑셀다운로드 시작!!!!!');

  // 평가인원 데이터 초기화 시작 => 쿼리
  dbSelect.getExcelTotApplyInfo({}, function( err, rows ){
      // 응답 => 렌더링
      if( err ){
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
  			res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
      }else{
        //console.log( rows );
        var results = [];
        results = rows;
        console.log('rowstype',rows.length);
        console.log('resultstype',results.length);
        var json = [];
        var jsonArray = [];
        for( var index = 0; index< results.length; index ++){
          // console.log('inner result'+results);
        var tempArray = {
            '지원자번호' : results[index].apply_id,
            '지원자성명' : results[index].han_nm,
            '토탈스코어' : results[index].tot_score,
            '대항목1:목표설정 및 성취' : results[index].q1_score,
            '노력수준' : results[index].q1_c1_score,
            '난이도' : results[index].q1_c2_score,
            '성취수준' : results[index].q1_c3_score,
            '의지/끈기' : results[index].q1_c4_score,
            '대항목2:과감한 실행' : results[index].q2_score,
            '문제지각' : results[index].q2_c1_score,
            '대안의 참신성' : results[index].q2_c2_score,
            '위험의 선호도' : results[index].q2_c3_score,
            '실행의 체계성' : results[index].q2_c4_score,
            '대항목3:역량 개발' : results[index].q3_score,
            '보유역량' : results[index].q3_c1_score,
            '성장방향' : results[index].q3_c2_score,
            '직무수행을 위한 준비' : results[index].q3_c3_score,
            '기준없음' : results[index].q3_c4_score,
            '대항목4:팀웍 발휘' : results[index].q4_score,
            '조직기여도' : results[index].q4_c1_score,
            '설득력' : results[index].q4_c2_score,
            '자원활용' : results[index].q4_c3_score,
            '역할 인식' : results[index].q4_c4_score,
            '평가완료여부' : results[index].eval_yn
        };
        // console.log('tempArray',tempArray);
        jsonArray.push(tempArray);
        }

        var excelDownloadFile = "evaluation"+req.session.uid+now+".xlsx";
        // console.log(results);
        console.log('Creating xlsx...');
        var xls = json2xls(jsonArray);

      fs.writeFileSync(excelDownloadFile, xls, 'binary');
      res.setHeader('Content-Type','application/vnd.openxmlformates');
      res.setHeader("Content-Disposition","attachment;filename="+excelDownloadFile);
      res.end(xls,'binary');

      }
  });

});




router.get('/test', function(req, res, next) {
  // 세션 체크 =================================================================
  if( exports.isEmpty(req.session.uid) ){
    res.redirect('/users/login');
    return;
  }
  // ==========================================================================
  var uid   = req.query.uid;
  // 평가인원 정보 가져오기 => 쿼리
  // db.getApplyInfo({}, function( err, rows ){
  //     // 응답 => 렌더링
  //     if( err ){
  //       res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
  // 			res.end("<script>alert('정보를 가져오는데 실패하였습니다. 잠시후 다시 이용해주세요');history.back();</script>");
  //     }else{
  //       //console.log( rows );
  //       res.render('evExecute', { num:rows, title:'평가 대상', uid:uid, name:req.session.name });
  //     }
  // });
  res.render('evExecute_test');
});



















// 객체 모듈화
module.exports = router;
