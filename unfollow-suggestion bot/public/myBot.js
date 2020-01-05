
var botui = new BotUI('hello-world');
var loadingMsgIndex
var name

      
    const start = () => {
        return botui.message.add({ 
            delay: 1000,
            content: "Hello lil fella, my name is do'stim, it means friend in uzbek \n " + 
            " i'm an instagram utility than can help you keep you S.O. " +
            "by suggesting which people to unfollow(just women at this moment though)" 
            }).then(function(){
                return botui.message.bot({
                    delay: 2000,
                    content: "May i have your name please:"
                })
            }).then(function () { 
            return botui.action.text({ 
                delay: 1000,
                action: {
                placeholder: 'Your name'
                }
            })
        }).then(function(res){
            return botui.message.add({
                content: 'Nice to meet you ' + res.value 
            })
        }).then(function(){
            return botui.message.add({
                delay: 2000,
                content: 'OK, this is what i do: I go through the list of people that' +
                'you follow and one by one i analyze their pictures and i determine' +
                'if they are NSFW-make-the-gf-jealous type of account...'
            })
        }).then(function(){
           return  botui.message.add({
                delay: 2000,
                content: "... and then as a good do'stim(you get it?) i'll just tell you" +
                " which to unfollow..."
            })
        }).then(function(){
            return botui.message.add({
                delay: 2000,
                content: "but don't worry i'm not very strict ;-)"
        })
        }).then(function(){
            return botui.message.bot({
                delay: 2000,
                content: "May i have your name ig account (make sure it's public)"
            })
        }).then(function () { 
        return botui.action.text({ 
            delay: 2000,
            action: {
            placeholder: 'IG account here'
            }
         })
        }).then( function (res) { 
        loadingMsgIndex = botui.message.bot({
            delay: 2000,
            loading: true,
            content: "well, this might take a while... "
        }).then(function(index){
          loadingMsgIndex = index
          ajaxCall(res.value)
          hello()
        })
        
    })

}

/* 
.then(function(index){
            loadingMsgIndex = index;
            ajaxCall(res.value)
            botui.message.add({
                content: "this might take a while... "
            })
            checkData()
            hello()

        })

*/

function showResponse(films){
    botui.message
    .update(loadingMsgIndex, {
        content: films })
}

async function ajaxCall(who) {
    var request = new XMLHttpRequest()

    request.open('GET', 'http://localhost:3000/score/' + who + '/', true)
    
    request.send()
    checkData()

}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkData(){
  console.log("checkdata called")
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'text';//or 'text', 'json', ect. there are other types. 
  xhr.onload = function(){
    var blob = xhr.response;
    if (this.readyState == 4 && this.status == 200) {
      if (blob === "not yet buddy!"){
      console.log(blob)
      setTimeout(checkData, 10000)  
      } else {
        var msg = "OK, this is my unfollow suggestion: " + "\n"
        var theList = JSON.parse(blob)
        var blob2 = theList.split(" ").slice(1, theList.split(" ").length - 1)
        for (const [index, elem] of blob2.entries()){
          msg += index.toString() + ". " + elem + "\n" }
          var alertmsg = "sorry for interrupt your game, your results are ready please scroll up a bit!"
          alert(blob2)
        showResponse(msg)
      }
    }
  }
 
  xhr.open('GET', 'http://localhost:3000/checkResults', true);
  xhr.send();

  }

    
    start()

    //global game variables
var gameState = {
    'wins': 0,
    'losses': 0,
    'games': 0,
    'result': 0
  },
      resultMessages = ["It's a draw.", "You won!", "You lost..."],
      playMessages = [icon('hand-rock-o') + ' Rock', icon('hand-paper-o') + ' Paper', icon('hand-scissors-o') + ' Scissors'],
      maxGames = 5
  
  // work-around as markdown is not always correctly parsed
  function icon(iconName) {
    return '<i class="botui-icon botui-message-content-icon fa fa-' + iconName + '"></i>'
  }
  
  // entrypoint for the conversation
  function hello () {
    botui.message.bot({
      delay: 500,
      content: "Would you like to play a game?"
    }).then(function () {
      return botui.action.button({
        delay: 1000,
        action: [{
          icon: 'check',
          text: 'Bring it on',
          value: 'yes'
        }, {
          icon: 'times',
          text: 'No thanks',
          value: 'no'
        }]
      })
    }).then(function (res) {
      if (res.value === 'yes') {
        shifumi()
      } else {
        botui.message.add({
          delay: 500,
          type: 'html',
          content: icon('frown-o') + ' Another time perhaps'
        })
      }
    })
  };
  
  // main game loop
  function shifumi () {
    botui.action.button({
      delay: 1000,
      addMessage: false,
      action: [{
        icon: 'hand-rock-o',
        text: 'Rock',
        value: '0'
      }, {
        icon: 'hand-paper-o',
        text: 'Paper',
        value: '1'
      }, {
        icon: 'hand-scissors-o',
        text: 'Scissors',
        value: '2'
      }]
    }).then(function (res) {
      var playerMove = parseInt(res.value)
      var botMove = Math.floor(Math.random()*3)
      //result = 0 -> draw, 1 -> win, 2 -> loss
      var result = (playerMove - botMove + 3) % 3
      gameState.result = result
      gameState.games += 1
      if (result === 1) {
        gameState.wins += 1
      } else if (result === 2) {
        gameState.losses += 1
      }
      botui.message.add({
        delay: 1000,
        loading: true,
        human: true,
        type: 'html',
        content: playMessages[playerMove]
      });
      return botui.message.bot({
        delay: 1000,
        loading: true,
        type: 'html',
        content: playMessages[botMove]
      })
    }).then(function () {
      // fetch info from the global state
      var result = gameState.result
      var score = '<br/>Score: ' + icon('android') + ' ' + gameState.losses + ' - ' + gameState.wins + ' ' + icon('user')
      return botui.message.bot({
        delay: 500,
        type: 'html',
        content: resultMessages[result] + score
      })
    }).then((gameState.games < maxGames) ? shifumi : goodbye)
  }
  
  function goodbye () {
    botui.message.bot({
      delay: 500,
      content: "You've played enough already. Get back to work!"
    })
  }
  
  
  //shifumi()

    