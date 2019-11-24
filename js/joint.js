String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

function getParam(param){
    var urlParams = new URLSearchParams(window.location.search);
    var myParam = urlParams.get(param);
    return myParam;
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }

function shuffle(a) {
    var inc = a.join("");
    var j, x, i, b;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function testAnim(e,x) {
    $(e).addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
      $(this).removeClass(x + ' animated');
    });
  };

function createWord(wordSplit){
    $("#theWord").empty();
    var text = wordSplit.split("");
    for(var i = 0; i < text.length; i++){
        var span = "<span class='cong2'>" + text[i] + "</span";
        $("#theWord").append(span);
    }
    anime({
        targets: '.cong2',
        opacity: 1,
        delay: anime.stagger(150)
    });  
}

function shuffling(){
    var text = $("#theWord .cong2").text();
    if(text == ""){
        return;
    }
    var fin = shuffle(text.split(""));
    fin = fin.join("");
    if(fin == text || fin == theWord){
        shuffling();
        return;
    }
    //$("#theWord").text(fin);
    $("#theWord").empty();
    createWord(fin);
}

function onPauseTrigger2() {
    // Handle the pause event
     $('audio').each(function(){
        this.pause(); // Stop playing
        this.currentTime = 0; // Reset time
    }); 
}



function goHome(){
    window.location.href = "index.html?nosplash";
}

var darktheme, skipPassed, allowSound;
$("document").ready(function () {
	document.addEventListener("pause", onPauseTrigger2, false);
    
    $("#checkLight").on("change", function(){
        var showLight = $("#checkLight").is(":checked");
        switchTheme(showLight);
    })
    
    darktheme = localStorage.getItem("darktheme");
    if(darktheme == undefined || darktheme == null){
        switchTheme(false);
        localStorage.setItem("darktheme", "false");
        $('#checkLight').prop('checked', false);
    }else{
        darktheme = darktheme == "true" ? true : false;
        switchTheme(darktheme);
        if(darktheme){
           $('#checkLight').prop('checked', true); 
        }else{
            $('#checkLight').prop('checked', false);
        }  
    }
    //switchTheme(false);
    
    skipPassed = localStorage.getItem("skipPassed");
    if(skipPassed == undefined || skipPassed == null){
        localStorage.setItem("skipPassed", "true");
        $('#checkPassed').prop('checked', true);
    }else{
        skipPassed = skipPassed == "true" ? true : false;
        if(skipPassed){
           $('#checkPassed').prop('checked', true); 
        }else{
            $('#checkPassed').prop('checked', false);
        }  
    }
    
    allowSound = localStorage.getItem("allowSound");
    if(allowSound == undefined || allowSound == null){
        localStorage.setItem("allowSound", "false");
        $('#checkSound').prop('checked', false);
    }else{
        allowSound = allowSound == "true" ? true : false;
        if(allowSound){
           $('#checkSound').prop('checked', true); 
        }else{
            $('#checkSound').prop('checked', false);
        }  
    }
    
    $("#checkSound").on("change", function(e){
        allowSound = $("#checkSound").is(":checked");
        localStorage.setItem("allowSound", allowSound);
        if(allowSound == false){
            $('audio').each(function(){
                this.pause(); // Stop playing
                this.currentTime = 0; // Reset time
            }); 
        }
    })
    
    $("#checkPassed").on("change", function(e){
        skipPassed = $("#checkPassed").is(":checked");
        localStorage.setItem("skipPassed", skipPassed);
    })
    
    $(window).on("click", function(e){

        if((parseInt($("#settingsPage").css("left").replace("px")) == 0) && ($("#settingsPage").is(":visible"))){
                var elem = e.target;
            if($(elem).parents("#settingsPage").length < 1){
                toggleSettings();
                }     
           }
    })
    
    activateClickSound();
})

function activateClickSound(){
    $(".btn, .switch, .fas, #closeSettings").on("click", function(e){
        if($(this).hasClass("fa-coins")){
            return;
        }
        butClickSound();
    })
}

function butClickSound(){
    if(allowSound){
                var audio = $('audio').get(2);
                audio.currentTime=0
                audio.play();
        
        //var audio = [new Audio("sounds/click.mp3"),new Audio("sounds/click.mp3")]; //,new Audio("sounds/click.mp3")];
        //var soundNb = 0;
        //audio[soundNb++ % audio.length].play();
    }
}

function clearAllButton(){
    $("#yourWord").empty();
    $("#buttons").find(".clicked").removeClass("clicked");
}

function clearAllButtonMult(){
   $("#typer").empty();
    $("#alphass").find(".clicked").removeClass("clicked"); 
}

function nextUnique(){
    currLevel += 1;
    var scrs = JSON.parse(localStorage.getItem("scores"));
    var scr = scrs[currNum].split(",");
    if(scr.indexOf(currLevel.toString()) == -1){
        return currLevel;
    }else{
        nextUnique();
        return;
    }
}

