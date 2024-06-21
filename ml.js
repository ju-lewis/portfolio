/*
	Code written by Julian Lewis, 2024
*/


const ctx = document.getElementById("canvas").getContext("2d");
const outputTable = document.getElementById("nn-table");
const tableCells = outputTable.children;
const epochLabel = document.getElementById("epoch-label");
const lossLabel = document.getElementById("loss-label");
const targetEpochs = document.getElementById("epoch-input");

class Model {

	static NUM_CATEGORIES = 10; // integers 0-9
	static LEARNING_RATE = 0.001;

	constructor(inputSize) {
		this.outputs = new Array(Model.NUM_CATEGORIES);
		this.inputSize = inputSize;
		
		for(let i=0; i<Model.NUM_CATEGORIES; i++) {
			this.outputs[i] = new Neuron(inputSize);
		}
	}

	predict(input) {

		if(typeof input == "undefined" || input.length != this.inputSize) {
			throw new ValueError("Invalid input size!");
		}

		// Run a prediction on all output nodes
		for(let i=0; i<Model.NUM_CATEGORIES; i++) {
			this.outputs[i].value = this.outputs[i].dot(input);
		}

		// Now softmax into output vector
		let outputVec = new Array(Model.NUM_CATEGORIES);
		for(let i=0; i<Model.NUM_CATEGORIES; i++) {
			outputVec[i] = Neuron.softmax(this.outputs, i);
		}

		return outputVec;
	}

	static crossEntropyLoss(predictions, targets) {
		const N = predictions.length;
		let sum = 0;
		for(let i=0; i<N; i++) {
			// Add the log of the predicted probability for the correct category
			sum += Math.log(predictions[i][targets[i]]);
			if(isNaN(sum) || N == 0) {
				console.error(`NAN DETECTED: N==${N} i==${i}`);
				console.log(predictions);
				return;
			}
		}


		return -sum / N;
	}

	train(trainingData, trainingSetSize, epochs) {
		let targets = new Array();

		// We can build our targets now
		for(let i=0; i<trainingSetSize; i++) {
			targets.push(Model.pickGreatest(trainingData[i].output));
		}

		// Set interval for training
		let currLoss = 0;
		let currEpoch = 1;
		const interval = setInterval(() => {
			currLoss = this.actualTrain(trainingData, trainingSetSize, epochs, targets);
			console.log(`Epoch ${currEpoch} loss: ${currLoss}`);
			epochLabel.innerHTML = currEpoch++;
			lossLabel.innerHTML = Math.round(currLoss * 1000) / 1000;

			if(currEpoch >= epochs) {
				clearInterval(interval);
				return;
			}
		}, 0);
	}

	// Actual training function (called by interval) (performs 1 training step)
	actualTrain(trainingData, trainingSetSize, epochs, targets) {
		let predictions = new Array();

		// Make a prediction for all training items
		for(let i=0; i<trainingSetSize; i++) {
			predictions.push(this.predict(trainingData[i].input));
		}

		// Now evaluate loss
		const loss = Model.crossEntropyLoss(predictions, targets);

		// Now perform back propagation
		for(let i=0; i<trainingSetSize; i++) {
			this.backpropagate(trainingData[i].input, trainingData[i].output);
		}

		return loss;
	}

	backpropagate(inputs, truthVector) {
		// Make prediction
		const softmaxVec = this.predict(inputs);

		// Compute the partial derivative of loss with respect to weights
		for(let i=0; i<this.inputSize; i++) {
			for(let j=0; j<Model.NUM_CATEGORIES; j++) {
				const dLdw = (softmaxVec[j] - truthVector[j]) * (inputs[i]);
				// Now adjust weight
				const delta = Model.LEARNING_RATE * dLdw;
				this.outputs[j].weights[i] -= delta;
			}
		}
	}

	static pickGreatest(outputVec) {
		let greatestIdx = 0;
		for(let i=0; i<outputVec.length; i++) {
			if(outputVec[i] > outputVec[greatestIdx]) {
				greatestIdx = i;
			}
		}
		return greatestIdx;
	}

