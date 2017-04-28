/* hypong.js, @license MIT, (c) 2017 Jay Lee. */
!function (window) {
  const thousand = 1000,
        hundred = 100,
        hexadecimal = 16,
        decimal = 10,
        quinary = 5,
        quanary = 4,
        ternary = 3,
        binary = 2,
        unary = 1,
        zero = 0,
        px = 'px',
        black = 'black',
        white = 'white',
        initWidth = 450,
        initHeight = 250,
        initSpeed = 50,
        initBallSize = 4,
        initRacketWidth = 5,
        initRacketHeight = 35,
        initRacketMargin = 10,
        initHeightRadius = initHeight / binary,
        initWidthRadius = initWidth / binary;

  const version = "1.0.0",
        // Array used to copy native functions.
        arr = [],
        // Prevent multiple instance binding to the same element.
        distinctMap = {},
        // Initialized props. If there is no any props given, they'll used instead.
        initProps = {
          width: initWidth,
          height: initHeight,
          speed: initSpeed,
          racketHeight: initRacketHeight,
          racketWidth: initRacketWidth,
          racketMargin: initRacketMargin,
          ballSize: initBallSize,
          ballX: initWidthRadius,
          homeX: (initWidth / hundred) * initRacketMargin,
          awayX: initWidth -(initWidth / hundred) * initRacketMargin,
          ballY: initHeightRadius,
          homeY: initHeightRadius,
          awayY: initHeightRadius,
          homeScore: zero,
          awayScore: zero,
          background: black,
          racketColor: white,
          ballColor: white,
          fps: thousand / hexadecimal,
          isRunning: false,
        },
        // Applied props. User can only offer the props listed below.
        appliedProps = 'width|height|speed|racketHeight|racketWidth|racketMargin|ballSize|fps|ballColor|racketColor|background|onStart|onStop|onFrameEnd|onFrameStart|onCollision|homeY|awayY|homeScore|awayScore|ballX|ballY',
        setterWithRender = function(prop, value) {
          this['_' + prop] = value;

          return this.render();
        },
        setterWithHomeRacketDraw = function(prop, value) {
          if (this.isRunning) {
            const racketVRadius = this.racketHeight / binary;
            const height = this.height;

            let decision = value;

            if (value - racketVRadius <= zero) {
              decision = zero + racketVRadius;
            } else if (value + racketVRadius >= height) {
              decision = height - racketVRadius;
            }

            this['_' + prop] = decision;
          }

          return this.drawHomeRacket();
        },
        setterWithAwayRacketDraw = function(prop, value) {
          if (this.isRunning) {
            const racketVRadius = this.racketHeight / binary;
            const height = this.height;

            let decision = value;

            if (value - racketVRadius <= zero) {
              decision = zero + racketVRadius;
            } else if (value + racketVRadius >= height) {
              decision = height - racketVRadius;
            }

            this['_' + prop] = decision;
          }

          return this.drawAwayRacket();
        },
        setterWithRestart = function(prop, value) {
          this['_' + prop] = value;

          if (this.isRunning) {
            this.stop().run();
          }
        },
        setterWithDrawStage = function(prop, value) {
          this['_' + prop] = value;

          this.drawStage();
        },
        setterWithSpawnBall = function(prop, value) {
          this['_' + prop] = value;

          this.spawnBall();
        },
        setterWithSpawnRacket = function(prop, value) {
          this['_' + prop] = value;

          this.spawnHomeRacket().spawnAwayRacket();
        },
        // Props defined as a setter. If user modify the values listed below, the layout or state is updated.
        propsDefinedAsSetter = [
          ['width', setterWithRender],
          ['height', setterWithRender],
          ['ballSize', setterWithRender],
          ['racketWidth', setterWithRender],
          ['racketHeight', setterWithRender],
          ['racketMargin', setterWithRender],
          ['homeY', setterWithHomeRacketDraw],
          ['awayY', setterWithAwayRacketDraw],
          ['background', setterWithDrawStage],
          ['racketColor', setterWithSpawnRacket],
          ['ballColor', setterWithSpawnBall],
          ['fps', setterWithRestart],
          ['onStart', setterWithRestart],
          ['onStop', setterWithRestart],
          ['onCollision', setterWithRestart],
          ['onFrameStart', setterWithRestart],
          ['onFrameEnd', setterWithRestart],
        ],
        // A new instance is created when the user provides a selector and a custom props.
        hypong = (selector, props) => {
          return new hypong.fn.init(selector, props);
        };

  // Hypong's vanilla prototype.
  hypong.fn = hypong.prototype = {
    constructor: hypong,
    hypong: version,
    filter: arr.filter,
    splice: arr.splice,
    push: arr.push,
    sort: arr.sort,
    map: arr.map,
    length: zero,
    frames: zero,
    distinctMap: distinctMap,
  };

  // Using this method, user can add some custom functions to hypong's prototype.
  hypong.extend = hypong.fn.extend = function () {
    let   o,
          target = this;
    const i = unary,
          length = arguments.length,
          object = arguments[ zero ];

    if ( length > i ) {
      target = arguments[ i ];
    }

    for ( o in object ) {
      target[ o ] = object[ o ];
    }

    return target;
  };

  // Hypong's initialize function. Create new instance and chaning methods.
  const init = hypong.fn.init = function (selector, props) {
    this.homeRacket = window.document.createElement("div");
    this.awayRacket = window.document.createElement("div");
    this.ball = window.document.createElement("div");

    this.ball.className = this.awayRacket.className = this.homeRacket.className = 'hypong-props';

    if (selector) {
      let element;

      if (selector.nodeType) {
        element = selector;
      } else {
        element = window.document.getElementById(
          selector.replace(String.fromCharCode(0x23), '')
        );
      }

      if (element) {
        this[zero] = element;
        this.length = unary;
      } else {
        this.length = zero;
      }
    }

    return this.initialize(props);
  };

  init.prototype = hypong.fn;

  hypong.fn.extend({
    // Define props and setters, spawn some children elements.
    initialize: function(props) {
      const stage = this[zero];

      if (!stage) {
        return this;
      }

      // Initializing the props defined as setter.
      for (const prop in propsDefinedAsSetter) {
        Object.defineProperty(this, propsDefinedAsSetter[prop][zero], {
          configurable: true,
          get: function() {
            return this['_' + propsDefinedAsSetter[prop][zero]];
          },
          set: propsDefinedAsSetter[prop][unary].bind(this, propsDefinedAsSetter[prop][zero])
        });
      }

      // Initializing the props and setters.
      for (const prop in initProps) {
        this[prop] = initProps[prop];
      }

      // Overrides existing props to props sented by the user.
      for (const prop in props) {
        if (appliedProps.indexOf(prop) !== -unary) {
          this[prop] = props[prop];
        }
      }

      // If stage element already have an instance, destroy and continue.
      if (distinctMap[this[zero].id]) {
        clearInterval(distinctMap[this[zero].id]);
      }

      this.removeElementsByClassName('hypong-props');
      stage.appendChild(this.ball);
      stage.appendChild(this.homeRacket);
      stage.appendChild(this.awayRacket);

      return this.render();
    },

    // Revision and draw all.
    render() {
      return this
            .revisionProps()
            .drawStage()
            .spawnBall()
            .spawnHomeRacket()
            .spawnAwayRacket();
    },

    // If need to some props state reset.
    revisionProps() {
      const stage = this[zero];
      const height = this.height;
      const heightRadius = height / binary;
      const width = this.width;
      const racketMargin = this.racketMargin;
      const unit = parseInt(Math.random() * binary) === unary ? - unary : unary;

      // Ball's vector will initialized to follow values below.
      // The ball will move along the vector.
      this.ballVector = {
        x: quinary * unit,
        y: unary / quanary * unit,
      };
      this.ballX = width / binary;
      this.ballY = heightRadius;
      this.homeX = (width / hundred) * racketMargin;
      this.homeY = heightRadius;
      this.awayX = width - (width / hundred) * racketMargin;
      this.awayY = heightRadius;

      if (stage) {
        if (distinctMap[stage.id] && this.isRunning === true) {
          clearInterval(distinctMap[this[zero].id]);
          this.run();
        }
      }

      return this;
    },

    // Draw the hypong game stage.
    drawStage() {
      const stage = this[zero];

      if (stage) {
        const style = stage.style;
        const height = this.height;
        const width = this.width;
        const background = this.background;

        style.background = background;
        style.position = 'relative';
        style.width = width + px;
        style.height = height + px;
      }

      return this;
    },

    // Spawn and draw the hypong ball.
    spawnBall() {
      const ball = this.ball;
      const style = ball.style;
      const ballX = this.ballX;
      const ballY = this.ballY;
      const height = this.height;
      const ballColor = this.ballColor;

      style.width = this.ballSize * binary + px;
      style.height = this.ballSize * binary + px;
      style.bottom = (ballY - this.ballSize) + px;
      style.left = (ballX - this.ballSize) + px;
      style.borderRadius = this.ballSize + px;
      style.position = 'absolute';
      style.background = ballColor;
      style.display = 'block';

      return this;
    },

    // Spawn and draw the home's racket.
    spawnHomeRacket() {
      const homeRacket = this.homeRacket;
      const style = homeRacket.style;
      const racketWidth = this.racketWidth;
      const racketHeight = this.racketHeight;
      const racketMargin = this.racketMargin;
      const racketColor = this.racketColor;

      this._homeY = this.height / binary;

      style.width = racketWidth + px;
      style.height = racketHeight + px;
      style.bottom = (this.homeY - (racketHeight / binary)) + px;
      style.left = racketMargin + '%';
      style.borderRadius = '3px';
      style.position = 'absolute';
      style.background = racketColor;

      return this;
    },

    // Spawn and draw the away's racket.
    spawnAwayRacket() {
      const awayRacket = this.awayRacket;
      const style = awayRacket.style;
      const racketWidth = this.racketWidth;
      const racketHeight = this.racketHeight;
      const racketMargin = this.racketMargin;
      const racketColor = this.racketColor;

      this._awayY = this.height / binary;

      style.width = racketWidth + px;
      style.height = racketHeight + px;
      style.bottom = (this.awayY - (racketHeight / binary)) + px;
      style.right = racketMargin + '%';
      style.borderRadius = '3px';
      style.position = 'absolute';
      style.background = racketColor;

      return this;
    },

    // Draw the hypong ball.
    drawBall() {
      const ball = this.ball;
      const style = ball.style;
      const ballX = this.ballX;
      const ballY = this.ballY;

      style.bottom = (ballY - this.ballSize) + px;
      style.left = (ballX - this.ballSize) + px;
      style.display = 'block';

      return this;
    },

    // Hide the hypong ball.
    hideBall() {
      const ball = this.ball;
      const style = ball.style;

      style.display = 'none';

      return this;
    },

    resetBall(awayFromCenter) {
      const width = this.width;
      const height = this.height;
      const heightRadius = height / binary;

      this.ballX = width / binary + awayFromCenter;
      this.ballY = heightRadius;

      this.stop(true);

      setTimeout(() => {
        if (this.isRunning) {
          this.drawBall().run();
        }
      }, thousand);

      return this;
    },

    // Draw the home's racket.
    drawHomeRacket() {
      const homeRacket = this.homeRacket;
      const racketHeight = this.racketHeight;
      const style = homeRacket.style;

      style.bottom = (this.homeY - (racketHeight / binary)) + px;

      return this;
    },

    // Draw the away's racket.
    drawAwayRacket() {
      const awayRacket = this.awayRacket;
      const style = awayRacket.style;
      const racketHeight = this.racketHeight;

      style.bottom = (this.awayY - (racketHeight / binary)) + px;

      return this;
    },

    // If the user wants, the racket will move.
    moveRacket(which, distance) {
      this[which + 'Y'] += distance;
      return this;
    },

    // The ball will move in all frames.
    moveBall() {
      const getExpectedMove = this.getExpectedMove.bind(this);

      const ballVectorX = this.ballVector.x;
      const ballVectorY = this.ballVector.y;

      const ballX = this.ballX;
      const ballY = this.ballY;

      const ballSize = this.ballSize;

      const width = this.width;
      const height = this.height;

      let xMove = getExpectedMove(ballVectorX);
      let yMove = getExpectedMove(ballVectorY);

      // Prevents the ball from traversing the area through predictions for the next frame.
      if (ballX + xMove - ballSize <= zero) {
        xMove = xMove - (xMove + ballX - ballSize);
      } else if (ballX + xMove + ballSize >= width) {
        xMove = xMove - ((-width) + (ballX + xMove + ballSize));
      }

      // Prevents the ball from traversing the area through predictions for the next frame.
      if (ballY + yMove - ballSize <= zero) {
        yMove = yMove - (yMove + ballY - ballSize);
      } else if (ballY + yMove + ballSize >= height) {
        yMove = yMove - ((-height) + (ballY + yMove + ballSize));
      }

      this.ballX += xMove;
      this.ballY += yMove;

      return this;
    },

    getExpectedMove(vector) {
      return vector * (this.speed / hundred);
    },

    // Is there a collision between the target area and the ball?
    getCollisionInfo(targetX, targetY, vRadius, hRadius, pointX, pointY, pointVRadius, pointHRadius) {
      const result = {
        LRDirection: null,
        TBScore: null,
      };

      if (targetX >= pointX) {
        result.LRDirection = 'left';
      }

      if (targetX <= pointX) {
        result.LRDirection = 'right';
      }

      result.TBScore = (pointY - targetY) / vRadius;

      if ((targetY - vRadius < pointY + pointVRadius && targetY + vRadius > pointY - pointVRadius) &&
          (targetX - hRadius < pointX + pointHRadius && targetX + hRadius > pointX - pointHRadius)) {
        result.isCollision = true;
      }

      return result;
    },

    // Used when the speed of the ball is faster than the collision prediction.
    ballWillPassThrough(targetX, targetY, vRadius, pointX, pointY, pointVectorX, pointVectorY, pointVRadius, pointHRadius) {
      const getExpectedMove = this.getExpectedMove.bind(this);
      return (
        (
          (targetX >= pointX + getExpectedMove(pointVectorX) && targetX < pointX) ||
          (targetX <= pointX + getExpectedMove(pointVectorX) && targetX > pointX)
        ) &&
        (
          targetY - vRadius < pointY + pointVRadius &&
          targetY + vRadius > pointY - pointVRadius
        )
      );
    },

    // The y-axis is determined by the x-axis.
    yAffectedByX(x, score) {
      return Math.abs(x) * (score + (score > zero ? unary / ternary : - unary / ternary));
    },

    stop(isTemporary) {
      const stage = this[zero];

      if (!stage || !this.isRunning) {
        return this;
      }

      const onStop = this.onStop;

      if (distinctMap[stage.id]) {
        clearInterval(distinctMap[stage.id]);
      }

      if (!isTemporary) {
        this.isRunning = false;
      }

      this.fireEvent(onStop, [
        isTemporary,
        this.captureState()
      ]);

      return this;
    },

    // This method captures the current state.
    captureState() {
      return {
        ballX: this.ballX,
        ballY: this.ballY,
        homeX: this.homeX,
        homeY: this.homeY,
        awayX: this.awayX,
        awayY: this.awayY,
        frames: this.frames,
        homeScore: this.homeScore,
        awayScore: this.awayScore,
        ballVector: {
          x: this.ballVector.x,
          y: this.ballVector.y,
        },
      };
    },

    // This method triggers an event by specifying some arguments.
    fireEvent(event, args) {
      if (event && typeof event === 'function') {
        if (typeof args === 'object' && args.length) {
          event(...args);
        } else {
          event(args);
        }
      }

      return this;
    },

    // Run hypong game. The target frame rate is default 60 frames per second.
    run(callbackOptions) {
      const stage = this[zero];

      if (!stage) {
        return this;
      }

      if (distinctMap[stage.id]) {
        clearInterval(distinctMap[stage.id]);
      }

      if (callbackOptions && typeof callbackOptions === 'object') {
        this.extend(callbackOptions);
      }

      const height = this.height;
      const width = this.width;

      const racketHeight = this.racketHeight;
      const racketWidth = this.racketWidth;

      const homeX = this.homeX;
      const awayX = this.awayX;
      
      const ballSize = this.ballSize;

      const getCollisionInfo = this.getCollisionInfo.bind(this);
      const ballWillPassThrough = this.ballWillPassThrough.bind(this);
      const yAffectedByX = this.yAffectedByX.bind(this);
      const getExpectedMove = this.getExpectedMove.bind(this);
      const moveBall = this.moveBall.bind(this);
      const captureState = this.captureState.bind(this);
      const fireEvent = this.fireEvent.bind(this);

      const onFrameStart = this.onFrameStart;
      const onFrameEnd = this.onFrameEnd;
      const onCollision = this.onCollision;
      const onStart = this.onStart;

      this.isRunning = true;
      fireEvent(onStart, this.captureState());

      // Actual running start
      this.runningId = setInterval(() => {
        this.frames ++;

        fireEvent(onFrameStart, this.captureState());

        const ballX = this.ballX;
        const ballY = this.ballY;

        const ballVectorX = this.ballVector.x;
        const ballVectorY = this.ballVector.y;

        // Ball tries go to outside.
        if (
          ballY - ballSize <= zero ||
          ballX - ballSize <= zero ||
          ballY + ballSize >= height ||
          ballX + ballSize >= width
        ) {
          let xAmount;
          let yAmount;

          // Vector mirroring if ball touched the roofs or floors.
          if (ballY - ballSize <= zero || ballY + ballSize >= height) {
            xAmount = ballVectorX;
            yAmount = - ballVectorY;

            if (ballY - ballSize <= zero) {
              fireEvent(onCollision, [captureState(), { LRDirection: null, TBScore: 0 }]);
            } else {
              fireEvent(onCollision, [captureState(), { LRDirection: null, TBScore: 1 }]);
            }
          }
 
          /*
          * Vector mirroring if ball touched the left or right sides.
          if (ballX - ballSize <= zero || ballX + ballSize >= width) {
            xAmount = - ballVectorX;
            yAmount = ballVectorY;
          }
          */
          if (ballX - ballSize <= zero || ballX + ballSize >= width) {
            fireEvent(onFrameEnd, captureState());

            if (ballX - ballSize <= zero) {
              this.awayScore ++;

              return this.resetBall(hundred / binary).hideBall();
            } else {
              this.homeScore ++;

              return this.resetBall(-hundred / binary).hideBall();
            }
          }

          this.ballVector.x = xAmount;
          this.ballVector.y = yAmount;
        } else {
          const homeY = this.homeY;
          const awayY = this.awayY;

          const racketVRadius = racketHeight / binary;
          const racketHRadius = racketWidth / binary;

          // Ball tries touch home's racket.
          const homeCollision = getCollisionInfo(
            homeX - getExpectedMove(ballVectorX),
            homeY,
            racketVRadius,
            racketHRadius,
            ballX,
            ballY,
            ballSize,
            ballSize
          );
          // ballWillPassThrough is used when the speed of the ball is faster than the collision prediction.
          if (
            !!homeCollision.isCollision ||
            ballWillPassThrough(homeX, homeY, racketVRadius, ballX, ballY, ballVectorX, ballVectorY, ballSize, ballSize)
          ) {
            // Fix left right direction to the right value.
            homeCollision.LRDirection = getCollisionInfo(
              homeX,
              homeY,
              racketVRadius,
              racketHRadius,
              ballX,
              ballY,
              ballSize,
              ballSize
            ).LRDirection;

            fireEvent(onCollision, [captureState(), homeCollision]);

            this.ballVector.x = -ballVectorX;
            this.ballVector.y = yAffectedByX(ballVectorX, homeCollision.TBScore);
          }

          // Ball tries touch away's racket.
          const awayCollision = getCollisionInfo(
            awayX - getExpectedMove(ballVectorX),
            awayY,
            racketVRadius,
            racketHRadius,
            ballX,
            ballY,
            ballSize,
            ballSize
          );
          if (
            !!awayCollision.isCollision ||
            ballWillPassThrough(awayX, awayY, racketVRadius, ballX, ballY, ballVectorX, ballVectorY, ballSize, ballSize)
          ) {
            awayCollision.LRDirection = getCollisionInfo(
              awayX,
              awayY,
              racketVRadius,
              racketHRadius,
              ballX,
              ballY,
              ballSize,
              ballSize
            ).LRDirection;

            fireEvent(onCollision, [captureState(), awayCollision]);

            this.ballVector.x = -ballVectorX;
            this.ballVector.y = yAffectedByX(ballVectorX, awayCollision.TBScore);
          }
        }

        // Ball moves follow decided vector then, draw the ball on screen.
        moveBall().drawBall().fireEvent(onFrameEnd, captureState());
      }, thousand / this.fps );

      // Prevent multiple instance binding to the same element.
      distinctMap[stage.id] = this.runningId;

      return this;
    },

    // Remove elements by given class.
    removeElementsByClassName(className){
      const elements = this[0].getElementsByClassName(className);
      while(elements.length > 0){
        this[0].removeChild(elements[0]);
      }
    },
  });

  window.hypong = hypong;
}(window);