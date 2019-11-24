

var wordLetters;
var scores, skipped;
var keys = Object.keys(gameWords);
var max = parseInt(keys[keys.length - 1]);
var currNum, currLevel, maxLevel;
var counting = ["first","second", "third", "fourth", "fifth", "sixth", "seventh", "eight", "nineth", "tenth", "eleventh", "twelveth", "thirtheenth", "fourtheenth", "fifteenth",
               "sixteenth", "seventeenth","eighteenth", "nineteenth", "twenteeth"];
var niceWords = ["Excellent","Correct","Awesome","Smart","Thumbs Up","Bravo","Brilliant"];

function calcArrows(){
    $(".box2, .box").empty();
    var w = $(".cong2").width() * $(".cong2").length;
    var pw = $("#theWord").width();
    var d = Math.floor((pw - w)/4);
    var h = $("#theWord22").outerHeight(true);
    $(".box2").css({
        "width":d + "px"
        //"height":h + "px"
    })
    
     $(".box").css({
        "width":d + "px"
        //"height":h + "px"
    })
     var wdt = 15;
    //d *=0.66;
    var ct = Math.floor(d/wdt);
    for(var i = 0; i < ct; i++){
        var arrR = $("<div class='arr'><i class='fa fa-chevron-right'></i></div>");
        $(".box").append(arrR);
        var arrL = $("<div class='arr'><i class='fa fa-chevron-left'></i></div>");
        $(".box2").append(arrL);
        $(".arr").css({"font-size":h/2 + "px"});
    }
    if(ct > 1){
    //$(".arr").css("opacity",0);
    anime({
            targets: '.box .arr',
            color:"#5600ff",
            //opacity: 1,
            loop:true,
            endDelay: 1000,
            delay: anime.stagger(200)
        });
    anime({
            targets: '.box2 .arr',
            color:"#5600ff",
            //opacity: 1,
            loop:true,
            endDelay: 1000,
            delay: anime.stagger(200, {direction: 'reverse'})
        });  
    }
}

function onPauseTrigger() {
    if(passed){
        return;
    }
    var hinted = theWord.split("");
	var p = Math.floor(Math.random() * (hinted.length));
	var t = hinted[p];
	var pn = p + 1;
	var text = "The " + counting[p] + " letter is " + t;
	var title = "Hint: Level " + currNum + " Word " + (currLevel + 1);
	// show notification once a while
    var noty = false;
    var currNumNum = parseInt(currNum);
    if(currNumNum < 11){
        noty = pn == currNumNum ? true : false;
    }else{
        if(pn >= currNumNum && pn <= (currNumNum + 2)){
            noty = true;
        }
    }
    
	if(noty){
		var now = new Date().getTime();
		var ten = new Date(now + 10 * 1000);
		cordova.plugins.notification.local.schedule({
			id: 1,
			title: title,
			text: text,
			at: ten,
			foreground: true,
			data: {num:currNum, lev: currLevel}
		});
	}
}

function scheduler(){
    var sch = localStorage.getItem("scheduler");
    if(sch == undefined || sch == null){
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
                cordova.plugins.notification.local.schedule({
                id:2,
                text: "It is time to unscramble some words",
                firstAt: tomorrow,
                every: "day"
            });
        localStorage.setItem("scheduler", true);
    }

}

function onBackKeyDown2() {
    // Handle the back button
    goHome();
}