	static displayOutputVec(outputVec) {
		if(outputVec.length != tableCells.length) return;

		for(let i=0; i<outputVec.length; i++) {
			tableCells[i].innerHTML = "";
			tableCells[i].style.backgroundColor = "transparent";
			tableCells[i].innerHTML = Math.round(outputVec[i] * 100) / 100;
		}
		
		tableCells[Model.pickGreatest(outputVec)].style.backgroundColor = "#00550088";
	}


}

class Neuron {
	constructor(inputSize) {
		this.weights = new Array(inputSize + 1);

		this.value = 0;

		// Use Xavier initialisation
		for(let i=0; i<this.weights.length; i++) {
			const n_in = inputSize;
			const n_out = Model.NUM_CATEGORIES;
			const bound = Math.sqrt(1)/Math.sqrt(n_in + n_out);

			const initRand = (Math.random() - 0.5)*2 // U(-1, 1)

			this.weights[i] = initRand * bound;
		}
	}

	// Returns the softmax for a specific output category
	static softmax(inputNeurons, outputIdx) {
		// Stabilise logits
		let maxLogit = inputNeurons[0].value;
		inputNeurons.forEach((n) => {
			if(n.value > maxLogit) {
				maxLogit = n.value;
			}
		});
		let stabilisedLogits = new Array(inputNeurons.length);
		for(let i=0; i<inputNeurons.length; i++) {
			stabilisedLogits[i] = inputNeurons[i].value - maxLogit;
		}

		let vecSum = 0;
		stabilisedLogits.forEach((i) => {
			vecSum += Math.exp(i);
		});
		
		return Math.exp(inputNeurons[outputIdx].value-maxLogit) / vecSum;
	}

	dot(inputs) {
		let sum = 0;
		for(let i=0; i<inputs.length; i++) {
			sum += inputs[i] * this.weights[i];
		}
		// Now add bias
		sum += 1 * this.weights[this.weights.length - 1];
		return sum;
	}
}


function getNNInput() {
	let img = ctx.getImageData(0,0,canvas.width,canvas.height).data;

	// Get array of average pixel brightness
	let finalImg = new Array(28 * 28);
	let o = 0;
	//ctx.fillStyle="red";
	for(let i=0; i < 28; i++) {
		for(let j=0; j < 28; j++) {
			//ctx.fillRect(i*scaleRatio,j*scaleRatio,4,4);

			const imgIdx = (j*scaleRatio + (i*scaleRatio * canvas.width)) * 4;
			const brightness = (img[imgIdx] + img[imgIdx+1] + img[imgIdx+2]) / 3;

			const outIdx = (j + (i * 28));
			// Normalize brightness and invert colour
			finalImg[outIdx] = 1 - brightness / 255.0;
		}
	}
	//ctx.fillStyle = "black";

	return finalImg;
}

function makeCategoryArray(i) {
	let res = new Array(10).fill(0);
	res[i] = 1;
	return res;
}

async function getData() {
	
	// Get raw array of MNIST data from server
	let raw = new Array(10);
	for(let i=0; i<10; i++) {
		const data = await fetch(`digits/${i}.json`);
		const json = await data.json();
		raw[i] = json.data;
	}

	// Now add labels to the data
	let trainingData = new Array();
	// Iterate through each category
	let currDigit = 0;
	raw.forEach((r) => {
		const len = r.length;
		const numDigits = len / (28*28);
		
		// Iterate through all samples for that category
		for(let i=0; i<numDigits; i++) {
			trainingData.push({
				"input": r.slice(i*784, (i+1)*784),
				"output": makeCategoryArray(currDigit)
			});
		}
		currDigit++;
	});

	console.log(trainingData);
	return trainingData;
}

async function globalTrain() {
	const trainingData = await getData();

	// Get value from user input
	const epochs = parseInt(targetEpochs.value);

	model.train(trainingData, 10000, epochs);
}

function predictNum() {
	const outputVec = model.predict(getNNInput());
	console.log(outputVec);
	console.log(Model.pickGreatest(outputVec));
	Model.displayOutputVec(outputVec);
}



let model = new Model(28*28);

