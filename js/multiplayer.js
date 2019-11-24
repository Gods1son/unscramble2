var socket;
var theWord;
var has_focus = true;
var phoneGap = false;
var updates = 0;
var updatesOpponent = 0;
var interv;
var intervOpponent;
var onlineCoins = 0;
var groupNameJoined;
var iscoordinator = false;
var iscoordgame = false;
var ismultigame = false;
var isClosed = false;
function onResume() {
    // Handle the resume event
    has_focus = true;
    if(updates > 0){
        timerOpponent(true);
        readTimer();
    }
}

function onPause() {
    // Handle the pause event
    has_focus = false;
    if(updates > 0){
        clearInterval(interv);
        timerOpponent(false);
    } 
}

function startPhoneGap(){
    phoneGap = true;
}

function onBackKeyDown3(){
     if($("#gameScreen").is(":visible")){
        if(navigator.notification == undefined){
                var conf = confirm("This will close any game that you might be playing, do you want to proceed?");
                var msg = false;
                if(conf){
                    if((iscoordinator) || (iscoordgame == false && ismultigame == false) || (ismultigame && ($(".players").length <= 1))){
                        socket.emit("deleteRoom", "");
                        showNoty(false, "You left room and it has been closed");
                    }
                    if(iscoordinator == false && iscoordgame){
                        iscoordgame = false;
                        isClosed = true;
                        socket.emit("leaveRoomCoord", "");
                        showNoty(false, "You left room");
                    }
                    if(ismultigame && ($(".players").length > 1)){
                        ismultigame = false;
                        isClosed = true;
                        socket.emit("leaveRoomCoord", "");
                        showNoty(false, "You left room");
                    }
                    $("#participants").addClass("d-none");
                    window.location.href = "index.html?nosplash";

                } 
            }else{
                var message = "This will close any game that you might be playing, do you want to proceed?";
               var title = "Unscramble";
               var buttonLabels = ["YES","NO"];
               navigator.notification.confirm(message, deleteCallback, title, buttonLabels);

               function deleteCallback(buttonIndex) {
                  if(buttonIndex == 1){
                      if((iscoordinator) || (iscoordgame == false && ismultigame == false) || (ismultigame && ($(".players").length <= 1))){
                        socket.emit("deleteRoom", "");
                        showNoty(false, "You left room and it has been closed");
                    }
                    if(iscoordinator == false && iscoordgame){
                        iscoordgame = false;
                        isClosed = true;
                        socket.emit("leaveRoomCoord", "");
                        showNoty(false, "You left room");
                    }
                    if(ismultigame && ($(".players").length > 1)){
                        ismultigame = false;
                        isClosed = true;
                        socket.emit("leaveRoomCoord", "");
                        showNoty(false, "You left room");
                    }
                    $("#participants").addClass("d-none");
                    window.location.href = "index.html?nosplash";
                }
            }
        }
    }else{
        window.location.href = "index.html?nosplash";
    }
    
}

function replacewith(word, replace){
    var rep = replace.replace(/[a-zA-Z0-9_-]/g,'*');
    return word.replaceAll(replace, rep);
}