$("document").ready(function(){

document.addEventListener("deviceready", scheduler, false);
document.addEventListener("pause", onPauseTrigger, false);
document.addEventListener("backbutton", onBackKeyDown2, false);
    var topHeight = $(".header").height() + 10;
    $("#exampleModal").find(".modal-content").css("top", topHeight + "px");

    //testAnim("body", "slideInRight");
    testAnim(".theSame, .darkBck", "slideInRight faster");
    testAnim($(".theLetters").eq(1), "slideInLeft faster");
	var shownTour = localStorage.getItem("shownTour");
		if (shownTour == undefined || shownTour == null) {
			localStorage.setItem("shownTour", 1);
			setTimeout(generateTourGame, 1000);
		}else{
			if(shownTour == "1"){
				localStorage.setItem("shownTour", 2);
				setTimeout(generateTourGame, 1000);
			}
		}
    $('#exampleModal').on('hidden.bs.modal', function (e) {
      //go to next level when modal closes
        $(".thumbs").removeAttr("style");
        //$(".contBut").hide();
        if(skipPassed){
            nextUnique();
            currLevel = currLevel > (gameWords[currNum].length - 1) ? (gameWords[currNum].length - 1) : currLevel;
        }else{
           currLevel += 1;
            currLevel = currLevel > (gameWords[currNum].length - 1) ? (gameWords[currNum].length - 1) : currLevel; 
        }
        
        oneWord(gameWords[currNum][currLevel], currNum, currLevel);
    })
    $('#exampleModal').on('shown.bs.modal', function (e) {
        var ht = Math.floor($("#exampleModal").find(".modal-body").outerHeight(true)/2);
        $("#exampleModal").find(".thumbsPar").css("height", ht + "px");
    })
    
    var num =  getUrlVars()["num"]; //getParam("num");
    var lev =  getUrlVars()["lev"]; //getParam("lev");
    scores = JSON.parse(localStorage.getItem("scores"));
    var scoreNow = localStorage.getItem("scoreNow");
    $(".getCoins").text(scoreNow);
    //skipped = JSON.parse(localStorage.getItem("skipped"));
    
    $(".number").text(num);
    $('.arrows').on("click",function(){
        wordLetters = parseInt($(".number").text());
        if($(this).hasClass("leftBut")){
           wordLetters -= 1;
           wordLetters = wordLetters < 3 ? max : wordLetters;
           $(".number").text(wordLetters);
           var lev = scores[wordLetters];
            lev = lev == "" ? 0 : lev.split(",").max();
            $("#yourWord").empty();
            oneWord(gameWords[wordLetters][lev], wordLetters, lev);
        }
        if($(this).hasClass("rightBut")){
           wordLetters += 1;
           wordLetters = wordLetters > max ? 3 : wordLetters;
           $(".number").text(wordLetters);
            var lev = scores[wordLetters];
            lev = lev == "" ? 0 : lev.split(",").max();
            $("#yourWord").empty();
            oneWord(gameWords[wordLetters][lev], wordLetters, lev);
        }
    })
    maxLevel = scores[num];
    oneWord(gameWords[num][lev], num, lev);
    
    $("#showModal").click(function(){
        $("#exampleModal").modal({
            backdrop: 'static',
            keyboard: false
        });
        
    });
    
})



var theWord;
var letColors = ["oneCol", "twoCol", "threeCol", "fourCol"];
var passed = false;
function oneWord(complex, num, lev){
	$("#synonyms").empty();
    passed = false;
    lev = parseInt(lev);
    currNum = num;
    currLevel = parseInt(lev);
    $("#yourWord").empty();
    if(lev == 0){
        $("#prev").attr("disabled", "disabled");
    }else{
        $("#prev").attr("disabled", false);
    }
    
    if(lev == gameWords[num].length - 1){
        $("#next").attr("disabled", "disabled");
    }else{
        $("#next").attr("disabled", false);
    }
    $("#curr").text(lev + 1);
    $("#maxLevel").text(gameWords[num].length);
    
    var word = complex.split(":")[0];
    theWord = word;
    word = shuffle(theWord.split(""));
    if(word.join("") == theWord){
        oneWord(complex, num, lev);
        return;
    }
    var syns = complex.split(":")[1];
    syns = replacewith(syns, theWord);
	//show word one at a time
	var splitSyns = syns.split(",");
    var m = 0;
	for(var c = 0; c < splitSyns.length; c++){
        var ccolor = letColors[m];
		var eachSyns = splitSyns[c];
		var cSysns = "<div class='eachSyn " + ccolor + "'>" + eachSyns.trim() + "</div>";
        m+=1;
        m = m == letColors.length ? 0 : m;
		$("#synonyms").append(cSysns);
	}

    //$("#theWord").text(word.join("").toLowerCase());
    $("#theWord").empty();
    createWord(word.join("").toLowerCase());
    //calcArrows();
    $(".yourWordPar").css("min-height",$("#theWord").height() + "px");
    $("#buttons").empty();
    word.forEach(function(val, ind){
        var but = $("<button class='btn' type='button' id='but-" + ind + "' data-but='" + val.toLowerCase() + "'>" + val.toUpperCase() + "</button>");
        $(but).on("click", function(){
            var t = $(this).data("but");
            $("#yourWord").find(".fa-check").remove();
            butClickSound();
            if($(this).hasClass("clicked")){
                var pos = $(this).data("pos");
                var del = $('*[data-posc="' + pos + '"]');
                $(del).remove();
                $(this).removeClass("clicked");
                
            }else{
                $(this).addClass("clicked");
                //var len = $("#yourWord").text().split("").length;
                $(this).attr("data-pos", ind);
                var span = $("<span data-posC='" + ind + "'>" + t + "</span>");
                $("#yourWord").append(span);
                //$("#yourWord").text(type + t);
                type = $("#yourWord span").text();
                if(type.length == theWord.length){
                    if(type.toLowerCase() == theWord.toLowerCase()){
                        var pass = '<i class="fas fa-check" style="font-size:1.5em;"></i>';
                        passed = true;
                        $("#yourWord").append(pass);
                        if(allowSound){
                            var audio = $('audio').get(0);
                            audio.currentTime=0;
                            audio.play();
                        }
                        //testAnim("#exampleModal", "jackInTheBox slow");
                        //testAnim("#exampleModal", "tada slower");
                        var pickOne = Math.floor(Math.random() * (niceWords.length));
	                    var niceWord = niceWords[pickOne];
                        $(".ribbon-front-inner").text(niceWord + "!");
                        $(".gifHolder.one").addClass("spin");
                        next(true);
                        //updateScores(currNum, currLevel + 1);
                    }else{
                        if(allowSound){
                            var audio = $('audio').get(1);
                            audio.currentTime=0;
                            audio.play();
                        }
                        testAnim("#yourWord", "shake");
                    }
                }
                
            }
           
        })
        $("#buttons").append(but);
    })
    
    var clearer = $("<div class='btn btn-danger' id='clearer' onclick='clearAllButton()'>Clear All</div>");
    $("#buttons").append(clearer);
    activateClickSound();
    
    var arr = scores[currNum].split(",");
    if(arr.indexOf(currLevel.toString()) > -1){
        var pass = '<i class="fas fa-check" style="font-size:1.5em;"></i>';
        passed = true;
        $("#yourWord").append(pass);
    }
    testAnim(".eachSyn", "zoomIn faster");
    testAnim("#buttons button, #clearer", "fadeInLeft faster");
}

