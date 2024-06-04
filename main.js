
const modal = document.getElementById("outer-modal");

function openContactModal() {
	modal.style.display = "block";
}

modal.addEventListener("click", (e) => {
	if(e.target == modal) {
		modal.style.display = "none";
	}
});


/* Scroll functions */
function scrollToWeb() {
	const webHeight = document.getElementById("web-dev").getBoundingClientRect().top;
	window.scrollTo({
		top: webHeight,
		left: 0,
		behavior: "smooth"
	});
}

function scrollToML() {
	const mlHeight = document.getElementById("ml").getBoundingClientRect().top;
	window.scrollTo({
		top: mlHeight,
		left: 0,
		behavior: "smooth"
	});
}

function scrollToED() {
	const embedHeight = document.getElementById("embedded").getBoundingClientRect().top;
	window.scrollTo({
		top: embedHeight,
		left: 0,
		behavior: "smooth"
	});
}


