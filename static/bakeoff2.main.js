//	................................................................................
//  bakeoff2.main.js
//	javascript for common actions in BakeOff2:
//  Written by: Daniel Fong, Mark Chen, Riyya Hari Iyer
//  Date Created: 10/15/2019
//  Last Modified: 11/26/2019
//	................................................................................

function changeTab(tabName, color) {
    if (tabName == 'Food') window.location.href = 'index.html' + window.location.search;
    if (tabName == 'History') window.location.href = 'history.html' + window.location.search;
    if (tabName == 'Track') window.location.href = 'track.html' + window.location.search;
    if (tabName == 'Preference') window.location.href = 'preference.html' + window.location.search;
    if (tabName == 'Recipes') window.location.href = 'Recipes.html' + window.location.search;
}

function openTab(cityName, color) {
    // Hide all elements with class="tabcontent" by default */
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
    	tabcontent[i].style.display = "none";
        console.log(tabcontent[i])
    }
  
    // Remove the background color of all tablinks/buttons
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
    	tablinks[i].style.backgroundColor = "";
    }
  
    // Show the specific tab content
    document.getElementById(cityName).style.display = "block";
    console.log(document.getElementById(cityName));

    // Add the specific color to the button used to open the tab content
    var tabID = cityName + '-tab'
    document.getElementById(tabID).style.backgroundColor = color;
}





