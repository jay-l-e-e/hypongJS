/* 
 * hypong.js version 1.0.0, @license MIT, (c) 2017 Jay Lee.
 * : Dynamic Event Logs Example.
 */
let stage = hypong('stage');

// Add log to target element
const addLog = (id, log, limit) => {
  const elem = document.getElementById(id);

  if (elem.childNodes.length >= limit) {
    elem.removeChild(elem.childNodes[0]);
  }

  elem.innerHTML += log;
  elem.scrollTop = elem.scrollHeight;
};

// You can run a game with dynamic callback functions. use stage.extend({ callbacks }).run() or stage.run({ callbacks })
stage.extend({
  // Event that occurs on game start.
  onStart: (capturedState) => {
    addLog(
      'eventLogs',
      '<p>Hypong has been started. ' + JSON.stringify(capturedState, null, 1) + '</p>',
      5
    );

    addLog(
      'currentStateLogs',
      '<p>Current State: ' + JSON.stringify(capturedState, null, 1) + '</p>',
      1
    );
  },
  // Event that occurs on game stops.
  onStop: (isTemporary, capturedState) => {
    const currentScores = { home: stage.homeScore, away: stage.awayScore };

    document.getElementById('scores').innerHTML = (
      currentScores.home + ' : ' + currentScores.away
    );

    addLog(
      'eventLogs',
      '<p>Hypong has been ' + (
        isTemporary ? 'temporarily' : 'permanently'
      ) + ' stopped. ' + JSON.stringify(capturedState, null, 1) + '</p>',
      5
    );

    addLog(
      'currentStateLogs',
      '<p>Current State: ' + JSON.stringify(capturedState, null, 1) + '</p>',
      1
    );

    if (isTemporary) {
      addLog(
        'eventLogs',
        '<p>Last update: '+ (
          currentScores.home > lastScores.home ? 'home' : 'away'
        ) +' wins the game.</p>',
        5
      );
    }
  },
  // Event that occurs on frame start.
  onFrameStart: (capturedState) => {
    addLog(
      'frameLogs',
      '<p>Frame Started: #{' + capturedState.frames + '}</p>',
      9
    );

    addLog(
      'currentStateLogs',
      '<p>Current State: ' + JSON.stringify(capturedState, null, 1) + '</p>',
      1
    );
  },
  // Event that occurs on object collision.
  onCollision: (capturedState, collisionInfo) => {
    /*
     * collisionInfo = { LRDirection: null or 'left' or 'right' (is not null only collision with racket), TBScore: range of 1 - 0 }
     */
    addLog(
      'eventLogs',
      '<p>Ball collision event fired. ' + JSON.stringify(capturedState, null, 1) +
      '<br/>Collision Information: ' + JSON.stringify(collisionInfo, null, 1) + '</p>',
      5
    );

    addLog(
      'currentStateLogs',
      '<p>Current State: ' + JSON.stringify(capturedState, null, 1) + '</p>',
      1
    );
  },
});

const lastScores = {};

// Or you can use this way instead.
const frameEndHandler = (capturedState) => {
  addLog(
    'frameLogs',
    '<p>Frame Ended: #{' + capturedState.frames + '}</p>',
    9
  );
  addLog(
    'currentStateLogs',
    '<p>Current State: ' + JSON.stringify(capturedState, null, 1) + '</p>',
    1
  );
  lastScores.home = stage.homeScore;
  lastScores.away = stage.awayScore;
};

// Event that occurs on frame end.
stage.onFrameEnd = frameEndHandler;