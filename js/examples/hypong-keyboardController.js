/*
 * hypong.js version 1.0.0, @license MIT, (c) 2017 Jay Lee.
 * : Keyboard Controller Example.
 */
const isKeyPressed = {};

let racketSpeed = 3;

// If keys are pressed
window.onkeydown = (event) => {
  switch (
    event.keyCode === 87 ||
    event.keyCode === 83 ||
    event.keyCode === 38 ||
    event.keyCode === 40
  ) {
    case true:
      event.preventDefault();
      if (!isKeyPressed[event.keyCode]) {
        isKeyPressed[event.keyCode] = true;
      }
      break;

    default:
      return;
  }
};

// If keys are unpressed
window.onkeyup = (event) => {
  if (isKeyPressed[event.keyCode]) {
    isKeyPressed[event.keyCode] = false;
  }
};

const keyInterval = setInterval(() => {
  // If 'w' key is pressed
  if (isKeyPressed[87]) {
    // This can be translate as: stage.homeY += racketSpeed;
    stage.moveRacket('home', racketSpeed);
  }

  // If 's' key is pressed
  if (isKeyPressed[83]) {
    // This can be translate as: stage.moveRacket('home', -racketSpeed);
    stage.homeY -= racketSpeed;
  }

  // If '▲' key is pressed (Up Arrow Key)
  if (isKeyPressed[38]) {
    // This can be translate as: stage.moveRacket('away', racketSpeed);
    stage.awayY += racketSpeed;
  }

  // If '▼' key is pressed (Down Arrow Key)
  if (isKeyPressed[40]) {
    // This can be translate as: stage.moveRacket('away', -racketSpeed);
    stage.awayY -= racketSpeed;
  }
}, 16);