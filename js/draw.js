/* Basic driver code to allow users to draw on the canvas element
 *
 */


const canvas = document.getElementById("canvas");
let drawing = false;

// Compute canvas scale ratio
const scaleRatio = canvas.width / 28;

// Start drawing
canvas.addEventListener("mousedown", () => {
	drawing = true;
});

// Stop drawing
canvas.addEventListener("mouseup", () => {
	drawing = false;
});


canvas.addEventListener("mousemove", (e) => {
	if(!drawing) return;
	const x = e.offsetX;
	const y = e.offsetY;
	ctx.fillRect(Math.round(x/scaleRatio)*scaleRatio-scaleRatio/2, 
				 Math.round(y/scaleRatio)*scaleRatio-scaleRatio/2, 
				 scaleRatio*2, 
				 scaleRatio*2);
});

function clearCanvas() {
	ctx.fillStyle = "white";
	ctx.fillRect(0,0, canvas.width, canvas.height);
	ctx.fillStyle = "black";
}

clearCanvas();
