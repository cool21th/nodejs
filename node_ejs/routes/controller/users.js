var express = require('express');
var router  = express.Router();
var dbUser     = require('../model/dbUser');
var mains   = require('./mains');



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


/* GET users listing. */
// URL : /users
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//=========================================================================================
//=========================================================================================
//======================================Login Page ======================================
//=========================================================================================
//=========================================================================================

// 로그인 폼 처리
// URL : /users/login
router.get('/login', function(req, res){
	res.render( 'login' );
});

// 로그인 처리
// URL : /users/login
router.post('/login', function(req, res){
	// post 방식으로 데이터가 전달되었을때!! 데이터 추출
	// get 방식은 req.query
	console.log( req.body.uid );
	console.log( req.body.upw );
	console.log( req.body );

	// 디비로 데이터를 전달하여 쿼리 수행후 결과를 받아서 응답 처리한다
	dbUser.loginSql( req.body, function(err, rows){
		// 응답
		console.log(rows);
		if( err || rows.length==0){
			// 실패 안내하고 다시 로그인 화면
			res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
			res.end("<script>alert('로그인실패');history.back();</script>");
		}else{
      // 로그인 성공 => 세션 생성 ===============================================
      req.session.uid  = req.body.uid;
      req.session.name = rows[0].name;
      // ======================================================================
      // 메인 서비스로 이동
			res.redirect('/main');
		}
	});
	//res.writeHead(200, {'Content-Type': 'text/plain'});
	//res.end("당신의 입력값 " + req.body.uid + " "+ req.body.upw);
});




// 로그아웃
router.get('/logout', (req, res) => {

  //if( mains.isEmpty(req.session.uid) ){
    req.session.uid  = null;
    req.session.name = null;
    req.session.destroy( (err) => {
        res.redirect('/users/login');
    });
  //}else{
  //  req.session.uid  = null;
  //  req.session.name = null;
  //  res.redirect('/users/login');
  //}

});









module.exports = router;