function replacewith(word, replace){
    var rep = replace.replace(/[a-zA-Z0-9_-]/g,'*');
    return word.replaceAll(replace, rep);
}

function start(){
    $("#yourWord").text("");
    var num = parseInt($(".number").text());
    oneWord(gameWords[num][0]);
}

function updateScores(numb, score) {
    scores[numb] = score;
    var str = JSON.stringify(scores);
    localStorage.setItem("scores", str);
}

function next(passed){
    if(passed){
        var arr = scores[currNum].split(",");
        var completed = false;
        if(arr.indexOf(currLevel.toString()) == -1){
            var passedthus = scores[currNum];
            passedthus = passedthus == "" ? currLevel.toString() : passedthus + "," + currLevel.toString();
            scores[currNum] = passedthus;
            localStorage.setItem("scores", JSON.stringify(scores));
            var giveScore = 10;
            var passArr = passedthus.split(",").length;
            completed = passArr == gameWords[currNum].length ? true : false;
            giveScore = completed == true ? 500 : giveScore;
            showWin(giveScore, theWord, completed);
            var scoreNow = parseInt($(".getCoins").text());
            scoreNow += giveScore;
            $(".getCoins").text(scoreNow);
            localStorage.setItem("scoreNow", scoreNow);
        }else{
            var giveScore = 0;
            showWin(giveScore, theWord, completed);
        }
        
    }else{
        if(skipPassed){
            nextUnique();
        }else{
           currLevel += 1; 
        }
        
        currLevel = currLevel >= gameWords[currNum].length ? gameWords[currNum].length - 1 : currLevel;
        oneWord(gameWords[currNum][currLevel], currNum, currLevel);
    }
    
}

function prev(){
    if(skipPassed){
        prevUnique();
    }else{
        currLevel -= 1;
    }
    
    currLevel = currLevel < 0 ? 0 : currLevel;
    $("#curr").text(currLevel + 1);
    oneWord(gameWords[currNum][currLevel], currNum, currLevel);
}

