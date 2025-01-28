
const ACCEL = 1;
const R_ACCEL = 10;
const DRAG = 0.1;

function degToRad(deg) {
	return Math.PI * deg / 180.0;
}
function randBelow(max) {
	return Math.floor(Math.random() * max);
}
function isIntersecting(elem1, elem2) {
	if(typeof elem1 == "undefined" || typeof elem2 == "undefined") return false;

	const pBounds = elem1.getBoundingClientRect();
	const aBounds = elem2.getBoundingClientRect();

	return pBounds.top > aBounds.top && pBounds.bottom < aBounds.bottom
		&& pBounds.left > aBounds.left && pBounds.right < aBounds.right;
}


class Asteroid {
	
	static SPEED = 10;

	constructor() {
		// Pick which side to spawn on 0-3
		const side = randBelow(4);
		
		switch (side) {
			case 0: // Left
				this.pos = [-10.0, randBelow(window.innerHeight)];
				break;
			case 1: // Top
				this.pos = [-10.0, randBelow(window.innerWidth)];
				break;
			case 2: // Right
				this.pos = [window.innerWidth, randBelow(window.innerHeight)];
				break;
			case 3: // Bottom
				this.pos = [window.innerHeight, randBelow(window.innerWidth)];
				break;
			default:
				break;
		}
		
		// Compute direction
		const deltaX = this.pos[0] - player.pos[0];
		const deltaY = this.pos[1] - player.pos[1];
		this.dir = Math.atan(deltaY / deltaX) * (180.0 / Math.PI);
		if(this.pos[0] < player.pos[0]) {
			this.dir += 180.0;
		}

		// Create element
		this.elem = document.createElement("div");
		this.elem.innerHTML = "🌑";
		this.elem.classList.add("asteroid");

		this.elem.style.left = `${this.pos[0]}px`;
		this.elem.style.top = `${this.pos[1]}px`;
		this.elem.style.transform = `rotate(${this.dir}deg)`;

		document.body.appendChild(this.elem);
	}

	update() {
		this.pos[0] += -Asteroid.SPEED * Math.sin(degToRad(this.dir) + Math.PI / 2.0);
		this.pos[1] += Asteroid.SPEED * Math.cos(degToRad(this.dir) + Math.PI / 2.0);

		// Check for collisions with player (end game if true)
		if(isIntersecting(player.elem, this.elem)) {
			// Clear all bullets
			player.bullets.forEach((b) => {
				b.elem.remove();
			});
			player.bullets = [];
			// Clear all asteroids
			asteroids.forEach((a) => {
				a.elem.remove();
			});	
			asteroids = [];

			// Reset player
			player = new Player();

			toggleGame();

			return;
		}
	}

	draw() {
		this.elem.style.left = `${this.pos[0]}px`;
		this.elem.style.top = `${this.pos[1]}px`;
	}
}

class Bullet {

	static SPEED = 20;

	constructor(xPos, yPos, dir) {
		this.pos = [xPos, yPos];
		this.dir = dir;

		// Update twice to move bullet away from origin
		this.update();
		this.update();

		// Create HTML element
		this.elem = document.createElement("h1");
		this.elem.innerHTML = "👽";
		this.elem.classList.add("bullet");

		this.elem.style.left = `${this.pos[0]}px`;
		this.elem.style.top = `${this.pos[1]}px`;
		this.elem.style.transform = `rotate(${this.dir}deg)`;

		document.body.appendChild(this.elem);
	}

	update() {
		// Check if bullet hit asteroid (destroy if so)
		asteroids.forEach((a) => {
			const intersecting = isIntersecting(this.elem, a.elem);
			if(intersecting) {
				a.elem.remove();
				this.elem.remove();
			}
		});


		this.pos[0] += -Bullet.SPEED * Math.cos(degToRad(this.dir) + Math.PI / 2.0);
		this.pos[1] += -Bullet.SPEED * Math.sin(degToRad(this.dir) + Math.PI / 2.0);
	}

	draw() {
		this.elem.style.left = `${this.pos[0]}px`;
		this.elem.style.top = `${this.pos[1]}px`;
	}

	isOutOfBounds() {
		if(this.pos[0] < 0) {
			return true;
		} else if (this.pos[0] > window.innerWidth) {
			return true;
		}

		if(this.pos[1] < window.scrollY) {
			return true;
		} else if(this.pos[1] > window.scrollY + window.innerHeight) {
			return true;
		}

		return false;
	}
}

class Player {
	
	// Position vectors
	pos = [window.innerWidth / 2.0, window.innerHeight / 2.0];
	vel = [0.0, 0.0];
	acc = [0.0, 0.0];
	
	rPos = 0.0;
	rVel = 0.0;

	// Movement state-tracking
	movingForward = false;
	movingBackward = false;

	bullets = [];
	
	static FIRE_DELAY = 5;
	lastFired = 0;
	

	constructor() {
		this.elem = document.getElementById("asteroid-player");
		this.elem.style.left = this.pos[0];
		this.elem.style.top = this.pos[1];
	}

	moveForward() {
		this.acc[0] = ACCEL * Math.sin(degToRad(this.rPos));
		this.acc[1] = -ACCEL * Math.cos(degToRad(this.rPos));
		this.movingForward = true;
		this.moveBackward = false;
	}
	moveBackward() {
		this.acc[0] = -ACCEL * Math.sin(degToRad(this.rPos));
		this.acc[1] = ACCEL * Math.cos(degToRad(this.rPos));
		this.movingForward = false;
		this.movingBackward = true;
	}
	turnLeft() {
		this.rVel = -R_ACCEL;
	}
	turnRight() {
		this.rVel = R_ACCEL;
	}