$("document").ready(function(){
    document.addEventListener("deviceready", startPhoneGap, false); 
    document.addEventListener("backbutton", onBackKeyDown3, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("pause", onPause, false);
    
    $("#groupName").on('keyup', function (e) {
    if (e.keyCode === 13) {
            acceptFriendInvitation();
        }
    });
    
    window.addEventListener('beforeunload', function (e) {
        if((iscoordinator || iscoordgame == false) && isClosed == false){
            socket.emit("deleteRoom", "");
            //showNoty(false, "You left room and it has been closed");
        }
    });
    
    onlineCoins = localStorage.getItem("onlineCoins");
		if (onlineCoins == undefined || onlineCoins == null) {
            onlineCoins = 50;
			localStorage.setItem("onlineCoins", 50);	
		}else{
            onlineCoins = parseInt(onlineCoins);
        }
        $(".getCoins").text(onlineCoins);
    
    fillAlphas();

     $('#usernameModal').on('shown.bs.modal', function (e) {
          $("#enterUsername").focus();
        })
     
     $("#enterUsername").on('keypress',function(e) {
        if(e.which == 13) {
            if($(".updateUsername").is(":visible")){
                updateUsername();
                return;
            }
            setUsername();
        }
    });
    
    $("#inviteButtons i").on("click", function(){
        var us = $("#username").val();
        if(us.trim() == ""){
            $("#showUsernameModal").click();
            showNoty(false, "Please choose a username first");
            return;
        }
        var type = $(this).data("type");
        var groupName = us + "_pair";
        var url = "https://chat202.herokuapp.com/joinGroup?groupName=" + groupName;
        //var url = "<a href='edjufununscramble://multiplayer.html?groupName=" + groupName + "'>Click to play with me</a>";
        //var url = "multiplayer.html?groupName=" + groupName;
        socialLink(type, url, groupName);
    })

    
    connect();  
    var url = window.location.href;
    if(url.indexOf("groupName") > -1){
        playGroupName();
    }
})

function connect(){
    
    //socket = io.connect('http://localhost:3000/', {transports: ['websocket']});
    try{
        /*socket = io.connect('http://localhost:3000/', {
    		'reconnection': true,
    		'reconnectionDelay': 1000,
    		'reconnectionAttempts': 10
    	});*/
    	socket = io.connect('https://unscrambleapp.herokuapp.com/', {
    		'reconnection': true,
    		'reconnectionDelay': 1000,
    		'reconnectionAttempts': 10
    	});
    }catch(err){
        alert(err);
    }
    
        socket.on('connect', function(){
		// call the server-side function 'adduser' and send one parameter (value of prompt)
		    $("#connected").html("Connected");
            $("#connected").removeClass("bg-danger").removeClass("bg-secondary").addClass("bg-success");
            //var username = $("#username").val().trim();
            var username = localStorage.getItem("onlineUsername");
            if(username == undefined){
                $("#changeUsernamePar, .updateUsername").addClass("d-none");
                $("#showUsernameModal").click();
            }else{
                $("#changeUsernamePar, .updateUsername").removeClass("d-none");
                $(".chooseUsername").addClass("d-none");
                var data = {};
                data.username = username;
                data.id = socket.id;
                socket.emit("Login", username);
            }
            
	   });
    
    //save log in
    socket.on("loggedIn", function(){
        var username = localStorage.getItem("onlineUsername");
        $("#username").val(username);
        $("#showUsername").text("Hi, " + username).removeClass("d-none");
    })
    
    socket.on("createUserResult", function(data, status){
        
        if(status == false){
            if($(".updateUsername").is(":visible")){
                $("#warning").text(data).removeClass("d-none");
                $(".updateUsername").html("Update");
                $(".updateUsername").attr("disabled", false);
                return;
            }
           $("#warning").text(data).removeClass("d-none");
           $("#username").val("");
           $("#enterUsername").val("");
       }else{
           
           var msg = data.msg;
            var name = data.name;
           $("#username").val(name);
            localStorage.setItem("onlineUsername", name);
           $("#showUsername").text("Hi, " + name).removeClass("d-none");
           $("#enterUsername").val("");
           $("#showUsernameModal").click();
           $("#changeUsernamePar, .updateUsername").removeClass("d-none");
           $(".chooseUsername").addClass("d-none");
       }
    })
    
    socket.on('welcomeHere', function(username, data){
	   if(username == false){
           $("#warning").text("Username chosen, please try another").removeClass("d-none");
           $("#username").val("");
           $("#enterUsername").val("");
       }else{
           var name = $("#username").val();
           $("#showUsername").text("Hi, " + name).removeClass("d-none");
           $("#enterUsername").val("");
           $("#showUsernameModal").click();
       }
        var groupName = getParam("groupName");
        if(groupName != null){
            socket.emit("acceptFriendInvitation", groupName);
        }
    })
    
    //receive invitation
    socket.on('sendInvitation', function(username){
        $("#invitationFrom").text(username);
        showNoty(true, "Invitation to play from " + username);
        $("#showInvitationModal").click();
    })
    
    socket.on("invitationError", function (data){
        showNoty(false, "User is playing another game now");
        $("#playScreen").hide();
        $("#theBtnHolders").removeClass("d-none");
        $(".multBut, #playWithOnline").removeClass("disabled");
    })
    
    //join group
    socket.on("joinedGroup", function (info){
        iscoordgame = false; ismultigame = false;
        $("#invitationModal").modal("hide");
        $("#participants").addClass("d-none");
        $("#playersCont").empty();
        $(".screen").addClass("d-none");
        $("#scoreBoard").parents(".container-fluid").eq(0).removeClass("d-none");
        $("#gameScreen, #menu, #specButHolder").removeClass("d-none");
        $("#menu").show();
        //$("#connected").addClass("d-none");
        $("#player1").text(info["player1"]);
        $("#player1Score").text(info["player1Score"]);
        $("#player2").text(info["player2"]);
        $("#player2Score").text(info["player2Score"]);
        console.log(info);
        $("#typer").text("").empty();
        $("#synonymsM, #theWord").empty();
        $("#synonymsMPar").addClass("d-none");
        $("#alphass").empty().addClass("d-none");
        $("#alphas").removeClass("d-none");
        //adjustButton(true);
        $("#prevCont").empty();
        if($("#prevCont").css("display") == "block"){
            prevCont();
        }
        var username = $("#username").val();
        if(username == info["player1"]){
        	$("#sendQuestion, #but-clear").removeClass("d-none disabled");
            //$("#ansQuestion").addClass("d-none");
            //alert("You are the first to send a word");
            showNoty(true,"You are the first to send a word");
            setTimeout(generateTourMultiplayerSender, 2500);
            adjustButton(true);
        }else{
           	$("#sendQuestion, #but-clear").addClass("d-none");
            //$("#ansQuestion").removeClass("d-none disabled");
            //alert("The other player is the first to send a word");
            showNoty(true, "The other player is the first to send a word");
            setTimeout(generateTourMultiplayerReceiver, 2500);
            adjustButton(false);
        }
            groupNameJoined = info["groupName"];
    })
     
    //getAllsentWords
    socket.on("allYourSentWords", function(data){
        try{
            $("#yourSentWords").find(".fa-spin").remove();
            $("#yourSentWords").removeClass("disabled");
            var res = JSON.parse(data);
            if(res == null){
                showNoty(false, "No word sent yet");
                return;
            }
            $("#wordsSent").find("tr").not(".noDelete").remove();
            $("#allusergames").addClass("d-none");
            $("#alluserwords").removeClass("d-none");
            for(var i =0; i < res.length; i++){
                var word = res[i].Word;
                var count = res[i].WordCount;
                var row = "<tr class='tableRow'>";
                row += "<td>" + word + "</td>";
                row += "<td>" + count + "</td>";
                row += "</tr>";
                $("#wordsSent").append(row);
            }
            $(".screen, .housing").addClass("d-none");
            $("#YourWordsScreen, #alluserwords").removeClass("d-none");
            hideBarAndMenu();
            testAnim("#alluserwords","slideInUp faster");
        }catch(err){
            $("#yourSentWords").find(".fa-spin").remove();
            $("#yourSentWords").removeClass("disabled");
        }
        
    })
    
     //all users games
    socket.on("allYourGameScores", function(data){
        try{
            $("#yourPastGames").find(".fa-spin").remove();
            $("#yourPastGames").removeClass("disabled");
            var res = JSON.parse(data);
            if(res == null){
                showNoty(false, "No game played yet");
                return;
            }
            var wins = 0;
            var loss = 0;
            var draw = 0;
            $("#allusergames").removeClass("d-none");
            $("#alluserwords").addClass("d-none");
            $("#showAllGames").empty();
            for(var i =0; i < res.length; i++){
                var player1 = res[i].Player1;
                var player1score = res[i].Player1Score;
                var player2 = res[i].Player2;
                var player2score = res[i].Player2Score;
                var us = $("#username").val();
                var build = "<div class='eachScore row'>";
                if(us == player1){
                    build += "<div class='col-6 pr-0'><span class='prevScore float-right'>" + player1score + "</span>";
                    build += "<span class='name float-right'>" + player1 + "</span></div>";
                    build += "<div class='col-6 pl-0'><span class='prevScore float-left'>" + player2score + "</span>";
                    build += "<span class='name float-left'>" + player2 + "</span></div>";
                    if(parseInt(player1score) > parseInt(player2score)){
                        wins += 1;
                    }else if(parseInt(player2score) > parseInt(player1score)){
                        loss += 1;
                    }else{
                        draw += 1;
                    }
                }else{
                    build += "<div class='col-6 pr-0'><span class='prevScore float-right'>" + player2score + "</span>";
                    build += "<span class='name float-right'>" + player2 + "</span></div>";
                    build += "<div class='col-6 pl-0'><span class='prevScore float-left'>" + player1score + "</span>";
                    build += "<span class='name float-left'>" + player1 + "</span></div>";
                    if(parseInt(player2score) > parseInt(player1score)){
                        wins += 1;
                    }else if(parseInt(player1score) > parseInt(player2score)){
                        loss += 1;
                    }else{
                        draw += 1;
                    }
                }
                build += "</div>";
                $("#showAllGames").append(build);
            }
            var overall = "<div id='overallscores'><span>Wins:</span><span class='prevScore'>" + wins + "</span><span>Draws:</span><span class='prevScore'>";
            overall += + draw + "</span><span>Lost:</span><span class='prevScore'>" + loss + "</span></div>";
            $("#overallscores").remove();
            var aft = $("#allusergames").find(".goBackBut").eq(0);
            $(overall).insertAfter(aft);
            $(".screen, .housing").addClass("d-none");
            $("#YourWordsScreen, #allusergames").removeClass("d-none");
            hideBarAndMenu();
            testAnim("#allusergames","slideInUp faster");
            
        }catch(err){
            $("#yourPastGames").find(".fa-spin").remove();
            $("#yourPastGames").removeClass("disabled");
        }
        
    })
    
    //found online users
    socket.on("foundUsers", function(user){
        $("#findOnline").find("i").remove();
        if(user == undefined || user == null || user == "null"){
            showNoty(false, "no user is online now, you can invite a friend to play");
            $(".multBut").removeClass("disabled");
            
        }else{
            $("#theBtnHolders").addClass("d-none");
            $("#playWith").text(user);
            $("#playWithOnline").attr("data-playWith", user);
            $("#playWithOnline").text("Play with " + user);
            $("#playScreen").removeClass("d-none").fadeIn(500);
        }
    })
    
    //search word res
    socket.on("RescheckWord", function(data, prd){
        if(data == false){
            var text = "Clues not found, try another word";
            $("#sendQuestion, #but-clear").removeClass("disabled");
            showNoty(false, text);
        }else{
            if(iscoordinator){
                sendWordCoord(prd);
                return;
            }
            if(ismultigame){
                sendWordMultiple(prd);
                return;
            }
            sendWord(prd);
        }  
    })
    
    //word received coord
    socket.on("receiveWordCoord", function(data){
        $("#synonymsM").empty();
        //$("#synonymsMPar").addClass("d-none");
        var letColors = ["oneCol", "twoCol", "threeCol", "fourCol"];
        var syn = data.syn;
        theWord = data.correct;
        var us = $("#username").val();
        $("#alphass").empty("");
        var shuffledWords = data.shuffled;
        gameButton(shuffledWords);
        $("#alphas").addClass("d-none");
        adjustButton(false);
        $("#alphass").removeClass("d-none");
        updates = 60;
        var sent = parseInt($(".coordSent").text());
        sent += 1;
        $(".coordSent").text(sent);
        //for word sender
        if(us == data.sender){
             var syns = syn.join(",");
            syns = replacewith(syns.toLowerCase(), theWord.toLowerCase());
            //show word one at a time
            var splitSyns = syns.split(",");
            var m = 0;
            for(var c = 0; c < splitSyns.length; c++){
                var ccolor = letColors[m];
                var eachSyns = splitSyns[c];
                var cSysns = "<div class='eachSyn " + ccolor + "'>" + eachSyns.trim() + "</div>";
                m+=1;
                m = m == letColors.length ? 0 : m;
                $("#synonymsM").append(cSysns);
               }
            $("#sendQuestion, #but-clear").addClass("disabled");
            $("#synonymsMPar").removeClass("d-none");
            $("#clueText").text("Sent Clues");
            var timing = $('<div id="timing" class="text-danger">60</div>');
            var meter = $('<div id="outsideBar"><div id="innerBar"></div></div>');
            $("#alphass").append(timing);
            $("#alphass").append(meter);
            readTimerCoord();
            return;
        }
        //for word sender
        
        var timing = $('<div id="timing" class="text-danger">60</div>');
        var meter = $('<div id="outsideBar"><div id="innerBar"></div></div>');
        $("#alphass").append(timing);
        $("#alphass").append(meter);
        
        showNoty(false, "New Word Received");
        testAnim("#theWord", "shake");
        
        var syns = syn.join(",");
        syns = replacewith(syns.toLowerCase(), theWord.toLowerCase());
        //show word one at a time
        var splitSyns = syns.split(",");
        var m = 0;
        for(var c = 0; c < splitSyns.length; c++){
            var ccolor = letColors[m];
            var eachSyns = splitSyns[c];
            var cSysns = "<div class='eachSyn " + ccolor + "'>" + eachSyns.trim() + "</div>";
            m+=1;
            m = m == letColors.length ? 0 : m;
            $("#synonymsM").append(cSysns);
        }
    
        $("#synonymsMPar").removeClass("d-none");
        $("#clueText").text("Possible Clues");

        $("#correctAnswer").val(data.correct);
        updates = 60;
        //var append = $("<div class='word-" + data.correct + " pasts'>" + data.complete + "</div>");
        createWord(data.shuffled);
        
        var clearer = $("<div class='btn btn-danger' id='clearer' onclick='clearAllButtonMult()'>Clear All</div>");
        var last = $("#alphass").find(".btn.alphass").length;
        var lastA = $("#alphass").find(".btn.alphass").eq(last - 1);
        $(clearer).insertAfter(lastA);
        
        activateClickSound();
        
        //$("#prevCont").append(append);
        $("#typer").text("").empty();
        $("#sendQuestion, #but-clear").addClass("d-none");
        //$("#ansQuestion").removeClass("d-none disabled");
        //showNewQuestionTut();
        readTimerCoord();
    })
    
    //word received coord
    socket.on("receiveWordMultiple", function(data){
        $("#synonymsM").empty();
        //$("#synonymsMPar").addClass("d-none");
        var letColors = ["oneCol", "twoCol", "threeCol", "fourCol"];
        var syn = data.syn;
        theWord = data.correct;
        var us = $("#username").val();
        $("#alphass").empty("");
        var shuffledWords = data.shuffled;
        gameButton(shuffledWords);
        $("#alphas").addClass("d-none");
        adjustButton(false);
        $("#alphass").removeClass("d-none");
        updates = 60;
        //for word sender
        if(us == data.sender){
             var syns = syn.join(",");
            syns = replacewith(syns.toLowerCase(), theWord.toLowerCase());
            //show word one at a time
            var splitSyns = syns.split(",");
            var m = 0;
            for(var c = 0; c < splitSyns.length; c++){
                var ccolor = letColors[m];
                var eachSyns = splitSyns[c];
                var cSysns = "<div class='eachSyn " + ccolor + "'>" + eachSyns.trim() + "</div>";
                m+=1;
                m = m == letColors.length ? 0 : m;
                $("#synonymsM").append(cSysns);
               }
            $("#sendQuestion, #but-clear").addClass("disabled");
            $("#synonymsMPar").removeClass("d-none");
            $("#clueText").text("Sent Clues");
            var timing = $('<div id="timing" class="text-danger">60</div>');
            var meter = $('<div id="outsideBar"><div id="innerBar"></div></div>');
            $("#alphass").append(timing);
            $("#alphass").append(meter);
            readTimerMultiple(data.sender);
            return;
        }
        //for word sender
        
        var timing = $('<div id="timing" class="text-danger">60</div>');
        var meter = $('<div id="outsideBar"><div id="innerBar"></div></div>');
        $("#alphass").append(timing);
        $("#alphass").append(meter);
        
        showNoty(false, "New Word Received");
        testAnim("#theWord", "shake");
        
        var syns = syn.join(",");
        syns = replacewith(syns.toLowerCase(), theWord.toLowerCase());
        //show word one at a time
        var splitSyns = syns.split(",");
        var m = 0;
        for(var c = 0; c < splitSyns.length; c++){
            var ccolor = letColors[m];
            var eachSyns = splitSyns[c];
            var cSysns = "<div class='eachSyn " + ccolor + "'>" + eachSyns.trim() + "</div>";
            m+=1;
            m = m == letColors.length ? 0 : m;
            $("#synonymsM").append(cSysns);
        }
    
        $("#synonymsMPar").removeClass("d-none");
        $("#clueText").text("Possible Clues");

        $("#correctAnswer").val(data.correct);
        updates = 60;
        //var append = $("<div class='word-" + data.correct + " pasts'>" + data.complete + "</div>");
        createWord(data.shuffled);
        
        var clearer = $("<div class='btn btn-danger' id='clearer' onclick='clearAllButtonMult()'>Clear All</div>");
        var last = $("#alphass").find(".btn.alphass").length;
        var lastA = $("#alphass").find(".btn.alphass").eq(last - 1);
        $(clearer).insertAfter(lastA);
        
        activateClickSound();
        
        //$("#prevCont").append(append);
        $("#typer").text("").empty();
        $("#sendQuestion, #but-clear").addClass("d-none");
        //$("#ansQuestion").removeClass("d-none disabled");
        //showNewQuestionTut();
        readTimerMultiple(data.sender);
    })
    
    
    //word received
    socket.on("receiveWord", function(data){
        $("#synonymsM").empty();
        //$("#synonymsMPar").addClass("d-none");
        var letColors = ["oneCol", "twoCol", "threeCol", "fourCol"];
        var syn = data.syn;
        theWord = data.correct;
        var us = $("#username").val();
        $("#alphass").empty("");
        var shuffledWords = data.shuffled;
        gameButton(shuffledWords);
        $("#alphas").addClass("d-none");
        adjustButton(false);
        $("#alphass").removeClass("d-none");
        
        //for word sender
        if(us != data.receiver){
             var syns = syn.join(",");
            syns = replacewith(syns.toLowerCase(), theWord.toLowerCase());
            //show word one at a time
            var splitSyns = syns.split(",");
            var m = 0;
            for(var c = 0; c < splitSyns.length; c++){
                var ccolor = letColors[m];
                var eachSyns = splitSyns[c];
                var cSysns = "<div class='eachSyn " + ccolor + "'>" + eachSyns.trim() + "</div>";
                m+=1;
                m = m == letColors.length ? 0 : m;
                $("#synonymsM").append(cSysns);
               }
            $("#sendQuestion, #but-clear").addClass("disabled");
            $("#synonymsMPar").removeClass("d-none");
            $("#clueText").text("Sent Clues");
            return;
        }
        //for word sender
        
        var timing = $('<div id="timing" class="text-danger">60</div>');
        var meter = $('<div id="outsideBar"><div id="innerBar"></div></div>');
        $("#alphass").append(timing);
        $("#alphass").append(meter);
        
        showNoty(false, "New Word Received");
        testAnim("#theWord", "shake");
        
        var syns = syn.join(",");
        syns = replacewith(syns.toLowerCase(), theWord.toLowerCase());
        //show word one at a time
        var splitSyns = syns.split(",");
        var m = 0;
        for(var c = 0; c < splitSyns.length; c++){
            var ccolor = letColors[m];
            var eachSyns = splitSyns[c];
            var cSysns = "<div class='eachSyn " + ccolor + "'>" + eachSyns.trim() + "</div>";
            m+=1;
            m = m == letColors.length ? 0 : m;
            $("#synonymsM").append(cSysns);
        }
    
        $("#synonymsMPar").removeClass("d-none");
        $("#clueText").text("Possible Clues");

        $("#correctAnswer").val(data.correct);
        updates = 60;
        var append = $("<div class='word-" + data.correct + " pasts'>" + data.complete + "</div>");
        createWord(data.shuffled);
        
        var clearer = $("<div class='btn btn-danger' id='clearer' onclick='clearAllButtonMult()'>Clear All</div>");
        var last = $("#alphass").find(".btn.alphass").length;
        var lastA = $("#alphass").find(".btn.alphass").eq(last - 1);
        $(clearer).insertAfter(lastA);
        
        activateClickSound();
        
        $("#prevCont").append(append);
        $("#typer").text("").empty();
        $("#sendQuestion, #but-clear").addClass("d-none");
        //$("#ansQuestion").removeClass("d-none disabled");
        showNewQuestionTut();
        if(has_focus){
            timerOpponent(true);
            readTimer();
        }
    })
    
    //report card
    socket.on("reportCard", function(data){
        clearInterval(interv);
        interv = null;
        updates = 0;
        clearInterval(intervOpponent);
        intervOpponent = null;
        
        $("#synonymsM").empty();
        $("#synonymsMPar").addClass("d-none");
        $("#alphass").addClass("d-none");
        //$("#alphas").removeClass("d-none");
        //adjustButton(true);
        var us = $("#username").val();
        var player1 = $("#player1").text();
        var player2 = $("#player2").text();
        //sender to sender
        if(us == data.sender){
            if(data.correct){
                if(player1 == us){
                    var score = parseInt($("#player1Score").text()); 
                    score += 1;
                    $("#player1Score").text(score);
                }else{
                    var score = parseInt($("#player2Score").text()); 
                    score += 1;
                    $("#player2Score").text(score);
                } 
                
                //give sender coins
                     onlineCoins += 50;
			         localStorage.setItem("onlineCoins", onlineCoins);	
		             $(".getCoins").text(onlineCoins); 
                
            }else{
                //wrong answer
                if(player1 == us){
                    var score = parseInt($("#player2Score").text()); 
                    score += 1;
                    $("#player2Score").text(score);
                }else{
                    var score = parseInt($("#player1Score").text()); 
                    score += 1;
                    $("#player1Score").text(score);
                }
            }
         //sender to receiver   
        }else{
            if(data.correct){
                //opponent got it right
                if(player1 == us){
                    var score = parseInt($("#player2Score").text()); 
                    score += 1;
                    $("#player2Score").text(score);
                }else{
                    var score = parseInt($("#player1Score").text()); 
                    score += 1;
                    $("#player1Score").text(score);
                }
            }else{
                 if(player1 == us){
                    var score = parseInt($("#player1Score").text()); 
                    score += 1;
                    $("#player1Score").text(score);
                }else{
                    var score = parseInt($("#player2Score").text()); 
                    score += 1;
                    $("#player2Score").text(score);
                } 
                
                //give sender coins
                     onlineCoins += 50;
			         localStorage.setItem("onlineCoins", onlineCoins);	
		             $(".getCoins").text(onlineCoins); 
                
            }
            
            //updates server with score
            var updateScore = {};
            updateScore.player1 = $("#player1").text();
            updateScore.player1score = parseInt($("#player1Score").text());
            updateScore.player2 = $("#player2").text();
            updateScore.player2score = parseInt($("#player2Score").text());
            socket.emit("updateScores", updateScore);
            //updates server with score
        }
        var us = $("#username").val();
        if(us == data.sender){
            if(data.correct){
                showNoty(true, "You got it right");
            }else{
                showNoty(false, "You got it wrong");
            }
               $("#sendQuestion, #but-clear").removeClass("d-none disabled");
            //$("#ansQuestion").addClass("d-none");
            setTimeout(function(){
                showNoty(true, "Your turn to send question");
                $("#alphas").removeClass("d-none");
                adjustButton(true);
            },3000)
        }else{

            if(data.correct){
                showNoty(true, data.sender + " got it right");
            }else{
                showNoty(false, data.sender + " got it wrong");
            }
               $("#sendQuestion, #but-clear").addClass("d-none");
            //$("#ansQuestion").removeClass("d-none disabled");
            setTimeout(function(){
                showNoty(true, data.sender + "'s turn to send question");
            },3000)
        }
        var mark;
        if(data.correct){
           mark = $('<i class="fas fa-check text-success ml-3"></i>');
        }else{
            mark = $('<i class="fas fa-times text-danger ml-3"></i>');
        }

        var pos = $(".word-" + data.class).length - 1;
        var txt = $(".word-" + data.class).eq(pos).text();
        txt += " = " + data.correctAnswer + " -> " + data.answer;
        $(".word-" + data.class).eq(pos).text(txt);
        $(".word-" + data.class).eq(pos).append(mark);
        $("#typer").text("").empty();
        $("#theWord").text("");
        animatedBar();
    })
    
    //update usename
    socket.on("usernameUpdatePass", function(data){
        $("#usernameModal").modal("hide");
        setTimeout(function(){
            $(".updateUsername").html("Update");
            $(".updateUsername").attr("disabled", false);
            $("#username").val(data.newName);
            $("#showUsername").text("Hi, " + data.newName);
            showNoty(true, "Name update successful!");
            localStorage.setItem("onlineUsername", data.newName);
        },1000)
        
    })
    
    //invitation rejection
    socket.on("sendRejection", function(data){
        showNoty(false, data.text + ", feel free to search for other users");
        $("#playScreen").hide();
        $("#theBtnHolders").removeClass("d-none");
        $(".multBut, #playWithOnline").removeClass("disabled");
    })
    
    socket.on("invitationSent", function(data){
        showNoty(true, "Invitation sent, waiting for response");
        $("#playWithOnline").addClass("disabled");
    })
    
    //freind invitation sent
    socket.on("roomCreated", function(name){
        //var us = $("#username").val();
        showNoty(true, "Group created, group name is: " + name + " .Send group name to opponent");
    })
    
    //co-ordinator led group created
    socket.on("coordinatorLedCreated", function(room){
        $("#instructorled").find("i").remove();
        $("#participants").removeClass("d-none");
        var us = $("#username").val();
        var line = $("<div class='coordinator'><i class='fas fa-user-circle'></i> Co-ordinator: " + us + " --> <span class='coordSent'>0</span> words sent</div>");
        $(".screen").addClass("d-none");
        $("#gameScreen, #menu, #alphas, #sendQuestion, #but-clear").removeClass("d-none");
        $("#menu").show();
        showNoty(true, "Room created, room name is: " + room);
        $("#playersCont").append(line);
        $("#participants").text($("#participants").text() + " (0)");
        adjustButton(true);
        $("#scoreBoard").parents(".container-fluid").eq(0).addClass("d-none");
        iscoordinator = true;
        iscoordgame = true;
    })
    
    //co-ordinator led group created
    socket.on("multipleplayersCreated", function(room){
        $("#multipleplayers").find("i").remove();
        $("#participants").removeClass("d-none");
        var us = $("#username").val();
        var line = $("<div class='players " + us + "'><i class='far fa-user'></i> " + us + " --> " + 0 + " point(s)</div>");
        $("#playersCont").append(line);
        $(".screen").addClass("d-none");
        $("#gameScreen, #menu, #alphas, #sendQuestion, #but-clear").removeClass("d-none");
        $("#menu").show();
        showNoty(true, "Room created, room name is: " + room);
        
        $("#participants").text($("#participants").text() + " (1)");
        adjustButton(true);
        $("#scoreBoard").parents(".container-fluid").eq(0).addClass("d-none");
        ismultigame = true;
    })
    
    //new member to group game
    socket.on("newmemberofgroup", function(show, data, userb){
        if(show && userb != ""){showNoty(true, userb);}
        $("#playersCont").find(".players").remove();
        var us = $("#username").val();
        for(var each in data){
            //var each = data[i];
                var user = each;
                var score = data[each];
                var line = $("<div class='players " + user + "'><i class='far fa-user'></i> " + user + " --> " + score + " point(s)</div>");           
                $("#playersCont").append(line);   
        }
        $("#participants").text("Show Player List (" + Object.keys(data).length + ")");
        if(show == false && iscoordinator == false && iscoordgame == true){
            clearInterval(interv);
            interv = null;
            $("#synonymsM").empty();
            $("#typer, #theWord").text("");
            $("#alphass").empty();
            showNoty(true, userb + " got it right");
        }
        if(show == false && ismultigame == true){
            clearInterval(interv);
            interv = null;
            $("#synonymsM").empty();
            $("#typer, #theWord").text("");
            $("#alphass").empty();
            showNoty(true, userb + " got it right, " + userb + " is next to send.");
            $("#sendQuestion, #but-clear").removeClass("d-none disabled");
            $("#specButHolder").addClass("d-none");
            if(us == userb){
                showNoty(true, "You got it right. Your turn to send question");
                youarenext(us);
            }
        }
        
        if(show == false && iscoordinator == true && iscoordgame == true){
            clearInterval(interv);
            interv = null;
            $("#alphass").empty();
            $("#synonymsM").empty();
            $("#typer, #theWord").text("");
            showNoty(true, userb + " got it right. Send another question");
            youarenext(us);
        }
        
    })
    
    //new member to group game
    socket.on("prepareGame", function(data){
        $(".screen").addClass("d-none");
        $("#gameScreen, #menu, #participants").removeClass("d-none");
        $("#scoreBoard").parents(".container-fluid").eq(0).addClass("d-none");
        adjustButton(false);
        $("#specButHolder").addClass("d-none");
        $("#menu").show();
        if(data != null){
            $(".coordinator").remove();
            var line = $("<div class='coordinator'><i class='fas fa-user-circle'></i> Co-ordinator: " + data + " --> <span class='coordSent'>0</span> words sent</div>");          $("#playersCont").prepend(line);
            iscoordgame = true;
        }else{
            ismultigame = true;
        }
        
        
        
    })
    
    //user leaves grouup coord game
    socket.on("memberleavesgroup", function(data, length){
        $("#playersCont").find("." + data).remove();
        $("#participants").text("Show Player List (" + length + ")");
        showNoty(false, data + " left room");
    })
    
    //user is playing another game
    socket.on("userCurrentlyPlaying", function(data){
        showNoty(false, data);
    })
    
    //user is playing another game
    socket.on("generic", function(bools,data){
        if(data.indexOf("reconnecting, please wait!") > -1){
            clearInterval(intervOpponent);
            intervOpponent = null;
        }
        showNoty(bools, data);
    })
    
    //timer paused for opponent
    socket.on("opponentTimerRead", function(data){
        if(data.start == false){
            clearInterval(intervOpponent);
            intervOpponent = null;
            showNoty(false, data.sender + " minimized game, Timer paused");
            return;
        }
        var timing; var meter;
        if($("#timing").length == 0){
            timing = $('<div id="timing" class="text-danger">60</div>');
            meter = $('<div id="outsideBar"><div id="innerBar"></div></div>');
            $("#alphass").append(timing);
            $("#alphass").append(meter);
        } 
            showNoty(false, "Timer begins/resumes for " + data.sender);
            updatesOpponent = data.left;
            readTimerOpponent();
    })
    
    //leave room
    socket.on("leaveRoom", function(data){
        goMenu();
        showNoty(false, data);
    })
    
    //leave room
    socket.on("disconnect", function(data){
        //goMenu();
        console.log("disconnecyed");
        //socket.io.reconnect();
        $("#connected").removeClass("bg-secondary").removeClass("bg-success").addClass("bg-danger").removeClass("d-none");
        $("#connected").text("Disconnected");
        showNoty(false, "Network problem, reconnecting");
        if(updatesOpponent > 0){
            clearInterval(intervOpponent);
            //timerOpponent(false);
        }
        if(updates > 0){
            clearInterval(interv);
            //timerOpponent(false);
        }
        /*if(navigator.notification == undefined){
            var con = confirm("Network problem, do you want to reconnect?");
            if(con){
                window.location.reload();
            }
        }else{
            var message = "Network problem, do you want to reconnect?";
           var title = "Unscramble";
           var buttonLabels = ["YES","NO"];
           navigator.notification.confirm(message, reconCallback, title, buttonLabels);

           function reconCallback(buttonIndex) {
              if(buttonIndex == 1){
                  window.location.reload();
              }
           }
        }*/
    })
    
    socket.on("reconnect", function(){
        if(iscoordgame || ismultigame){
            return;
        }
        //console.log("reconnect");
        var data = {};
        var username = $("#username").val();
        data.user = username;
        data.room = groupNameJoined;
        if(groupNameJoined != null){
            var prt = groupNameJoined.replace(username,"");
            data.partner = prt;
        }
        var username = $("#username").val();
        socket.emit("reconnectUser", data);
        //var prt = groupNameJoined.replace(username,"");
        //socket.emit("rejoinGame", groupNameJoined, prt);
    })
    
    socket.on('reconnecting', function(attemptNumber){
        $("#connected").removeClass("bg-danger").removeClass("bg-success").addClass("bg-secondary").removeClass("d-none");
        $("#connected").text("Reconnecting...");
         
    });
    
    socket.on("rejoined", function (data){
        console.log(data);
    })
    
    //reconnecting
   /* socket.on("reconnect", function(data){
        var data = {};
        data.id = socket.id;
        data.groupName = groupNameJoined;
        data.username = $("#username").val();
        socket.emit("reconnectJoinRoom", data);
        //alert("reconnected " + groupNameJoined);
    })*/
    
    //general server error
    socket.on("serverError", function(data){
        alert(data);
        return;
    });
}

function youarenext(userb){
            $("#specButHolder, #sendQuestion, #but-clear").removeClass("d-none disabled");
            $("#alphas").removeClass("d-none");
            adjustButton(true);
}

function animatedBar(){
    var score1 = parseInt($("#player1Score").text());
    var score2 = parseInt($("#player2Score").text());
    var totalScores = score1 + score2;
    var sc1cent = Math.floor(score1/totalScores * 100) + 1;
    var sc2cent = Math.floor(score2/totalScores * 100) + 1;
    $("#player1Score").parents(".borders").eq(0).find(".progress").eq(0).css("width", sc1cent + "%");
    $("#player2Score").parents(".borders").eq(0).find(".progress").eq(0).css("width", sc2cent + "%");
    /*if(sc1cent > sc2cent){
        $("#player1Score").parents(".borders").eq(0).find(".progress-bar").eq(0).removeClass("bg-danger").addClass("bg-success");
        $("#player2Score").parents(".borders").eq(0).find(".progress-bar").eq(0).removeClass("bg-success").addClass("bg-danger");
    }else{
        $("#player2Score").parents(".borders").eq(0).find(".progress-bar").eq(0).removeClass("bg-danger").addClass("bg-success");
        $("#player1Score").parents(".borders").eq(0).find(".progress-bar").eq(0).removeClass("bg-success").addClass("bg-danger");
    }*/
}

function timerOpponent(state){
    var us = $("#username").val();
    var other = $("#player1").text();
    other = other == us ? $("#player2").text() : other;
    var info ={};
    info.sender = us;
    info.receiver = other;
    info.start = state;
    info.left = updates;
    socket.emit("opponentTimer", info);
}

function readTimerOpponent(){

    intervOpponent = setInterval(function(){
        var us = $("#username").val();
    var other = $("#player1").text();
    other = other == us ? $("#player2").text() : other;
                updatesOpponent -= 1;
                if(updatesOpponent <= 0){
                    clearInterval(intervOpponent);
                    intervOpponent = null;
                    $("#timing").text(0);
                    $("#innerBar").animate({width: 0 + "%"});
                    showNoty(false, "Time Up for " + other);
                }else{
                    if(updatesOpponent == 30){
                        $("#innerBar").addClass("bg-danger");
                    }
                    var m = Math.ceil((updatesOpponent/60) * 100);
                    $("#timing").text(updatesOpponent);
                    $("#innerBar").animate({width: m + "%"});
                }
            },1000)
}

function readTimer(){
    interv = setInterval(function(){
                updates -= 1;
                if(updates <= 0){
                    clearInterval(interv);
                    interv = null;
                    $("#timing").text(0);
                    $("#innerBar").animate({width: 0 + "%"});
                    if(allowSound){
                            var audio = $('audio').get(3);
                            audio.pause();
                        }
                    showNoty(false, "Time Up, turn missed");
                    missedQuestion();
                }else{
                    if(updates == 30){
                        $("#innerBar").addClass("bg-danger");
                        if(allowSound){
                            var audio = $('audio').get(3);
                            audio.currentTime=0;
                            audio.play();
                        }
                    }
                    var m = Math.ceil((updates/60) * 100);
                    $("#timing").text(updates);
                    $("#innerBar").animate({width: m + "%"});
                }
            },1000)
}

function readTimerCoord(){
    interv = setInterval(function(){
                updates -= 1;
                if(updates <= 0){
                    clearInterval(interv);
                    interv = null;
                    $("#timing").text(0);
                    $("#innerBar").animate({width: 0 + "%"});
                    $("#alphass").empty();
                    if(iscoordinator){
                        showNoty(false, "No one got it right");
                        $("#sendQuestion, #but-clear").removeClass("d-none disabled");
                        $("#alphas").removeClass("d-none");
                        $("#typer").text("");
                        $("#synonymsM").empty();
                        adjustButton(true);
                    }else{
                        if(allowSound){
                            var audio = $('audio').get(3);
                            audio.pause();
                        }
                        $("#theWord").empty();
                        showNoty(false, "Time Up, point lost");
                    }
                    clearInterval(interv);
                    interv = null;
                    updates = 0;
                    //missedQuestion();
                }else{
                    if(updates == 30){
                        $("#innerBar").addClass("bg-danger");
                        if(allowSound && iscoordinator == false){
                            var audio = $('audio').get(3);
                            audio.currentTime=0;
                            audio.play();
                        }
                    }
                    var m = Math.ceil((updates/60) * 100);
                    $("#timing").text(updates);
                    $("#innerBar").animate({width: m + "%"});
                }
            },1000)
}
var youare1 = "";
function readTimerMultiple(youare){
    youare1 = youare;
    interv = setInterval(function(){
                updates -= 1;
                if(updates <= 0){
                    clearInterval(interv);
                    interv = null;
                    $("#timing").text(0);
                    $("#innerBar").animate({width: 0 + "%"});
                    $("#alphass").empty();
                    clearInterval(interv);
                    interv = null;
                    updates = 0;
                     $("#typer").text("");
                    $("#synonymsM").empty();
                    
                    var us = $("#username").val();
                    if(us == youare1){
                        showNoty(true, "No one got it right. You get to send again");
                        socket.emit("markAnswerAllMiss", us);
                        youarenext(us);
                    }else{
                        showNoty(false, "No one got it right. " + youare1 + " gets to send again");
                    }
                }else{
                    if(updates == 30){
                        $("#innerBar").addClass("bg-danger");
                        /*if(allowSound && iscoordinator == false){
                            var audio = $('audio').get(3);
                            audio.currentTime=0;
                            audio.play();
                        }*/
                    }
                    var m = Math.ceil((updates/60) * 100);
                    $("#timing").text(updates);
                    $("#innerBar").animate({width: m + "%"});
                }
            },1000)
}

function hideBarAndMenu(){
    $("#menu").hide();
}

function returnToButtons(){
    $(".screen").addClass("d-none");
    $("#theBtnHolders").removeClass("d-none");
    $(".multBut").removeClass("disabled");
    testAnim("#theBtnHolders", "slideInLeft");
}

function missedQuestion(){
	//$(".btn.alphass").eq(0).click();
	var span = $("<span>???</span>");
	$("#typer").append(span);
    setTimeout(function(){ sendAnswer();},1500);
   
}

function setUsername(){
    var username = $("#enterUsername").val().trim();
    if(username == ""){
        $("#warning").text("Please enter a username").removeClass("d-none");
        return;
    }else{
        $("#username").val(username);
        socket.emit("createUsername", username);
        //socket.emit("pickUsername", username);
    }
}

function adjustButton(cond){
    var t = $("#keyboardText").height() + 5;
    var p = $("#alphas").height();
    var d = p - t;
    /*d = cond == true ? 0 : (0 - p);
    $("#alphas").animate({
        bottom: d + "px"
    },1500)*/
    if(cond){
        $("#alphas").show();
        testAnim("#alphas", "slideInUp");
    }else{
        $("#alphas").hide();
    }
}

function showShare(){
    if($("#inviteButtons").hasClass("d-none")){
        $("#inviteButtons").removeClass("d-none").fadeIn(1000);
    }else{
        $("#inviteButtons").addClass("d-none");
    }
}

function showJoin(){
    var us = $("#username").val().trim();
    if(us == ""){
        $("#showUsernameModal").click();
        showNoty(false, "Please select username first");
        return;
    }
    if($("#joinPar").hasClass("d-none")){
        $("#joinPar").removeClass("d-none").fadeIn(1000);
    }else{
        $("#joinPar").addClass("d-none");
    }
}

function findOnline(user){
    $.each(usernamesList, function (key, valueObj) {
        if(valueObj.isPlaying == false && key != user){
            user = key;
            return false;
        }
    });
    return user;
}

function playOnline(theUser){
    var us = $("#username").val().trim();
    if(us == ""){
        $("#showUsernameModal").click();
        showNoty(false, "Please select username first");
        return;
    }
    
    var spin = '<i class="fas fa-circle-notch fa-spin ml-1"></i>';
    $("#findOnline").html($("#findOnline").text() + spin);
    $(".multBut").addClass("disabled");
    socket.emit("findOnlineUsers", theUser);
}

function playUser() {
	if ($("#playWithOnline").hasClass("disabled")) {
		return;
	}
    var opponent = $("#playWithOnline").attr("data-playWith");
    socket.emit("inviteUser", opponent);
}

function testUser(){
    var test = "test";
    socket.emit("inviteUser", test);
}

function acceptInvitation(){
    var user = $("#invitationFrom").text();
    socket.emit("acceptInvitation", user);
}

var alphas = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

function gameButton(letters){
    var splitted = letters.split("");
    for(var i =0; i < splitted.length; i++){
    var letter = splitted[i];
    var letBut = $('<div class="btn alphass" data-but="' + letter + '" data-pos="' + i + '">' + letter + '</div>');
    $(letBut).on("click", function () {
    	if ($('#sendQuestion').hasClass('disabled') && $('#sendQuestion').is(':visible')) {
    		return;
    	}
    	var t = $(this).data("but");
    	butClickSound();
    	if ($(this).hasClass("clicked")) {
    		var pos = $(this).data("pos");
    		var del = $('*[data-posc="' + pos + '"]');
    		$(del).remove();
    		$(this).removeClass("clicked");

    	} else {
    		$(this).addClass("clicked");
    		//var len = $("#yourWord").text().split("").length;
    		//$(this).attr("data-pos", i);
    		var posc = $(this).data("pos");
    		var span = $("<span data-posC='" + posc + "'>" + t + "</span>");
    		$("#typer").append(span);
    	}
        var userGuess = $("#typer span").text();
        if(userGuess.length == theWord.length){
            if(userGuess != theWord){
                $("#typer span").addClass("blink_me");
                setTimeout(function(){
                    $("#typer span").removeClass("blink_me");                                                            
                },1000)
            }else{
                if(iscoordgame){
                    sendAnswerCoord();
                    return;
                }
                if(ismultigame){
                    sendAnswerMultiple();
                    return;
                }
                sendAnswer();
            }
        }
    	/*var typed = $("#typer").val();
    	if (typed.length == 7) {
    		testAnim(".warn", "shake");
    		return;
    	}
    	typed += t;
    	$("#typer").val(typed);*/
    })
        $("#alphass").append(letBut);
    }
}

function fillAlphas(){
    for(var i = 0; i < alphas.length; i++){
        var letter = alphas[i];
        var letBut = $('<div class="btn alphass" id="but-' + letter + '" data-but="' + letter + '" data-pos="' + i + '">' + letter + '</div>');
        $(letBut).on("click", function(){
            if($('#sendQuestion').hasClass('disabled')){
                return;
            }
            var t = $(this).data("but");
            butClickSound();
            var typed = $("#typer").text();
            if(typed.length == 8){
                testAnim(".warn", "shake");
                return;
            }
            typed += t;
            $("#typer").text(typed);
        })
        $("#alphas").append(letBut);
    }
        var clearBut = $('<div class="btn btn-danger specBut" id="but-clear"><i class="fas fa-backspace"></i>  Clear</div>');
        $(clearBut).on("click", function(){
            if($(this).hasClass("disabled")){
                return;
            }
            var t = $("#typer").text();
            var text = t.substr(0, t.length - 1);
            $("#typer").text(text);
        })
        $("#specButHolder").append(clearBut);
    
    //add two buttons
        var send = $('<div id="sendQuestion" class="btn btn-success specBut d-none" onclick="checkWord()">Send Question</div>');
        //var ans =  $('<div id="ansQuestion" class="btn specBut btn-dark" onclick="sendAnswer()">Answer Question</div>');
        $("#specButHolder").append(send);
        //$("#specButHolder").append(ans);
}

function prevCont(){
    var top1 = $("#prevWords").offset().top;
    var hgt = $("#prevWords").height() * 1.5;
    top1 += hgt;
    $(".hiddenCont").css("top", top1 + "px");
    $("#prevCont").slideToggle("slow", function(){
        if($("#prevCont").css("display") == "block"){
            $("#prevWords").text("Hide Previous words");
            $("#prevWords").removeClass("btn-primary").addClass("btn-danger");
        }else{
            $("#prevWords").removeClass("btn-danger").addClass("btn-primary");
            $("#prevWords").text("Show Previous words");
        }
    });
}

function showParticipants(){
    var top1 = $("#participants").offset().top;
    var hgt = $("#participants").height() * 1.5;
    top1 += hgt;
    $(".hiddenCont").css("top", top1 + "px");
    $("#playersCont").slideToggle("slow", function(){
        if($("#playersCont").css("display") == "block"){
            var text = $("#participants").text().replace("Show", "Hide");
            $("#participants").text(text);
            $("#participants").removeClass("btn-primary").addClass("btn-danger");
        }else{
            $("#participants").removeClass("btn-danger").addClass("btn-primary");
            var text = $("#participants").text().replace("Hide", "Show");
            $("#participants").text(text);
        }
    });
}

function textShuffle(){
    var text = $("#theWord").text();
    if(text.length == 0){
        return;
    }
    var t = shuffle(text.split(""));
    t = t.join("");
    $("#theWord").text(t);
}

var showNotyTimer;
function showNoty(type, word){
    if(type){
       $(".noty").removeClass("bg-danger").addClass("bg-success");
    }else{
        $(".noty").removeClass("bg-success").addClass("bg-danger");
    }
     $(".notyInner").text(word);   

    if($(".noty").is(":visible")){
        clearTimeout(showNotyTimer);
        $(".noty").hide();
         
    }
    $(".noty").fadeIn(1000);
    //testAnim(".noty","zoomIn");
    
    showNotyTimer = setTimeout(function(){
        //testAnim(".noty", "zoomOut");
        $(".noty").fadeOut(1000);
    },3000);
    if(phoneGap == true && has_focus == false){
        cordova.plugins.notification.local.schedule({
			id: 3,
			title: "Unscramble",
			text: word,
			foreground: true
		});
    }else{
        if(allowSound){
            var audio = $('audio').get(4);
            audio.currentTime=0;
            audio.play();
        }
    }
}

function checkWord(){
    var wordSearch = $("#typer").text();
    if(wordSearch.trim().length < 3){
        showNoty(false, "3 letter word minimum");
        return;
    }
    var num = $("#prevCont").find(".word-" + wordSearch).length;
    if(num > 0){
        showNoty(false, "Word asked before, ask another");
        return;
    }
    $("#sendQuestion, #but-clear").addClass("disabled");
    socket.emit("checkWord", wordSearch);
}

function goHome2(){
    /*if($("#gameScreen").is(":visible")){
    if(navigator.notification == undefined){
            var conf = confirm("This will close any game that you might be playing, do you wish to proceed?");
            if(conf){
                window.location.href = "index.html?nosplash";
            }
        }else{
            var message = "This will close any game that you might be playing, do you wish to proceed?";
           var title = "Unscramble";
           var buttonLabels = ["YES","NO"];
           navigator.notification.confirm(message, homeCallback, title, buttonLabels);

           function homeCallback(buttonIndex) {
              if(buttonIndex == 1){
                  window.location.href = "index.html?nosplash";
              }
           }
        }
    }else{
        window.location.href = "index.html?nosplash";
    }*/
    onBackKeyDown3();
}

function sendWord(syn){
    var wordSearch = $("#typer").text();
    var shuff = shuffle(wordSearch.split(""));
    shuff = shuff.join("");
    
    if(shuff == wordSearch){
        sendWord(syn);
        return;
    }
    var us = $("#username").val();
    var fin = us + " : " + wordSearch;
    var append = $("<div class='word-" + wordSearch + " pasts'>" + fin + "</div>");
    $("#prevCont").append(append);
    var other = $("#player1").text();
    other = other == us ? $("#player2").text() : other;
    var info = {};
    info.sender = us;
    info.receiver = other;
    info.correct = wordSearch;
    info.shuffled = shuff;
    info.complete = us + " : " + shuff;
    info.syn = syn;
    $("#correctAnswer").val("");
    showNoty(true, "Word Sent");
    $("#typer").text(shuff);
    $("#sendQuestion, #but-clear").addClass("disabled");
    socket.emit("sendWord", info);
}

function sendWordCoord(syn){
    var wordSearch = $("#typer").text();
    var shuff = shuffle(wordSearch.split(""));
    shuff = shuff.join("");
    
    if(shuff == wordSearch){
        sendWordCoord(syn);
        return;
    }
    var us = $("#username").val();
    var fin = us + " : " + wordSearch;
    var append = $("<div class='word-" + wordSearch + " pasts'>" + fin + "</div>");
    $("#prevCont").append(append);
    var info = {};
    info.sender = us;
    info.correct = wordSearch;
    info.shuffled = shuff;
    info.syn = syn;
    $("#correctAnswer").val("");
    showNoty(true, "Word Sent");
    $("#typer").text(shuff);
    $("#sendQuestion, #but-clear").addClass("disabled");
    socket.emit("sendWordCoord", info);
}

function sendWordMultiple(syn){
    var wordSearch = $("#typer").text();
    var shuff = shuffle(wordSearch.split(""));
    shuff = shuff.join("");
    
    if(shuff == wordSearch){
        sendWordMultiple(syn);
        return;
    }
    var us = $("#username").val();
    var fin = us + " : " + wordSearch;
    var append = $("<div class='word-" + wordSearch + " pasts'>" + fin + "</div>");
    $("#prevCont").append(append);
    var info = {};
    info.sender = us;
    info.correct = wordSearch;
    info.shuffled = shuff;
    info.syn = syn;
    $("#correctAnswer").val("");
    showNoty(true, "Word Sent");
    $("#typer").text(shuff);
    $("#sendQuestion, #but-clear").addClass("disabled");
    socket.emit("sendWordMultiple", info);
}

function sendAnswerCoord(){
     var us = $("#username").val();   
     socket.emit("markAnswerCoord", us);
}

function sendAnswerMultiple(){
     var us = $("#username").val();   
     socket.emit("markAnswerCoord", us);
}

function sendAnswer(){
    if(allowSound){
        var audio = $('audio').get(3);
        audio.pause();
    }
    
    if($("#theWord").text().trim().length == 0){
        showNoty(false, "Wait for word");
        return;
    }
    var wordSearch = $("#typer span").text();
    if(wordSearch.trim() == ""){
         showNoty(false, "Make an attempt");
        return;
    }
    clearInterval(interv);
    interv = null;
    updates = 0;
    var us = $("#username").val();
    var other = $("#player1").text();
    other = other == us ? $("#player2").text() : other;
    var ans = $("#correctAnswer").val();
    var info = {};
    info.sender = us;
    info.class = ans;
    info.answer = wordSearch;
    info.correctAnswer = ans;
    info.receiver = other;
    if(ans.toLowerCase() == wordSearch.trim().toLowerCase()){
        //showNoty(true, "Correct Answer");
        info.correct = true;
    }else{
        //showNoty(false, "Wrong Answer");
        info.correct = false;
    }
    socket.emit("markAnswer", info);
}

function rejectInvitation(){
    var user = $("#invitationFrom").text();
    var text = $("#username").val() + " rejected your invitation";
    var info = {};
    info.user = user;
    info.text = text;
    socket.emit("rejectInvitation", info);
}

function inviteFriend(){
    var us = $("#username").val().trim();
    if(us == ""){
        $("#showUsernameModal").click();
        showNoty(false, "Please select username first");
        return;
    }
    socket.emit("inviteFriend", us);
}

//create instructor led group
function createcoorindatorled(){
    var us = $("#username").val().trim();
    if(us == ""){
        $("#showUsernameModal").click();
        showNoty(false, "Please select username first");
        return;
    }
    var spin = '<i class="fas fa-circle-notch fa-spin ml-1"></i>';
    $("#instructorled").html($("#instructorled").text() + spin);
    socket.emit("createcoordinatorgroup", us);
}

//create instructor led group
function createmultipleplayer(){
    var us = $("#username").val().trim();
    if(us == ""){
        $("#showUsernameModal").click();
        showNoty(false, "Please select username first");
        return;
    }
    var spin = '<i class="fas fa-circle-notch fa-spin ml-1"></i>';
    $("#multipleplayers").html($("#multipleplayers").text() + spin);
    socket.emit("createmultipleplayergroup", us);
}

function acceptFriendInvitation(){
    var us = $("#username").val().trim();
    if(us == ""){
        $("#showUsernameModal").click();
        showNoty(false, "Please select username first");
        return;
    }
    var grp = $("#groupName").val().trim();
    if(grp.trim() == ""){
        showNoty(false, "Please enter group name");
        return;
    }
    if(grp.indexOf("_cled") > -1){
       socket.emit("joincoordinatorgroup", grp);
        return;
    }
    if(grp.indexOf("_mult") > -1){
       socket.emit("joinmultiplayergroup", grp);
        return;
    }
    socket.emit("acceptFriendInvitation", grp);
}

function goMenu(){
    //$("#playScreen, #gameScreen").addClass("d-none");
    $(".screen").addClass("d-none");
        $("#theBtnHolders").removeClass("d-none");
        $(".multBut, #playWithOnline, #sendQuestion, #but-clear").removeClass("disabled");
        $("#synonymsM").empty();
        groupNameJoined = null;
        $("#synonymsMPar, #menu").addClass("d-none");
        $("#alphass").empty().addClass("d-none");
        $("#connected").removeClass("d-none");
        clearInterval(interv);
        interv = null;
        clearInterval(intervOpponent);
        intervOpponent = null;
        updates = 0;
}

function deleteRoom(){
    if($("#gameScreen").is(":visible")){
        if(navigator.notification == undefined){
                var conf = confirm("This will close any game that you might be playing, do you want to proceed?");
                var msg = false;
                if(conf){
                    if((iscoordinator) || (iscoordgame == false && ismultigame == false) || (ismultigame && ($(".players").length <= 1))){
                        socket.emit("deleteRoom", "");
                        showNoty(false, "You left room and it has been closed");
                    }
                    if(iscoordinator == false && iscoordgame){
                        iscoordgame = false;
                        ismultigame = false;                     
                        isClosed = true;
                        socket.emit("leaveRoomCoord", "");
                        showNoty(false, "You left room");
                    }
                    if(ismultigame && ($(".players").length > 1)){
                        ismultigame = false;
                        isClosed = true;
                        socket.emit("leaveRoomCoord", "");
                        showNoty(false, "You left room");
                    }
                    $("#participants").addClass("d-none");
                    goMenu();

                } 
            }else{
                var message = "This will close any game that you might be playing, do you want to proceed?";
               var title = "Unscramble";
               var buttonLabels = ["YES","NO"];
               navigator.notification.confirm(message, deleteCallback, title, buttonLabels);

               function deleteCallback(buttonIndex) {
                  if(buttonIndex == 1){
                      if((iscoordinator) || (iscoordgame == false && ismultigame == false) || (ismultigame && ($(".players").length <= 1))){
                        socket.emit("deleteRoom", "");
                        showNoty(false, "You left room and it has been closed");
                    }
                    if(iscoordinator == false && iscoordgame){
                        iscoordgame = false;
                        ismultigame = false;
                        isClosed = true;
                        socket.emit("leaveRoomCoord", "");
                        showNoty(false, "You left room");
                    }
                    if(ismultigame && ($(".players").length > 1)){
                        ismultigame = false;
                        isClosed = true;
                        socket.emit("leaveRoomCoord", "");
                        showNoty(false, "You left room");
                    }
                    $("#participants").addClass("d-none");
                    goMenu();
                }
            }
        }
    }else{
        goMenu();
    }
}

function socialLink(type, url, group){
    inviteFriend();
    var text = 'Let us play the unscramble game together, I have created a group for us. Join me... ';
    text += 'If link does not work, join me with group name: ' + group;
    if(type == "fb"){
        window.plugins.socialsharing.shareViaFacebook(text, null, url, function() {showNoty(true, 'Invitation sent, wait for friend')}, function(errormsg){showNoty(false, "An error occured")});
    }else if(type == "ig"){
        window.plugins.socialsharing.shareViaInstagram(text, null, url, function() {showNoty(true, 'Invitation sent, wait for friend')}, function(errormsg){showNoty(false, "An error occured")});
    }else if(type == "whatsapp"){
        window.plugins.socialsharing.shareViaWhatsApp(text, null, url, function() {showNoty(true, 'Invitation sent, wait for friend')}, function(errormsg){showNoty(false, "An error occured")});
    }else if(type == "twitter"){
        window.plugins.socialsharing.shareViaTwitter(text, null, url, function() {showNoty(true, 'Invitation sent, wait for friend')}, function(errormsg){showNoty(false, "An error occured")});
    }else if(type == "sms"){
        var txt = text + " " + url;
        window.plugins.socialsharing.shareViaSMS(txt, null /* see the note below */, function() {showNoty(true, 'Invitation sent, wait for friend')}, function(errormsg){showNoty(false, "An error occured")});
    }
    
}

function handleOpenURL(url) {
  setTimeout(function() {
    var p = url.indexOf("=");
      var groupName = url.slice(p + 1);
      socket.emit("acceptFriendInvitation", groupName);
  }, 0);
}

function playGroupName(){
        var p = url.indexOf("=");
      var groupName = url.slice(p + 1);
      socket.emit("acceptFriendInvitation", groupName);
}

function changeUsername(){
    var us = $("#username").val().trim();
    if(us == ""){
        $("#showUsernameModal").click();
        showNoty(false, "Please select username first");
        return;
    }
    if($("#gameScreen").is(":visible")){
        toggleSettings();
        setTimeout(function(){
            showNoty(false, "You can't change name in middle of a game. Thanks");
        },1000)
        return;
    }else{
        toggleSettings();
        setTimeout(function(){
            $("#usernameModal").modal("show");
        },1000)
        
    }
}

function updateUsername(){
    var username = $("#enterUsername").val().trim();
    var curName = $("#username").val().trim();
    if(username == ""){
        $("#warning").text("Please enter a username").removeClass("d-none");
        return;
    }
    if(username == curName){
        $("#warning").text("Username hasn't changed, please enter a new username").removeClass("d-none");
        return;
    }
    var spin = '<i class="fas fa-circle-notch fa-spin ml-1"></i>';
    $(".updateUsername").html($(".updateUsername").text() + spin);
    $(".updateUsername").attr("disabled", "disabled");
    
    var info = {};
    info.oldName = curName;
    info.newName = username;
    socket.emit("updateUsername", info);
        //socket.emit("pickUsername", username);
    
}

function getAllSentWords(){
    var us = $("#username").val().trim();
    if(us == ""){
        $("#showUsernameModal").click();
        showNoty(false, "Please select username first");
        return;
    }
    var spin = '<i class="fas fa-circle-notch fa-spin ml-1"></i>';
    $("#yourSentWords").html($("#yourSentWords").text() + spin);
    $("#yourSentWords").addClass("disabled");
    socket.emit("allSentWords", null);
}

function getAllScores(){
    var us = $("#username").val().trim();
    if(us == ""){
        $("#showUsernameModal").click();
        showNoty(false, "Please select username first");
        return;
    }
    var spin = '<i class="fas fa-circle-notch fa-spin ml-1"></i>';
    $("#yourPastGames").html($("#yourPastGames").text() + spin);
    $("#yourPastGames").addClass("disabled");
    socket.emit("allGameScores", null);
}

function onlineClue(){
    //var coin = onlineCoins;
    var w = $("#theWord span").text();
    if(w.trim() == ""){
        return;
    }
    if(onlineCoins < 50){
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
    onlineCoins -= 50;
    $(".getCoins").text(onlineCoins);
    localStorage.setItem("onlineCoins", onlineCoins);
    
    var helpAvail = false;
    var help = false;
    var correctAnswer = theWord.split("");
    var userWrongAnswer = $("#typer span").text();
    var userAnswer = $("#typer span").text().split("");
    if(userWrongAnswer == ""){
        var first = theWord.split("")[0];
        $('*[data-but="' + first + '"]').eq(0).click();
        return;
    }
    //empty and remove clicked
    $("#typer").empty();
    $("#alphass .clicked").removeClass("clicked");
    
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

function showGroupRoom(){
    $(".screen, .housing").addClass("d-none");
    $("#YourWordsScreen, #creategroupgames").removeClass("d-none");
    //$("#creategroupgames").removeClass("d-none");
    hideBarAndMenu();
    testAnim("#creategroupgames","slideInUp faster");
}