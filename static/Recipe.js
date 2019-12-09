var tabName = 'Recipes';
var color = 'purple';

// --- In-Use ---
openTab(tabName, color) 

$(document).ready(function() {
    var x = document.getElementById("Vegan");
    var y = document.getElementById("Vegetarian");
    var z = document.getElementById("Non Vegetarian");
    z.style.display = "none";
    x.style.display = "none";
    y.style.display = "none";
});

function myFunction1() {
var x = document.getElementById("Vegan");
var y = document.getElementById("Vegetarian");
var z = document.getElementById("Non Vegetarian");
  
if (x.style.display === "none") {
  x.style.display = "block";
  y.style.display = "none";
  z.style.display = "none";

} 
 else {
  z.style.display = "none";
  x.style.display = "none";
  y.style.display = "none";
}
}
    
function myFunction2() {
  var x = document.getElementById("Vegan");
  var y = document.getElementById("Vegetarian");
  var z = document.getElementById("Non Vegetarian");
  z.style.display = "none";
    x.style.display = "none";
    y.style.display = "none";
  if (y.style.display === "none") {
    y.style.display = "block";
    x.style.display = "none";
    z.style.display = "none";

  } else {
    z.style.display = "none";
    x.style.display = "none";
    y.style.display = "none";
  }
}
function myFunction3() {
  var x = document.getElementById("Vegan");
  var y = document.getElementById("Vegetarian");
  var z = document.getElementById("Non Vegetarian");
  
  if (z.style.display === "none") {
    z.style.display = "block";
    x.style.display = "none";
    y.style.display = "none";
  } 
   else {
    z.style.display = "none";
    x.style.display = "none";
    y.style.display = "none";
  }
}