function showWin(coins, word, completed){
    $("#showModal").click();
    //testAnim(".modal-content", "pulse");
    $("#corrAnswer").empty();
    var logoWidth = 0;
    var stagger = 50;
    var hideWinTime = 200;
    word = completed == true ? " Level " + currNum + " Completed " : word;
    var text = word.split("");
    
    //if(completed)$("#corrAnswer").append("<i class='fas fa-thumbs-up cong'></i>");
    
    for(var i = 0; i < text.length; i++){
        var span = "<span class='cong'>" + text[i] + "</span";
        $("#corrAnswer").append(span);
    }
    
    if(completed)$("#corrAnswer").append("<i class='fas fa-thumbs-up cong'></i>");
    
    $("#congratsScreen").show();
    //$(".contButPar").hide();
    $(".wonCoins").text(coins);
    $("#congratsScreen").css("top", "-100vh");
    if(completed){
        $(".winLogo").removeClass("fa-thumbs-up").addClass("fa-trophy");
        stagger = 150;
        hideWinTime = 1500;
    }else{
        $(".winLogo").removeClass("fa-trophy").addClass("fa-thumbs-up");
    }
    
    anime({
        targets: '#congratsScreen',
        top: "15vh",
        complete: function(anim) {
            var p = $(".thumbs").width();
            var c = $(".winLogo").width();
            var m = (p-c)/2;
            //$(".thumbs").animate({"paddingLeft": m + "px", "paddingTop" : "0"},1000);
            anime({
                targets: '.thumbs',
                paddingLeft: m + "px",
                duration: 1000
            });
            anime({
              targets: '.cong',
              opacity: 1,
              delay: anime.stagger(stagger),
              complete: function(anim) {
                //$(".contBut").fadeIn();
                  setTimeout(hideWin,hideWinTime);
            }
        });    
        }
    });
}

function hideWin(){
    $("#showModal").click();
    $(".gifHolder.one").removeClass("spin");
}

var fins = {};
function shuffleWords(){
    $.each(gameWords, function (key, valueObj) {
        var c = shuffle(gameWords[key]);
        fins[key] = c;
    });
}

function download(content, fileName, contentType) {
var a = document.createElement("a");
var file = new Blob([content], { type: contentType });
a.href = URL.createObjectURL(file);
a.download = fileName;
a.click();
}

function clue(){
    var coin = parseInt($(".getCoins").text());
    
    if(coin < 50){
        if(navigator.notification == undefined){
            alert("You don't have enough coins");
        }else{
             navigator.notification.alert(
                "You don't have enough coins",  // message
                null,         // callback
                'Unscramble',            // title
                'Continue'                  // buttonName
            );
        }
        return;
    }
    coin -= 50;
    $(".getCoins").text(coin);
    localStorage.setItem("scoreNow", coin);
    
    var helpAvail = false;
    var help = false;
    var correctAnswer = theWord.split("");
    var userWrongAnswer = $("#yourWord span").text();
    var userAnswer = $("#yourWord span").text().split("");
    if(userWrongAnswer == ""){
        var first = theWord.split("")[0];
        $('*[data-but="' + first + '"]').eq(0).click();
        return;
    }
    //empty and remove clicked
    $("#yourWord").empty();
    $("#buttons button").removeClass("clicked");
    
    for(var i = 0; i < correctAnswer.length; i++){
        if((i + 1) > userAnswer.length && help == false){
            var text = correctAnswer[i];
            $('*[data-but="' + text + '"]').not(".clicked").eq(0).click();
            helpAvail = true;
            return;
        }
        
        if(userAnswer[i] != correctAnswer[i]){
            if(!helpAvail){
               var text = correctAnswer[i];
                $('*[data-but="' + text + '"]').not(".clicked").eq(0).click();
                helpAvail = true; 
            }else{
                break;
            }
            
        }else{
            var text = correctAnswer[i];
            $('*[data-but="' + text + '"]').not(".clicked").eq(0).click();
        }
    }
}
var rt;
function reduceWords(){
    var t = Object.keys(words);
    var categories = t.reduce(function(sum, product) {
    if(sum.indexOf(product) == -1 || sum.indexOf(" ") == -1){
        sum.push(product);
    }
    return sum;
    }, []);
}

var test;// = Object.keys(words);
function testSlice(){
  
for(var i = 0; i < test.length; i++){
	var b = test.filter(elem => elem.includes(test[i]));
    b.splice(0,1);
     for(var c = 0; c < b.length; c++){
         if(b[c].toLowerCase() != test[i].toLowerCase()){
             var pos = test.indexOf(b[c]);
		      test.splice(pos,1)
         }
		
     }
    if(test[i].indexOf(" ") > -1){
        var pos = test.indexOf(test[i]);
		  test.splice(pos,1)
    }

    }
}
var groups = {};
function group(){ 
    for(var i = 0; i < test.length; i++){
        var len = test[i].length;
        if(len < 3){
            continue;
        }
        if(test[i].indexOf(" ") > -1){
            continue;
        }
        if(groups[len] == undefined){
            var tw = test[i];
            var arr = words[tw].slice(0, 8).join(", ").toLowerCase();
            var arr2 = [];
            arr2.push(tw + ":" + arr);
            groups[len] = arr2;
        }else{
           var tw = test[i];
           var arr = words[tw].slice(0, 8).join(", ").toLowerCase(); 
            var mst = tw + ":" + arr;
            groups[len].push(mst);
            groups[len] = shuffle(groups[len]);
        }      
    }
}




