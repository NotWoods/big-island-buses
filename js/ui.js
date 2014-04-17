function hideDisclaimer() {
	disclaimer = document.getElementById("disclaimer");
	
	disclaimer.addEventListener("animationend", closeDisclaimer, false);
	disclaimer.addEventListener("webkitAnimationEnd", closeDisclaimer, false);
	disclaimer.addEventListener("oanimationend", closeDisclaimer, false);
	disclaimer.addEventListener("MSAnimationEnd", closeDisclaimer, false);
	
	disclaimer.className = "closing";
}
function closeDisclaimer() {
	disclaimer.className = "closed";
}