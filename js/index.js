Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

function getParam(param){
    var urlParams = new URLSearchParams(window.location.search);
    var myParam = urlParams.get(param);
    return myParam;
   }

   function checkClick() {
   		cordova.plugins.notification.local.on("click", function (notification) {
   			var num = notification.data.num;
   			var lev = notification.data.lev;
   			var href = "game.html?num=" + num + "&lev=" + lev;
   			window.location.href = href;
   		});
   }

function handleOpenURL(url) {
  setTimeout(function() {
    var url2 = window.location.href;
    if(url2.indexOf("nosplash") > -1){
        return;
    }
    var p = url.indexOf("=");
      var groupName = url.slice(p + 1);
      var href = "multiplayer.html?groupName=" + groupName;
   	  window.location.href = href;
  }, 0);
}

var scores;
var skipped;
var currLevel = -1;
var currNum;

function onBackKeyDown1() {
    // Handle the back button
    window.plugins.appMinimize.minimize();
}

$("document").ready(function () {
	document.addEventListener("deviceready", checkClick, false);
    document.addEventListener("backbutton", onBackKeyDown1, false);
	$("#checkLight").on("change", function () {
		var showLight = $("#checkLight").is(":checked");
		switchTheme(showLight);
	})

	scores = localStorage.getItem("scores");
	if (scores == undefined || scores == null) {
		startScores();
		localStorage.setItem("scores", JSON.stringify(scores));
		//localStorage.setItem("skipped", JSON.stringify(skipped));

	} else {
		scores = JSON.parse(localStorage.getItem("scores"));
		//skipped = JSON.parse(localStorage.getItem("skipped"));
	}

	var scoreNow = localStorage.getItem("scoreNow");
	if (scoreNow == undefined || scoreNow == null) {
		var startWith = 50;
		localStorage.setItem("scoreNow", startWith);
		$(".getCoins").text(startWith);
	} else {
		$(".getCoins").text(scoreNow);
	}
	drawLevels();
})

function startScores() {
    var test = Object.keys(gameWords);
    if (scores == null || scores == undefined) {
    scores = {};
    skipped = {};
    test.forEach(function (val, ind) {
            scores[val] = "";
            //var arr = [];
            //skipped[val] = arr;
        })
    }
}

function updateScores(numb, score) {
    scores[numb] = score;
    var str = JSON.stringify(scores);
}

var txt = "";
//var t = failedAttempts[10].splice(failedAttempts[10].indexOf(1),1) used to remove when passed
function drawLevels() {
    
    $.each(scores, function (key, valueObj) {
        var max = gameWords[key].length;
        var fin = valueObj == "" ? 0 : valueObj.split(",").length;
        //var skips = skipped[key].length;
        //var fin = valueObj - skips;
        //txt += key + " letter words: " + fin + " out of " + max + "\n";
        var row = createRow(key, fin, max);
        $("#levelPar").append(row);
    });
    if(window.location.href.indexOf("nosplash") > -1){
        $(".header").removeClass("d-none");
        noSplash();
    }else{
        startAnim(1500);
    }    
}


function createRow(num, curr, max){
    var per = Math.floor((curr/max) * 100);
    var col = " bg-success";
    var reset = "";
    if(per <= 33){
        col = " bg-danger";
    }else if(per > 33 && per <= 66){
        col = " bg-warning";
    }
    //col = " bg-secondary";
    //col ="";
    per = per + "%";
    var butText = curr < 1 ? "Start" : "Continue";
    if(per == "100%"){
        butText = "Done " + '<i class="fas fa-trophy done"></i>';
        reset = '<button type="button" class="btn btn-secondary chalk myBut ml-1" onclick="reset(' + num + ')">Restart</button>';
    }
            var row =  '<div class="jumbotron myjumbo"><div class="row eachRowIns ml-0">';
                row +=    '<div class="col-2 text-center pl-0 pr-0 inMiddle">';
                row +=          '<div class="numbs blue">' + num + '</div>';
                row +=        '</div>';

                row +=    '<div class="col-7 pl-1 pr-3">';
                row +=        '<div class="text-left letters">Letter Words</div>';
                row +=        '<div class="progress myProg">';
                row +=          '<div class="progress-bar progress-bar-striped progress-bar-animated' + col + '" role="progressbar" style="width:' + per + '" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>';
                row +=       '</div>';
                row +=        '<div class="divide text-left">' + curr + ' / ' + max + '</div>';
                row +=    '</div>';
               row +=    '<div class="col-3 pr-2 inMiddle"><button type="button" class="btn myBut float-right" onclick="play(this,' + num + ')">' + butText + '</button></div>';
            row += '</div>';  
        row += '</div>';
    return row;
}

