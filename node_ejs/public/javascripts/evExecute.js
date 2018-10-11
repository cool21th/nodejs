$(document).ready(function(){
  var xhr;
    //최상단 체크박스 클릭
    $("#check_all").click(function(){
        //클릭되었으면
        if($("#check_all").prop("checked")){
            //input태그의 name이 chk인 태그들을 찾아서 checked옵션을 true로 정의
            $("input[name=check]").prop("checked",true);
            //클릭이 안되있으면
        }else{
            //input태그의 name이 chk인 태그들을 찾아서 checked옵션을 false로 정의
            $("input[name=check]").prop("checked",false);
        }
    });

    $('#evalRows option').each(function() {

        var spanIdRows = $('#evalRowsSpan').text();
        if($(this).val() === spanIdRows) {
            $(this).prop("selected", true);
        }
    });


});

function clickLoad(){
  var evalRows = $("#evalRows").val();
  console.log(evalRows);
  var goUrl = '/main/load?pageRows='+evalRows;
  $(location).attr('href', goUrl);
}

function clickExcelDown(){

  var r = confirm("전체 데이터를 다운받겠습니까?");
  var evalTot;
  if (r == true) {
    evalTot  = 'Y';
      console.log("전체 데이터 다운로드 시작");
  }
  else {
    // var s = confirm("평가완료된 자료만 다운받겠습니까?");
    // if(s ==true){
    //   evalTot  = 'N';
    // }
    // else{
      return false;
    // }
  }
  var goUrl = '/main/excel?evalTot='+evalTot;
  $(location).attr('href', goUrl);
}

function clickPageLoad(mainIndex){
  var evalRows = $("#evalRows").val();
  console.log(evalRows);
  var goUrl = '/main/load?mainIndex='+mainIndex+'&pageRows='+evalRows;
  $(location).attr('href', goUrl);
}

function resultRefresh(applyId){
  $("#notExe_"+applyId).hide();
  $("#analysis_"+applyId).hide();
  $("#completed_"+applyId).show();
}

function scoreRefresh(SqlAjaxCallInfo){

  var SqlAjaxCallInfo = SqlAjaxCallInfo[0];
  console.log('!!!!!!!!!!!!!!!!!!!!'+ SqlAjaxCallInfo);
  // for(var i=1; i<=4; i++){
    $("#basicSc1"+SqlAjaxCallInfo.apply_id).hide();
    $("#basicSc2"+SqlAjaxCallInfo.apply_id).hide();
    $("#basicSc3"+SqlAjaxCallInfo.apply_id).hide();
    $("#basicSc4"+SqlAjaxCallInfo.apply_id).hide();
    // console.log('@@@@@@@@@@@@@@@@@@@@@@'+ SqlAjaxCallInfo.apply_id);
    // console.log("#basicSc1"+SqlAjaxCallInfo.apply_id);
    $("#changeSc1"+SqlAjaxCallInfo.apply_id).show(100, function(){
          $(this).text( SqlAjaxCallInfo.c1_score );
        });
    $("#changeSc2"+SqlAjaxCallInfo.apply_id).show(100, function(){
          $(this).text( SqlAjaxCallInfo.c2_score );
        });
    $("#changeSc3"+SqlAjaxCallInfo.apply_id).show(100, function(){
          $(this).text( SqlAjaxCallInfo.c3_score );
        });
    $("#changeSc4"+SqlAjaxCallInfo.apply_id).show(100, function(){
          $(this).text( SqlAjaxCallInfo.c4_score );
        });
    // <%=SqlAjaxCallInfo[index].c4_score %>

  // }
}


function evaluate_exe(){
  alert("평가 실행이 지원되지 않습니다") ;
}



function detail_click() {
  var index;
console.log('Main detail!!!');
  $.ajax({
      url : "/main/evList",
      dataType : 'json',
      error : function(){
          console.log('통신실패!!');
      },
      success : function(data){
          console.log("통신데이터 값 : " + data) ;
          var evList = data.evList;
          var applyId;
          console.log("통신데이터 evList 값 : " + data.evList) ;
          console.log("통신데이터 evList 값 : " + evList) ;

          for (index in evList){
            if(evList[index].eval_yn == 'Y'){
                applyId = evList[index].apply_id;

                console.log("통신데이터 index 값 : " + index) ;
                console.log("통신데이터 eval_yn 값 : " + evList[index].eval_yn) ;
                console.log("통신데이터 applyId 값 : " + applyId) ;
                console.log("통신데이터 applyId 값 : " + evList[index].apply_id) ;
                break;
            }
          }
          if (applyId != null){
              console.log('!!!Main Detail수행 시작!!!!');
              goDetail(applyId);
          }else{
            alert("평가할 데이터가 없습니다. ") ;
          }
          // location.reload();
      }
    });


}

function goDetail(applyId){
  var goUrl = '/main/evDetail?id='+applyId;
  $(location).attr('href', goUrl);
}


function evaluate_ing(){
  alert("지금은 Aibril이 분석중에 있습니다.") ;
}


function evaluate_all_exe(cntY){

  alert("전체평가가 지원되지 않습니다") ;
}

$(function(){
    $("#abortAjax").click(function(){
        console.log('!@!!@!@!@!@!@!@!');
        xhr.abort();

        $("input[id^='abortAjax']").hide(100);

        // $('#'+show_id).show(200);
        $("#modalSpan").text('현재 평가 중단 처리 중에 있습니다..');
    });
});
// $("#abortAjax").click(function() {
//     console.log('!@!!@!@!@!@!@!@!');
//     // jqXHR.abort();
// });



function delete_click() {

  console.log('Data reset!!!!!!!!');

  var r = confirm("전체 데이터를 삭제하시겠습니까?");

  if (r == true) {
      deleteData();
  } else {
    return false;
  }

}



function deleteData() {

    alert("데이터 초기화가 지원되지 않습니다") ;

}

function detailAjaxCall(tdArr, completeData){
console.log('detailAjaxCall start!!!!!!!!');
  $.ajax({
      url : "/main/evaluate",
      type : 'post',
      dataType : 'json',
      // async : false,
      data : {ajApplyId : tdArr.pop()},
      error : function(){
          console.log('통신실패!!');
      },
      success : function(data){
          console.log("통신데이터 값 : " + data) ;
          // $("#dataArea").html(data) ;

          var applyId = data.applyId;
          var SqlAjaxCallInfo = data.SqlAjaxCallInfo;
          console.log(SqlAjaxCallInfo);
          resultRefresh(applyId);
          scoreRefresh(SqlAjaxCallInfo);
          $("input[name=check]:checked").prop('checked',false).attr("disabled",true);
      },
      complete: function(data){
                completeData.push(data); //Store JSON data
      }
    });

}


function allAjaxCall(tdArr, completeData){
console.log('allAjaxCall start!!!!!!!!');
    xhr =   $.ajax({
            url : "/main/evaluate",
            type : 'post',
            dataType : 'json',
            // async : false,
            data : {ajApplyId : tdArr.pop()},
            error : function(){
                console.log('통신실패!!');
            },
            success : function(data){
                console.log("통신데이터 값 : " + data) ;
                // $("#dataArea").html(data) ;

                var applyId = data.applyId;
                var SqlAjaxCallInfo = data.SqlAjaxCallInfo;
                console.log(SqlAjaxCallInfo);
                // resultRefresh(applyId);
                // scoreRefresh(SqlAjaxCallInfo);
                // $("input[name=check]:checked").prop('checked',false).attr("disabled",true);
            },
            complete: function(data){
                      completeData.push(data); //Store JSON data
            }
          });

}