function prevUnique(){
    currLevel -= 1;
    var scrs = JSON.parse(localStorage.getItem("scores"));
    var scr = scrs[currNum].split(",");
    if(scr.indexOf(currLevel.toString()) == -1 || currLevel == 0){
        return currLevel;
    }else{
        prevUnique();
        return;
    }
}


function toggleSettings(){
    var w = $("#settingsPage").width();
    if(!$("#settingsPage").is(":visible")){
        $("#settingsPage").css("left",(0 - w - 20) + "px");
        $("#settingsPage").show();
        
    }
        
    if(parseInt($("#settingsPage").css("left").replace("px")) == 0){
        $("#settingsPage").animate({left:(0 - w - 20) + "px"},350);
    }else{
        $("#settingsPage").animate({left: "0px"},350);
    }
}

function switchTheme(dark){
    if(dark){
        $("body").addClass("darkTheme");
       /*$("body, .modal-content").addClass("darkBack");
        $("#logoHead, .corrText, .sentText").addClass("whiteText");
        $(".eachRowIns").addClass("greyBack");*/
    }else{
        $("body").removeClass("darkTheme");
        /*$("body, .modal-content").removeClass("darkBack");
        $("#logoHead, .corrText, .sentText").removeClass("whiteText")
        $(".eachRowIns").removeClass("greyBack");*/
    }
    localStorage.setItem("darktheme", dark);
}

function generateTourGame(){
   if($("#settingsPage").is(":visible")){
       toggleSettings();
   }

      var driver = new Driver({
      	allowClose: false
      });
// Define the steps for introduction
      driver.defineSteps([
 {
 	element: '#menuBar',
 	popover: {
 		title: 'Menu and Home',
 		description: 'Use above buttons to open settings and go to homepage respectively',
 		position: 'bottom-left'
 	}
 },
 /*{
 	element: '.theCoins',
 	popover: {
 		title: 'Coins',
 		description: 'You earn 10 coins<br>for each question passed',
 		position: 'bottom-right'
 	}
 },*/
           {
    	element: '.theLetters',
    	popover: {
    		title: 'Level Switch',
    		description: 'You can change levels<br>i.e. number of letters<br>by using - and + buttons',
    		position: 'bottom-center'
    	}
    },
{
  	element: '#theWord',
  	popover: {
  		title: 'Unscramble',
  		description: 'This is the word you want to unscramble',
  		position: 'bottom-center'
  	}
  },
 {
  	element: '#synonyms',
  	popover: {
  		title: 'Synonyms',
  		description: 'Above are possible synonyms to give you a clue of the word',
  		position: 'bottom-center'
  	}
  },
/*{
 	element: '#shuff',
 	popover: {
 		title: 'Shuffle',
 		description: 'Use the button below to shuffle the scrambled word',
 		position: 'top-center'
 	}
 },
 {
 	element: '#prev',
 	popover: {
 		title: 'Previous',
 		description: 'Use the button below to<br>navigate to previous word',
 		position: 'top-left'
 	}
 },  
{
 	element: '#next',
 	popover: {
 		title: 'Next',
 		description: 'Use the button below to<br>navigate to next word',
 		position: 'top-center'
 	}
 },*/
{
 	element: '.theControlsChild',
 	popover: {
 		title: 'Prev, Shuffle, Next',
 		description: 'Go to previous word<br>Shuffle the scrambled word<br>Go to next word',
 		position: 'top-center'
 	}
 },
    {
    	element: '#but-0',
    	popover: {
    		title: 'Type',
    		description: 'Use buttons below to type your answer',
    		position: 'top-left'
    	},
    	onNext: function (Element) {
    		//toggleSettings();
    		if ($("#but-0").hasClass("clicked") == false) {
    			$("#but-0").click();
			}
    	}
    },
  {
  	element: '#yourWord',
  	popover: {
  		title: 'Your answer',
  		description: 'Your answer appears here',
  		position: 'top-center'
  	}
  },
  {
  	element: '#but-0',
  	popover: {
  		title: 'Clear',
  		description: 'Click again to remove typed character',
  		position: 'top-left'
  	},
  	onNext: function (Element) {
  			//toggleSettings();
  			if ($("#but-0").hasClass("clicked")) {
  				$("#but-0").click();
  			}
  		}
  	},
	  /*{
	  	element: '#yourWord',
	  	popover: {
	  		title: 'Gone',
	  		description: 'Typed character is erased',
	  		position: 'top-center'
	  	}
	  },*/
    {
    	element: '.butCentHelp',
    	popover: {
    		title: 'Help',
    		description: 'Use the button on the right <br> to reveal a letter.<br>Costs 50 coins',
    		position: 'left'
    	}
    }

]);
// Start the introduction
driver.start();
}

