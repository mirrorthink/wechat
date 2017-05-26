var open = document.getElementById('open');
open.addEventListener("click", function () {
   document.querySelector("body").style.transform='translateY(-100%)'
});

var knowed = document.getElementById('knowed');
open.addEventListener("click", function () {
   window.history.go(-2)
});