function onConfirm(buttonIndex) {
    if(buttonIndex == 1){
        scores = JSON.parse(localStorage.getItem("scores"));
            scores[num] = "";
            localStorage.setItem("scores", JSON.stringify(scores));
    }
}

function play(but,num){
    butClickSound();
    var aud = $("audio").get(2);
    var time = (aud.duration * 1000) + 100;
    time = allowSound == true ? time : 0;
    setTimeout(function(){
        if($(but).find(".done").length > 0){
            
        var conf = confirm("Do you want to reset this level?");
        if(conf){
            scores = JSON.parse(localStorage.getItem("scores"));
            scores[num] = "";
            localStorage.setItem("scores", JSON.stringify(scores));
        }
    }
    var lev = scores[num];
    if(skipPassed){
        lev = currLevel;
        currNum = parseInt(num);
        nextUnique();
    }else{
        currNum = parseInt(num);
        //currLevel = lev == "" ? 0 : lev.split(",").max();
        currLevel = 0;
    }
    currLevel = currLevel > (gameWords[currNum].length - 1) ? (gameWords[currNum].length - 1) : currLevel;
    var href = "game.html?num=" + num + "&lev=" + currLevel;
    window.location.href = href;
    }, time)
    
}

function reset(num){
    butClickSound();
    var con = confirm("Are you sure you want to restart this level?");
    if(con){
        scores = JSON.parse(localStorage.getItem("scores"));
        scores[num] = "";
        localStorage.setItem("scores", JSON.stringify(scores));
        var lev = 0;
        var href = "game.html?num=" + num + "&lev=" + lev;
        window.location.href = href;
    }
}

function startAnim(dur){
    $("#animScreen").css("display", "table");
    $("body").addClass("hiddenOverflow");

    var word = "Unscramble";
    var text = shuffle(word.split(""));
    $("#logo").text(text.join(""));
    anime({
        targets: '#loader',
        width: '101%',
        easing: 'linear',
        duration:dur,
        update: function(anim) {
            //$("#loader").text(Math.round(anim.progress) + '%');
        },
        complete: function(anim) {
             resolveAnim();    
        }
    });   
}

function resolveAnim(){
    $("#logo").text("");
    var word = "Unscramble";
    var text = word.split("");
    for(var i = 0; i < text.length; i++){
        var span = "<span class='cong'>" + text[i] + "</span";
        $("#logo").append(span);
    }
    anime({
              targets: '.cong',
              opacity: 1,
              delay: anime.stagger(100),
              complete: function(anim) {
		          $(".header").removeClass("d-none");
                loadIn();
                
            }
        });
}


function loadIn(){
	$("#animScreen").fadeOut(500, function () {
		$("#animScreen").hide();
		$("#mainContent").removeClass("d-none"); //.fadeIn(1000);
		//testAnim("body","slideInLeft");
        testAnim(".myjumbo:even", "slideInRight faster");
        testAnim(".myjumbo:odd", "slideInLeft faster");
         $("body").removeClass("hiddenOverflow");
		var shownTour = localStorage.getItem("shownTour");
		if (shownTour == undefined || shownTour == null) {
			localStorage.setItem("shownTour", 1);
			setTimeout(generateTourHome, 1000);
		}
		
	});
}

function noSplash(){
    $("#animScreen").hide();
    $("#mainContent").removeClass("d-none"); //.fadeIn(1000);
    //testAnim("body","slideInLeft");
    testAnim(".myjumbo:even", "slideInRight faster");
    testAnim(".myjumbo:odd", "slideInLeft faster");
    
}