function generateTourHome(){
   if($("#settingsPage").is(":visible")){
       toggleSettings();
   }
    
    var driver = new Driver({
		allowClose: false
	});
// Define the steps for introduction
driver.defineSteps([
	{
    element: '#menuBar',
    popover: {
      title: 'Menu',
      description: 'Use above button to view settings for the game',
      position: 'bottom-left'
    }
  },
  /*{
    element: '#coinNew',
    popover: {
      title: 'Coins',
      description: 'You earn 10 coins<br>for each question passed',
      position: 'bottom-right'
    },
  	onNext: function (Element) {
  			//$("#settingsPage").css({"left":"0px","display":"block"})
  		}
  },*/
  {
    element: '.numbs',
    popover: {
      title: 'Number of letters',
      description: 'This shows the number of letters<br>for all the questions in this level',
      position: 'right'
    }
  },
    {
    element: '.myProg',
    popover: {
      title: 'Progress',
      description: 'This is a progress bar that shows<br>how far you have gone for this level',
      position: 'bottom'
    }
  },
    {
    element: '.myBut',
    popover: {
      title: 'Play',
      description: 'Use above button to start game for each level',
      position: 'bottom-right'
    },onNext:function(Element){
          //toggleSettings();
		  $(".myBut").eq(0).click();
      }
  }
]);
// Start the introduction
driver.start();
}

function generateTourMultiplayerSender(){
    var shownMultiTut = localStorage.getItem("shownMultiTut");
    if(shownMultiTut == undefined){
        localStorage.setItem("shownMultiTut", 1);
    }else{
        return;
    }
    
   if($("#settingsPage").is(":visible")){
       toggleSettings();
   }
    
    var driver = new Driver({
		allowClose: false
	});
// Define the steps for introduction
driver.defineSteps([
	{
    element: '#boardSpans',
    popover: {
      title: 'Scoreboard',
      description: 'Above is your scores',
      position: 'bottom-center'
    }
  },
  {
    element: '#alphas',
    popover: {
      title: 'Butttons to type',
      description: 'Use these buttons to type a question<br>that you want to send<br>The game will scramble the word for you.',
      position: 'top-center'
    }
  },
    {
    element: '#sendQuestion',
    popover: {
      title: 'Send question',
      description: 'Use this button to send your typed question',
      position: 'top-right'
    }
  },
    {
    element: '#theWord',
    popover: {
      title: 'New question',
      description: "Your opponent's question will appear here",
      position: 'bottom-center'
    }
  },
    {
    element: '#shuffler',
    popover: {
      title: 'Shuffle',
      description: 'Use this button to shuffle the question',
      position: 'bottom-right'
    }
  },
    {
    element: '.butCentHelp ',
    popover: {
      title: 'Need help',
      description: 'Use this button to reveal a letter<br>costs 50 coins',
      position: 'bottom-right'
    }
  },
    {
    element: '#prevWords',
    popover: {
      title: 'Previous words',
      description: 'Use this to show and hide previous<br>words sent in the current game',
      position: 'bottom-center'
    }
  }
]);
// Start the introduction
driver.start();
}

function generateTourMultiplayerReceiver(){
    var shownMultiTut = localStorage.getItem("shownMultiTut");
    if(shownMultiTut == undefined){
        localStorage.setItem("shownMultiTut", 1);
    }else{
        return;
    }
    
   if($("#settingsPage").is(":visible")){
       toggleSettings();
   }
    
    var driver = new Driver({
		allowClose: false
	});
// Define the steps for introduction
driver.defineSteps([
	{
    element: '#boardSpans',
    popover: {
      title: 'Scoreboard',
      description: 'Above is your scores',
      position: 'bottom-center'
    }
  },
 /* {
    element: '#alphas',
    popover: {
      title: 'Butttons to type',
      description: 'Use these buttons to type a question<br>that you want to send<br>The game will scramble the word for you.',
      position: 'top-center'
    }
  },*/
    {
    element: '#theWord',
    popover: {
      title: 'New question',
      description: "Your opponent's question will appear here",
      position: 'bottom-center'
    }
  },
    {
    element: '#shuffler',
    popover: {
      title: 'Shuffle',
      description: 'Use this button to shuffle the question',
      position: 'bottom-right'
    }
  },
    {
    element: '.butCentHelp ',
    popover: {
      title: 'Need help',
      description: 'Use this button to reveal a letter<br>costs 50 coins',
      position: 'bottom-right'
    }
  },
    {
    element: '#prevWords',
    popover: {
      title: 'Previous words',
      description: 'Use this to show and hide previous<br>words sent in the current game',
      position: 'bottom-center'
    }
  }
]);
// Start the introduction
driver.start();
}

function showNewQuestionTut(){
    var shownMultiTut = localStorage.getItem("shownMultiTut2");
    if(shownMultiTut == undefined){
        localStorage.setItem("shownMultiTut2", 1);
    }else{
        return;
    }
    
   if($("#settingsPage").is(":visible")){
       toggleSettings();
   }
    
    var driver = new Driver({
		allowClose: false
	});
    driver.defineSteps([
        {
            element: '#theWord',
            popover: {
              title: 'Your Question',
              description: 'Here is the word to unscramble',
              position: 'bottom-center'
            }
          }, 
        {
            element: '#alphass',
            popover: {
              title: 'Type and Timer',
              description: 'Use these buttons to type answer<br>You have 60 seconds<br>Your time is running out',
              position: 'top-center'
            }
          }
    ])
    driver.start();
}