	shoot() {
		if(this.lastFired >= Player.FIRE_DELAY) {
			this.bullets.push(new Bullet(this.pos[0], this.pos[1], this.rPos));
			this.lastFired = 0;
		}
	}

	draw() {
		// Position
		this.elem.style.left = `${this.pos[0]}px`;
		this.elem.style.top = `${this.pos[1]}px`;

		// Rotation
		this.elem.style.transform = `rotate(${this.rPos}deg)`;
		

		// State logging
		//console.log(`Position: [${this.pos[0]}, ${this.pos[1]}]    Rotation: ${this.rPos}  Acc: [${this.acc[0]}, ${this.acc[1]}]`);
	}

	update() {
		if(this.lastFired < Player.FIRE_DELAY + 1) {
			this.lastFired += 1;
		}

		// Update position
		this.pos[0] += this.vel[0];
		this.pos[1] += this.vel[1];

		// Handle screen overflow
		if(this.pos[0] < 0) {
			this.pos[0] = window.innerWidth - 10;
		} else if(this.pos[0] > window.innerWidth) {
			this.pos[0] = 10;
		}


		if(this.pos[1] < window.scrollY) {
			this.pos[1] = window.innerWidth + window.scrollY;
		} else if(this.pos[1] > window.innerWidth + window.scrollY) {
			this.pos[1] = window.scrollY;
		}


		// Update velocity 
		this.vel[0] += this.acc[0];
		this.vel[1] += this.acc[1];

		if(this.vel[0] > 0) {this.vel[0] -= DRAG;}
		else {this.vel[0] += DRAG;}

		if(this.vel[1] > 0) {this.vel[1] -= DRAG;}
		else {this.vel[1] += DRAG;}


		// Update rotation
		this.rPos += this.rVel;
		
		// Keep acceleration in correct direction (if necessary)
		if(this.movingForward) {
			this.acc[0] = ACCEL * Math.sin(degToRad(this.rPos));
			this.acc[1] = -ACCEL * Math.cos(degToRad(this.rPos));
		} else if (this.movingBackward) {
			this.acc[0] = -ACCEL * Math.sin(degToRad(this.rPos));
			this.acc[1] = ACCEL * Math.cos(degToRad(this.rPos));
		}

		this.draw();

		// Draw bullets
		let deleteIdx = [];
		for(let i=0; i<this.bullets.length; i++) {
			this.bullets[i].update();
			this.bullets[i].draw();

			if(Math.sqrt(Math.pow(this.bullets[i].pos[0] - player.pos[0], 2) + Math.pow(this.bullets[i].pos[1] - player.pos[1], 2)) > Math.max(window.innerWidth, window.innerHeight)) {
				deleteIdx.push(i);
			}
		}

		deleteIdx.forEach((idx) => {
			this.bullets[idx].elem.remove();
		});
	}
}
window.addEventListener("keydown", (e) => {
	const keyPressed = e.keyCode;
	
	switch (keyPressed) {
		case 65:
			player.turnLeft();
			break;
		case 87:
			player.moveForward();
			break;
		case 68:
			player.turnRight();
			break;
		case 83:
			player.moveBackward();
			break;
		case 13: // Enter
			player.shoot();
			break;
		case 81: // Q
			game.newAsteroid();
			break;
		default:
			//console.log(keyPressed);
			break;
	}
	
});
window.addEventListener("keyup", (e) => {
	const keyPressed = e.keyCode;

	switch (keyPressed) {
		case 65:
			player.rVel = 0;
			break;
		case 87:
			player.acc = [0, 0];
			player.movingForward = false;
			player.movingBackward = false;
			break;
		case 68:
			player.rVel = 0;
			break;
		case 83:
			player.acc = [0, 0];
			player.movingForward = false;
			player.movingBackward = false;
			break;
		default:
			break;
	}
});



class Game {
	isRunning = false;

	update() {
		player.update();
		const deleteIdx = [];
	
		// Roll random num to spawn in new asteroid
		const asteroidSpawn = randBelow(100);
		if(asteroidSpawn < 2) {
			asteroids.push(new Asteroid());
		}



		let i = 0;
		asteroids.forEach((a) => {
			a.update();
			a.draw();

			// Remove asteroids if they go offscreen
			if(Math.sqrt(Math.pow(a.pos[0] - player.pos[0], 2) + Math.pow(a.pos[1] - player.pos[1], 2)) > Math.max(window.innerWidth, window.innerHeight)) {
				deleteIdx.push(i);
			}
			i++;
		});

		deleteIdx.forEach((idx) => {
			asteroids[idx].elem.remove();
		});
	}

	newAsteroid() {
		asteroids.push(new Asteroid());
	}
}


var game = new Game();
var player = new Player();
var asteroids = [];

var gameClock = null;

const toggleButton = document.getElementById("asteroids-toggle");
toggleButton.addEventListener("click", toggleGame);

function toggleGame() {

	if(!game.isRunning) {
        // Game was paused when button was pressed
		game.isRunning = true;

		player.elem.style.display = "block";
        asteroids.forEach((a) => {
            a.elem.style.display = "block";
        });
        player.bullets.forEach((b) => {
            b.elem.style.display = "block";
        });

		gameClock = setInterval(game.update, 33); 
        toggleButton.innerText = "Pause Game";
	} else {
        // Game was already running
		game.isRunning = false;

		player.elem.style.display = "none";
        asteroids.forEach((a) => {
            a.elem.style.display = "none";
        });
        player.bullets.forEach((b) => {
            b.elem.style.display = "none";
        });

		clearInterval(gameClock);
        toggleButton.innerText = "Start Game";
	}
}

