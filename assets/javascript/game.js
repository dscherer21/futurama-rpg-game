//Global variables
$(document).ready(function() {

//Prolgue section goes away when button clicked
$('#startGame').click(function() {
  $('#prologueCard').hide();
});

//Audio Controls
var audio = new Audio('assets/audio/futuramaThemeMusic.mp3');
//Play Audio
$('#playMusic').on('click', function() {
    audio.play();
});
//Pause Audio
$('#pauseMusic').on('click', function() {
    audio.pause();
});

//Array of Playable Characters
let characters = {
    'Fry': {
        name: 'Fry',
        health: 120,
        attack: 8,
        imageUrl: "assets/images/futuramafry.jpg",
        enemyAttackBack: 15
    },
    'Bender': {
        name: 'Bender',
        health: 100,
        attack: 14,
        imageUrl: "assets/images/futuramabender.jpg",
        enemyAttackBack: 5
    },
    'Zoidberg': {
        name: 'Zoidberg',
        health: 150,
        attack: 8,
        imageUrl: "assets/images/zoidbergcrazy.png",
        enemyAttackBack: 20
    },
    'Zapp': {
        name: 'Zapp',
        health: 180,
        attack: 7,
        imageUrl: "assets/images/futuramazapp.jpg",
        enemyAttackBack: 20
    }
};

var currSelectedCharacter;
var currDefender;
var combatants = [];
var indexofSelChar;
var attackResult;
var turnCounter = 1;
var killCount = 0;


var renderOne = function(character, renderArea, makeChar) {
    //character: obj, renderArea: class/id, makeChar: string
    var charDiv = $("<div class='character' data-name='" + character.name + "'>");
    var charName = $("<div class='character-name text-center'>").text(character.name);
    var charImage = $("<img alt='image' class='img img-thumbnail character-image'>").attr("src", character.imageUrl);
    var charHealth = $("<div class='character-health text-center'>").text("HP:" + character.health);
    charDiv.append(charName).append(charImage).append(charHealth);
    $(renderArea).append(charDiv);
    //Capitalizes the first letter in characters name
    // $('.character').css('textTransform', 'capitalize');
    // conditional render
    if (makeChar == 'enemy') {
      $(charDiv).addClass('enemy');
    } else if (makeChar == 'defender') {
      currDefender = character;
      $(charDiv).addClass('target-enemy');
    }
  };

  // Create function to render game message to DOM
  var renderMessage = function(message) {
    var gameMesageSet = $("#gameMessage");
    var newMessage = $("<div>").text(message);
    gameMesageSet.append(newMessage);

    if (message == 'clearMessage') {
      gameMesageSet.text('');
    }
  };

  var renderCharacters = function(charObj, areaRender) {
    //render all characters
    if (areaRender == '#toonSelection') {
      $(areaRender).empty();
      for (var key in charObj) {
        if (charObj.hasOwnProperty(key)) {
          renderOne(charObj[key], areaRender, '');
        }
      }
    }
    //render player character
    if (areaRender == '#chosenToon') {
      $('#chosenToon').prepend("Your Character");
      renderOne(charObj, areaRender, '');
      $('#attackButton').css('visibility', 'visible');
    }
    //render combatants
    if (areaRender == '#defendingToons') {
        $('#defendingToons').prepend("Choose Your Next Opponent");
      for (var i = 0; i < charObj.length; i++) {

        renderOne(charObj[i], areaRender, 'enemy');
      }
      //render one enemy to defender area
      $(document).on('click', '.enemy', function() {
        //select an combatant to fight
        name = ($(this).data('name'));
        //if defernder area is empty
        if ($('#chosenOpponent').children().length === 0) {
          renderCharacters(name, '#chosenOpponent');
          $(this).hide();
          renderMessage("clearMessage");
        }
      });
    }
    //render defender
    if (areaRender == '#chosenOpponent') {
      $(areaRender).empty();
      for (var i = 0; i < combatants.length; i++) {
        //add enemy to defender area
        if (combatants[i].name == charObj) {
          $('#chosenOpponent').append("Your selected opponent")
          renderOne(combatants[i], areaRender, 'defender');
        }
      }
    }
    //re-render defender when attacked
    if (areaRender == 'playerDamage') {
      $('#chosenOpponent').empty();
      $('#chosenOpponent').append("Your selected opponent")
      renderOne(charObj, '#chosenOpponent', 'defender');
    }
    //re-render player character when attacked
    if (areaRender == 'enemyDamage') {
      $('#chosenToon').empty();
      renderOne(charObj, '#chosenToon', '');
    }
    //render defeated enemy
    if (areaRender == 'enemyDefeated') {
      $('#chosenOpponent').empty();
      var gameStateMessage = "You have defated " + charObj.name + ", you can choose to fight another enemy.";
      renderMessage(gameStateMessage);
    }
  };
  //this is to render all characters for user to choose their computer
  renderCharacters(characters, '#toonSelection');
  $(document).on('click', '.character', function() {
    name = $(this).data('name');
    //if no player char has been selected
    if (!currSelectedCharacter) {
      currSelectedCharacter = characters[name];
      for (var key in characters) {
        if (key != name) {
          combatants.push(characters[key]);
        }
      }
      $("#toonSelection").hide();
      renderCharacters(currSelectedCharacter, '#chosenToon');
      //this is to render all characters for user to choose to fight against
      renderCharacters(combatants, '#defendingToons');
    }
  });

  // ----------------------------------------------------------------
  // Create functions to enable actions between objects.
  $("#attackButton").on("click", function() {
    //if defernder area has enemy
    if ($('#chosenOpponent').children().length !== 0) {
      //defender state change
      var attackMessage = "You attacked " + currDefender.name + " for " + (currSelectedCharacter.attack * turnCounter) + " damage.";
      renderMessage("clearMessage");
      //combat
      currDefender.health = currDefender.health - (currSelectedCharacter.attack * turnCounter);

      //win condition
      if (currDefender.health > 0) {
        //enemy not dead keep playing
        renderCharacters(currDefender, 'playerDamage');
        //player state change
        var counterAttackMessage = currDefender.name + " attacked you back for " + currDefender.enemyAttackBack + " damage.";
        renderMessage(attackMessage);
        renderMessage(counterAttackMessage);

        currSelectedCharacter.health = currSelectedCharacter.health - currDefender.enemyAttackBack;
        renderCharacters(currSelectedCharacter, 'enemyDamage');
        if (currSelectedCharacter.health <= 0) {
          renderMessage("clearMessage");
          restartGame("You have been defeated...GAME OVER!!!");
          force.play();
          $("#attackButton").unbind("click");
        }
      } else {
        renderCharacters(currDefender, 'enemyDefeated');
        killCount++;
        if (killCount >= 3) {
          renderMessage("clearMessage");
          restartGame("You Won!!!! GAME OVER!!!");
        }
      }
      turnCounter++;
    } else {
      renderMessage("clearMessage");
      renderMessage("No enemy here.");
    }
  });

//Restarts the game - renders a reset button
  var restartGame = function(inputEndGame) {
    //When 'Restart' button is clicked, reload the page.
    var restart = $('<button class="btn btn-primary">Restart</button>').click(function() {
      location.reload();
    });
    var gameState = $("<div>").text(inputEndGame);
    $("#gameMessage").append(gameState);
    $("#gameMessage").append(restart);
  };

});
