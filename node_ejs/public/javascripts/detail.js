$( document ).ready(function() {


    console.log( "ready!" );
    for( i=0; i<4 ; i++ ){
      var fullText = $("#fullTextSrc_"+i).text();
      fullText = replaceAll(fullText,"-","");
      fullText = replaceAll(fullText,',',' ');
      fullText = replaceAll(fullText,"`"," ");
      fullText = replaceAll(fullText,"'"," ");
      fullText = replaceAll(fullText,"\""," ");
      fullText = replaceAll(fullText,"\n","");
      // fullText = replaceAll(fullText,'\xa0', ' ');
      // fullText = replaceAll(fullText,'\u2219', ' ');
      // fullText = replaceAll(fullText,'\u2027', ' ');
      // console.log(ConvertSystemSourcetoHtml(fullText));

      var tokenizedTextEle = $("#fullText_"+i);


      for (var j=0; j< fullText.length; j++){
          var str = fullText.slice(j,j+1);
          // console.log(str);
          var stringEle = $('<span></span>');

          stringEle.prop("id","token_"+i+"_"+j);
          stringEle.html(str);
          tokenizedTextEle.append(stringEle);
         }

    }



       // 그래프 애니메이션
       $('.graph-bar').each(function() {
         var dataWidth = $(this).data('value');
         $(this).css("width", dataWidth + "%");
        });

       // // 그래프 선택시
       // $('.graph-bg').click(function(){
       //   $(this).toggleClass("on");
       //   $('.contents').children('span*').toggleClass();
       // });

       // 개별분석 토글
       $(".toggleResult").click(function(e) {
        $(".resultWrap").toggleClass("on");
         $(this).toggleClass("on");
         e.preventDefault();
        });

       // 에러 모달
       $("#error").click(function() {
          window.scroll({top:0});
          $(".modal").css('display','block');
          $(".dim").css('display','block');
        });

       // 모달 닫기
       $(".btnConfirm").click(function(){
         $(".modal").css('display','none');
         $(".dim").css('display','none');
       });

       var x = $(".scrollWrap .selected").position();
       // alert("Top: " + x.top );
       var x_pos = x.top*1 -150;
       $('.scrollWrap').scrollTop(x_pos);

});



// function makeSub(obj) {
//  var id = $(obj).attr('index');
//  var val = $(obj).val();
//  var target = $('#set_' + id);
//  target.text('');
//  for (var i=0; i<parseInt(val); i++) {
//    target.append("<li><input type='text' class='subItem'></li>");
//  }
//  if (val == parseInt(0)) $(target).parent().hide();
//  if (val != parseInt(0)) $(target).parent().show();
//  //console.log(id+'/'+val+'/'+$(target).html());
// }


function ConvertSystemSourcetoHtml(str){
 str = str.replace(/</g,"&lt;");
 str = str.replace(/>/g,"&gt;");
 str = str.replace(/\"/g,"&quot;");
 str = str.replace(/\'/g,"&#39;");
 str = str.replace(/\n/g,"<br />");
 return str;
}


function replaceAll(str, searchStr, replaceStr) {

    return str.split(searchStr).join(replaceStr);
}

// function clearGT(){
//   $("#fullText").find("span").each(function(i,e){
//     $(e).css("background-color",'white');
//   });
//
// }

// function clearFullText(){
//   $("#fullText").find("span").each(function(i,e){
//     $(e).css("background-color",'white');
//   });
//
// }



function drawGT(index,innerI, gt_str1,gt_str2, gt_str3 ) {

    var fullText = $("#fullTextSrc_"+index).text();
    fullText = replaceAll(fullText,"-","");
    fullText = replaceAll(fullText,',',' ');
    fullText = replaceAll(fullText,"`"," ");
    fullText = replaceAll(fullText,"'"," ");
    fullText = replaceAll(fullText,"\""," ");
    fullText = replaceAll(fullText,"\n","");
    // fullText = replaceAll(fullText,'\xa0', ' ');
    // fullText = replaceAll(fullText,'\u2219', ' ');
    // fullText = replaceAll(fullText,'\u2027', ' ');
      // fullText = replaceAll(fullText,","," ");
      // gt_str1 = replaceAll(gt_str1,"\r\n","");
      // gt_str2 = replaceAll(gt_str2,"\r\n","");
      // gt_str3 = replaceAll(gt_str3,"\r\n","");

      var drawGT_1 = gt_str1;
      var drawGT_2 = gt_str2;
      var drawGT_3 = gt_str3;
      console.log(drawGT_1);
      console.log(ConvertSystemSourcetoHtml(drawGT_1));
      console.log(drawGT_2);
      console.log(ConvertSystemSourcetoHtml(drawGT_2));
      console.log(drawGT_3);
      console.log(ConvertSystemSourcetoHtml(drawGT_3));
      // replaceAll(gt_str3,"\r"," ");;
      // console.log(fullText);

      for (var outer_i=1;outer_i<=3 ;outer_i++){
        if(outer_i==1) g_str = drawGT_1;
        else if(outer_i==2) g_str = drawGT_2;
        else if(outer_i==3) g_str = drawGT_3;
        else return error;


        var start = fullText.indexOf(g_str);
        console.log(start);
        var end = start + g_str.length;
        console.log(end);


        for (var i=start;i<end;i++){
          var targetEle = $("#token_"+index+"_"+i);

            if(innerI == 0) targetEle.addClass("textBg1");
            else if (innerI == 1) targetEle.addClass("textBg2");
            else if (innerI == 2) targetEle.addClass("textBg3");
            else if (innerI == 3) targetEle.addClass("textBg4");
            else return false;
        }
      }
}


function removeGT(index,innerI, gt_str1,gt_str2, gt_str3 ) {

/*
        for (var i=start;i<end;i++){
          var targetEle = $("#token_"+i);
            //console.log(targetEle);
            if(index == 0) targetEle.addClass("itemColor1");
            else if (index == 1) targetEle.addClass("itemColor2");
            else if (index == 2) targetEle.addClass("itemColor3");
            else if (index == 3) targetEle.addClass("itemColor4");
            else return false;
        }
*/
        var classStr = "textBg"+(1+(1*innerI));
        // console.log(classStr);
        $("#fullText_"+index).find("."+classStr).each(function(i,e){
          $(e).removeClass(classStr);
        });

}

function toggleGT(ele,index, innerI, gt_str1,gt_str2, gt_str3 ) {
    //clearGT();

    var graphEle = $(ele);
    if (graphEle.hasClass("graph-bg on")){
      graphEle.removeClass("on");
      removeGT(index, innerI, gt_str1,gt_str2, gt_str3 );
    } else {
      graphEle.addClass("on");
      drawGT(index, innerI, gt_str1,gt_str2, gt_str3 );
    }


}

function clickLoad(){
  var evalRows = $("#evalRows").val();

  if(!evalRows){
    evalRows = 30;
  }
  console.log(evalRows);
  var goUrl = '/main/load?pageRows='+evalRows;
  $(location).attr('href', goUrl);
}

// 그래프 선택시
$('.graph-bg').click(function(){
  $(this).toggleClass("on");
  $('.contents').children('span*').toggleClass();
});
