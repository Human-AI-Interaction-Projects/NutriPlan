//	................................................................................
//  bakeoff2.track.js
//	javascript for track page of BakeOff2:
//  Written by: Daniel Fong, Mark Chen, Riyya Hari Iyer
//  Date Created: 10/15/2019
//  Last Modified: 12/03/2019
//	................................................................................

/*  --- ---  */
// --- Initialization ---

// --- Variables ---

// --- Functions ---

// --- In-Use ---


/*  --- Website Header and Tabs ---  */
// --- Variables ---
var tabName = 'Track';
var color = 'lightseagreen';

// --- In-Use ---
openTab(tabName, color) 


// Load the html elements of the web page before the local data
$(document).ready(function() {
    /*  --- Datepiacker ---  */
    // --- Initialization ---
    $("#datepicker").datepicker();

    /*  --- DataTable ---  */
    // https://datatables.net/forums/discussion/50691/how-to-use-columndefs-multiple-time-in-a-datatable
    // https://datatables.net/forums/discussion/43625/change-a-cells-css-based-on-a-different-cells-value
    // --- Initialization ---
    $('table.display').DataTable({
        "columnDefs": [
            {
                targets: -2,
                // https://datatables.net/reference/option/columns.render
                // https://datatables.net/forums/discussion/44145/showing-object-object-instead-of-showing-the-button-with-id-in-data-id-in-editor
            	render: function(data, type, full){
                    var data_array = data.split(",");
                    var return_string = ""
                    for (i = 0; i < data_array.length; i++) {
                        return_string += "<label class=\""+ data_array[i] + "\">" + data_array[i] + "</label><br><div style=\"margin-top: 4px\"></div>";
                    }
                    return return_string;
                    //return ("<label class=\""+ data_array[0] + "\">" + data_array[0] + "</label><br><div style=\"margin-top: 4px\"></div><label class=\"label_carbs\">" + data_array[1] + "</label><br><div style=\"margin-top: 4px\"></div><label class=\"label_fat\">" + data_array[2] + "</label>");
                }
            },
            {
                    "targets": -1,
                    "data": null,
                    "defaultContent": "<button type=\"submit\" class=\"b_add_food\"><i class=\"fas fa-angle-double-left\"></i></button><button type=\"submit\" class=\"b_remove_food\"><i class=\"fas fa-angle-double-right\"></i></button></input><button class=\"b_remove_item\"><i class=\"fas fa-trash-alt\"></i></button>",
            }
        ],
        "searching": false,
        "paging": false,
        "info": false
    })  //Default clear the table until filled
    .clear().draw();
    // $('table.display').DataTable().row.add([0, 0, 0]).draw(); 
    
    // Initialize a Chart
    // https://www.chartjs.org/docs/latest/getting-started/usage.html
    makeNutritionChart("Line Plot");
});



/*  --- Load Local Food Database ---  */
// --- Variables ---
var foods_localData = [];

// --- Functions ---
function loadLocalFoodDatabase() {
       
    $.get("/food-database", function(data){
        foods_localData = data;
    });
}

// --- In-Use ---
loadLocalFoodDatabase();





/*  --- Load Diet Profile ---  */
// --- Variables ---
var userDietProfile = {};

// --- Functions ---
function loadDietProfile() {
    $.get("/food-pref", function(data){
        userDietProfile = data["plan"];

        if (data["plan"] != null) {
            dailyPlan_calories = parseFloat(data["plan"]["plan_calories"]);
            dailyPlan_carbohydrates = parseFloat(data["plan"]["plan_carbohydrates"]);
            dailyPlan_proteins  = parseFloat(data["plan"]["plan_proteins"]); 
            dailyPlan_fats = parseFloat(data["plan"]["plan_fats"]);
            aiFood_required_condition = data["plan"]["required_condition"]; 
            aiFood_required_nutrient = data["plan"]["required_nutrient"];

            $("#suggest-cutoff-conditions").val(data["plan"]["required_condition"]);
            $("#suggest-cutoff-nutrients").val(data["plan"]["required_nutrient"]);
        }
        
    });

}

// --- In-Use ---
loadDietProfile();




/*  --- Load Dislike Foods ---  */
// --- Variables ---
var foods_Dislike = [];

// --- Functions ---
function loadFoodsDislike() { 
    $.get("/food-dislike" + window.location.search, function(data){
        foods_Dislike = data["dislike"];
    });
}




/*  --- Nutrition Chart Report ---  */
// --- Variables ---
// From User Diet Profile:
var dailyPlan_calories = 0; 
var dailyPlan_carbohydrates = 0; 
var dailyPlan_proteins = 0;  
var dailyPlan_fats = 0;  

var aiFood_required_condition = "";
var aiFood_required_nutrient = "";
var aiFoods_passed = [];

// From User Food Log:
var user = "";
var foods_breakfast = [];
var foods_lunch = [];
var foods_dinner = [];

var allMeals_calories = 0;
var allMeals_carbohydrates = 0;
var allMeals_proteins = 0;
var allMeals_fats = 0;

var breakfast_calories = 0;
var breakfast_carbohydrates = 0;
var breakfast_proteins = 0;
var breakfast_fats = 0;

var lunch_calories = 0;
var lunch_carbohydrates = 0;
var lunch_proteins = 0;
var lunch_fats = 0;

var dinner_calories = 0;
var dinner_carbohydrates = 0;
var dinner_proteins = 0;
var dinner_fats = 0;



// For Nutrition Chart:
// 10 Chart.js example charts to get you started:
// https://tobiasahlin.com/blog/chartjs-charts-to-get-you-started/
var chart_box = document.getElementById('chart-type');
var ctx = document.getElementById('nutrition-chart').getContext('2d');
var nutritionChart;

var line_data = {
    labels: ["After Breakfast", " After Lunch", "After Dinner"],
    datasets: [
        {
            label: 'Calories [kcal]',
            data: [0, 0, 0],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: false,
            lineTension: 0
     }, {
            label: 'Carbohydrate [g]',
            data: [0, 0, 0],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
            lineTension: 0
     }, {
            label: 'Protein [g]',
            data: [0, 0, 0],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            fill: false,
            lineTension: 0
     }, {
            label: 'Fat [g]',
            data: [0, 0, 0],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            fill: false,
            lineTension: 0
    }]
};

var line_options = {
    responsive: true,
    maintainAspectRatio: false,
    title: {
        display: true,
        text: 'Macronutrients Intake',
        fontSize: 16
    },
    scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true,
                      suggestedMin: 0,
                      suggestedMax: 250,
                      stepSize: 100
                  },
                  scaleLabel: {
                       display: true,
                  }
              }]            
          }  
  };


var bar_data = {
    labels: ["Calories [kcal]", "Carbohydrate [g]", "Protein [g]", "Fat [g]"],
    datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
        ]
      }]
};

var bar_options = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
        display: false
    },
    title: {
        display: true,
        text: 'Macronutrients Intake',
        fontSize: 16
    },
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true,
                suggestedMin: 0,
                suggestedMax: 250,
                stepSize: 100
            },
            scaleLabel: {
                display: true,
            }
        }]            
    },
    // https://github.com/chartjs/chartjs-plugin-annotation
    // https://www.npmjs.com/package/chartjs-plugin-annotation
    annotation: {
        annotations: [],
        drawTime: "afterDraw" // (default)
    }
  };

  var pie_data = {
    labels: [/*"Calories [kcal]",*/ "Carbohydrate [kcal]", "Protein [kcal]", "Fat [kcal]"],
    datasets: [{
        data: [0, 0, 0],
        backgroundColor: [
            // 'rgba(255, 99, 132, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: [
            // 'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
        ]
      }]
  };

var pie_options = {
    responsive: true,
    maintainAspectRatio: false,
    title: {
        display: true,
        text: 'Macronutrients Intake',
        fontSize: 16
    }
};


// --- Functions ---
function makeNutritionChart(chart) {
    if (chart_box.value == 'Line Plot' || chart == 'Line Plot') {
        if (window.nutritionChart) window.nutritionChart.destroy();
        nutritionChart = new Chart(ctx, {
            type: 'line',
            data: line_data,
            options: line_options
        });
    }

    if (chart_box.value == 'Bar Graph' || chart == 'Bar Graph') {
        if (window.nutritionChart) window.nutritionChart.destroy();
        nutritionChart = new Chart(ctx, {
            type: 'bar',
            data: bar_data,
            options: bar_options
        });
    }

    if (chart_box.value == 'Pie Chart' || chart == 'Pie Chart') {
        if (window.nutritionChart) window.nutritionChart.destroy();
        nutritionChart = new Chart(ctx, {
            type: 'pie',
            data: pie_data,
            options: pie_options
        });
    }
}

function getNewCalories(chartType){
    if (chartType == "Line Plot") {
        return ([breakfast_calories, breakfast_calories + lunch_calories, 
            breakfast_calories + lunch_calories + dinner_calories  + getAdded("calories")]);
    }

    if (chartType == 'Bar Graph' || chartType == 'Pie Chart') {
        return (breakfast_calories + lunch_calories + dinner_calories + getAdded("calories"));
    }
    return null;
}

function getNewCarbohydrates(chartType){
    if (chartType == "Line Plot") {
        return ([breakfast_carbohydrates, breakfast_carbohydrates + lunch_carbohydrates, 
            breakfast_carbohydrates + lunch_carbohydrates + dinner_carbohydrates + getAdded("carbohydrates")]);
    }
    if (chartType == 'Bar Graph') {
        return (breakfast_carbohydrates + lunch_carbohydrates + dinner_carbohydrates + getAdded("carbohydrates"));
    }
    if (chartType == 'Pie Chart') {
        return ((breakfast_carbohydrates + lunch_carbohydrates + dinner_carbohydrates + getAdded("carbohydrates")) * 4);
    }
    return null;
}

function getNewProteins(chartType){
    if (chartType == "Line Plot") {
        return ([breakfast_proteins, breakfast_proteins + lunch_proteins, 
            breakfast_proteins + lunch_proteins + dinner_proteins  + getAdded("proteins")]);
    }
    if (chartType == 'Bar Graph') {
        return (breakfast_proteins + lunch_proteins + dinner_proteins + getAdded("proteins"));
    }
    if (chartType == 'Pie Chart') {
        return ((breakfast_proteins + lunch_proteins + dinner_proteins + getAdded("proteins")) * 4);
    }
    return null;
}

function getNewFats(chartType){
    if (chartType == "Line Plot") {
        return ([breakfast_fats, breakfast_fats + lunch_fats, 
            breakfast_fats + lunch_fats + dinner_fats  + getAdded("fats")]);
    }
    if (chartType == 'Bar Graph') {
        return (breakfast_fats + lunch_fats + dinner_fats + getAdded("fats"));
    }
    if (chartType == 'Pie Chart') {
        return ((breakfast_fats + lunch_fats + dinner_fats + getAdded("fats")) * 9);
    }
    return null;
}


function bar_getNewTargetLine(targetValue, targetColor) {
    targetLine = {
        type: 'line',
        mode: 'horizontal',
        scaleID: 'y-axis-0',
        value: targetValue,
        borderColor: targetColor,
        borderWidth: 1,
        borderDash: [2, 2],
        label: {
            enabled: true,
            position: "left",
            content: "Target: " + targetValue 
        }
    }
    return targetLine
}


// --- In-Use ---
$("#track-search-icon").click(function(){
    var aiFood_query = {
        "condition": aiFood_required_condition,
        "nutrient": aiFood_required_nutrient
    }

    $.post("/food-tag-query" + window.location.search, aiFood_query, function(data) {
        aiFoods_passed = data["selected_foods"];
        console.log(data["selected_foods"]);
    }, "json");

    $.get("/food-log" + window.location.search, function(data){
        // Get the selected day's Food Log
        var sel_date = $("#datepicker").val()
        user = data["user"];
        foods_breakfast = data[sel_date]["Breakfast"];
        foods_lunch = data[sel_date]["Lunch"];
        foods_dinner = data[sel_date]["Dinner"];
        

        /* Compute calories and nutrients for Nutrition Chart */
        allMeals_calories = 0;
        allMeals_carbohydrates = 0;
        allMeals_proteins = 0;
        allMeals_fats = 0;

        // Process breakfast data
        breakfast_calories = 0;
        breakfast_carbohydrates = 0;
        breakfast_proteins = 0;
        breakfast_fats = 0;
        
        for(i = 0; i < foods_breakfast.length; i++){
            var food_nutrition = foods_breakfast[i];
            breakfast_calories += parseFloat(food_nutrition["calories"]);
            breakfast_carbohydrates += parseFloat(food_nutrition["carbohydrates"]);
            breakfast_proteins += parseFloat(food_nutrition["proteins"]);
            breakfast_fats += parseFloat(food_nutrition["fats"]);
        };

        allMeals_calories += breakfast_calories;
        allMeals_carbohydrates += breakfast_carbohydrates;
        allMeals_proteins += breakfast_proteins;
        allMeals_fats += breakfast_fats;

        // Process lunch data
        lunch_calories = 0;
        lunch_carbohydrates = 0;
        lunch_proteins = 0;
        lunch_fats = 0;
        
        for(i = 0; i < foods_lunch.length; i++){
            var food_nutrition = foods_lunch[i];
            lunch_calories += parseFloat(food_nutrition["calories"]);
            lunch_carbohydrates += parseFloat(food_nutrition["carbohydrates"]);
            lunch_proteins += parseFloat(food_nutrition["proteins"]);
            lunch_fats += parseFloat(food_nutrition["fats"]);
        };

        allMeals_calories += lunch_calories;
        allMeals_carbohydrates += lunch_carbohydrates;
        allMeals_proteins += lunch_proteins;
        allMeals_fats += lunch_fats;

        // Process dinner data
        dinner_calories = 0;
        dinner_carbohydrates = 0;
        dinner_proteins = 0;
        dinner_fats = 0;
        
        for(i = 0; i < foods_dinner.length; i++){
            var food_nutrition = foods_dinner[i];
            dinner_calories += parseFloat(food_nutrition["calories"]);
            dinner_carbohydrates += parseFloat(food_nutrition["carbohydrates"]);
            dinner_proteins += parseFloat(food_nutrition["proteins"]);
            dinner_fats += parseFloat(food_nutrition["fats"]);
        };

        allMeals_calories += dinner_calories;
        allMeals_carbohydrates += dinner_carbohydrates;
        allMeals_proteins += dinner_proteins;
        allMeals_fats += dinner_fats;

        updateNutritionCharts();


        //clear all meal tables
        $('table.display').DataTable().clear().draw();

        // Call AI for Food Suggestion
        var aiFoods_selected = foods_SuggestionByAI(aiFoods_passed, aiFood_query);

        for (var i = 0; i < aiFoods_selected.length; i++) {
            aiFood_selected_tags_string = aiFoods_selected[i]["tags"].join();

            $("#table-suggest").DataTable().row.add([aiFoods_selected[i]["name"], aiFoods_selected[i]["serving"],
            aiFoods_selected[i]["calories"], aiFoods_selected[i]["carbohydrates"], 
            aiFoods_selected[i]["proteins"], aiFoods_selected[i]["fats"],
            aiFood_selected_tags_string]).draw();

            //console.log("print one row");

        }

        // style food tags
        // https://api.jquery.com/contains-selector/
        $("label:contains('Good Food')").css( "background-color", "lightseagreen" );
        $("label:contains('Bad Food')").css( "background-color", "tomato" );

        $("label:contains('High Proteins')").css( "background-color", "darkorange" );
        $("label:contains('High Proteins')").css( "color", "white");
        $("label:contains('High Proteins')").css( "padding", "5px");
        $("label:contains('High Proteins')").css( "display", "inline-block");
        $("label:contains('High Proteins')").css( "width", "100px");

        $("label:contains('Low Carbohydrates')").css( "background-color", "skyblue" );
        $("label:contains('Low Carbohydrates')").css( "color", "white");
        $("label:contains('Low Carbohydrates')").css( "padding", "5px");
        $("label:contains('Low Carbohydrates')").css( "display", "inline-block");
        $("label:contains('Low Carbohydrates')").css( "width", "120px");

        $("label:contains('Low Fats')").css( "background-color", "skyblue" );
        $("label:contains('Low Fats')").css( "color", "white");
        $("label:contains('Low Fats')").css( "padding", "5px");
        $("label:contains('Low Fats')").css( "display", "inline-block");
        $("label:contains('Low Fats')").css( "width", "100px");

        $("label:contains('Low Proteins')").css( "background-color", "skyblue" );
        $("label:contains('Low Proteins')").css( "color", "white");
        $("label:contains('Low Proteins')").css( "padding", "5px");
        $("label:contains('Low Proteins')").css( "display", "inline-block");
        $("label:contains('Low Proteins')").css( "width", "100px");

        $("label:contains('High Carbohydrates')").css( "background-color", "darkorange" );
        $("label:contains('High Carbohydrates')").css( "color", "white");
        $("label:contains('High Carbohydrates')").css( "padding", "5px");
        $("label:contains('High Carbohydrates')").css( "display", "inline-block");
        $("label:contains('High Carbohydrates')").css( "width", "120px");

        $("label:contains('High Fats')").css( "background-color", "darkorange" );
        $("label:contains('High Fats')").css( "color", "white");
        $("label:contains('High Fats')").css( "padding", "5px");
        $("label:contains('High Fats')").css( "display", "inline-block");
        $("label:contains('High Fats')").css( "width", "100px");



        alert("Data was retrieved for user: " + user);
    });
});

function updateNutritionCharts(){
    // Update nutritionChart datas
    line_data.datasets[0].data = getNewCalories("Line Plot");
    line_data.datasets[1].data = getNewCarbohydrates("Line Plot");
    line_data.datasets[2].data = getNewProteins("Line Plot");
    line_data.datasets[3].data = getNewFats("Line Plot");
    bar_data.datasets[0].data[0] = getNewCalories("Bar Graph");
    bar_data.datasets[0].data[1] = getNewCarbohydrates("Bar Graph");
    bar_data.datasets[0].data[2] = getNewProteins("Bar Graph");
    bar_data.datasets[0].data[3] = getNewFats("Bar Graph");
    // bar_options.annotation.annotations[0] = bar_getNewTargetLine(plan_calories, "rgb(255, 99, 132)");
    // bar_options.annotation.annotations[1] = bar_getNewTargetLine(plan_carbohydrates, "rgb(75, 192, 192)");
    // bar_options.annotation.annotations[2] = bar_getNewTargetLine(plan_proteins, "rgb(54, 162, 235)");
    // bar_options.annotation.annotations[3] = bar_getNewTargetLine(plan_fats, "rgb(255, 206, 86)");
    pie_data.datasets[0].data[0] = getNewCarbohydrates("Pie Chart");
    pie_data.datasets[0].data[1] = getNewProteins("Pie Chart");
    pie_data.datasets[0].data[2] = getNewFats("Pie Chart");


    // Update the display of Nutrition Chart
    if (chart_box.value == 'Line Plot') {
        nutritionChart.data.datasets[0].data = getNewCalories("Line Plot");          
        nutritionChart.data.datasets[1].data = getNewCarbohydrates("Line Plot");
        nutritionChart.data.datasets[2].data = getNewProteins("Line Plot");
        nutritionChart.data.datasets[3].data = getNewFats("Line Plot");
    }       

    if (chart_box.value == 'Bar Graph') {
        nutritionChart.data.datasets[0].data[0] = getNewCalories(chart_box.value);
        nutritionChart.data.datasets[0].data[1] = getNewCarbohydrates(chart_box.value);
        nutritionChart.data.datasets[0].data[2] = getNewProteins(chart_box.value);
        nutritionChart.data.datasets[0].data[3] = getNewFats(chart_box.value);

        // nutritionChart.options.annotation.annotations[0] = bar_getNewTargetLine(plan_calories, "rgb(255, 99, 132)");
        // nutritionChart.options.annotation.annotations[1] = bar_getNewTargetLine(plan_carbohydrates, "rgb(75, 192, 192)");
        // nutritionChart.options.annotation.annotations[2] = bar_getNewTargetLine(plan_proteins, "rgb(54, 162, 235)");
        // nutritionChart.options.annotation.annotations[3] = bar_getNewTargetLine(plan_fats, "rgb(255, 206, 86)");
    } 

    if (chart_box.value == 'Pie Chart') {
        nutritionChart.data.datasets[0].data[0] = getNewCarbohydrates(chart_box.value);
        nutritionChart.data.datasets[0].data[1] = getNewProteins(chart_box.value);
        nutritionChart.data.datasets[0].data[2] = getNewFats(chart_box.value);
    }   

    nutritionChart.update();
}


$("#table-suggest").on('click', 'label', function () {
    var cell_row = $(this).parents('tr');
    var food_of_cell = $("#table-suggest").DataTable().cell(cell_row, 0).data();
    var cell_data = $("#table-suggest").DataTable().cell(cell_row, -2).data();
    var cell_data_array = cell_data.split(",");

    if ($(this).attr("class") == "High Carbohydrates"){
        //https://stackoverflow.com/questions/19438895/add-a-new-line-in-innerhtml
        document.getElementById("track-alert").innerHTML =  food_of_cell + " has " + "High Carbohydrates" + " because:" + "<br />";
        document.getElementById("track-alert").innerHTML += "• " + food_of_cell + 
            " carbohydrates accounts for more than 40% of calories";
    }

    if ($(this).attr("class") == "High Proteins"){
        //https://stackoverflow.com/questions/19438895/add-a-new-line-in-innerhtml
        document.getElementById("track-alert").innerHTML =  food_of_cell + " has " + "High Proteins" + " because:" + "<br />";        
        document.getElementById("track-alert").innerHTML += "• " + food_of_cell + 
            " proteins accounts for more than 40% of calories";
    }
    
    if ($(this).attr("class") == "High Fats"){
        //https://stackoverflow.com/questions/19438895/add-a-new-line-in-innerhtml
        document.getElementById("track-alert").innerHTML =  food_of_cell + " has " + "High Fats" + " because:" + "<br />";   
        document.getElementById("track-alert").innerHTML += "• " + food_of_cell + 
            " fats accounts for more than 40% of calories";
    }

    if ($(this).attr("class") == "Low Carbohydrates"){
        //https://stackoverflow.com/questions/19438895/add-a-new-line-in-innerhtml
        document.getElementById("track-alert").innerHTML =  food_of_cell + " has " + "Low Carbohydrates" + " because:" + "<br />"; 
        document.getElementById("track-alert").innerHTML += "• " + food_of_cell + 
            " carbohydrates accounts for less than 20% of calories";

    }

    if ($(this).attr("class") == "Low Proteins"){
        //https://stackoverflow.com/questions/19438895/add-a-new-line-in-innerhtml
        document.getElementById("track-alert").innerHTML =  food_of_cell + " has " + "Low Proteins" + " because:" + "<br />";
        document.getElementById("track-alert").innerHTML += "• " + food_of_cell + 
            " proteins accounts for less than 20% of calories";
    }

    if ($(this).attr("class") == "Low Fats"){
        //https://stackoverflow.com/questions/19438895/add-a-new-line-in-innerhtml
        document.getElementById("track-alert").innerHTML =  food_of_cell + " has " + "Low Fats" + " because:" + "<br />";
        document.getElementById("track-alert").innerHTML += "• " + food_of_cell + 
            " fats accounts for less than 20% of calories";
    }

} );




/*  --- Food Suggestion Criteria Planner ---  */
// --- In-Use ---
$("#food-suggest-cutoff-button").click(function() {
    // Update user's diet profile object
    userDietProfile["required_condition"] = $("#suggest-cutoff-conditions").val();
    userDietProfile["required_nutrient"] = $("#suggest-cutoff-nutrients").val();

    aiFood_required_condition = $("#suggest-cutoff-conditions").val();
    aiFood_required_nutrient = $("#suggest-cutoff-nutrients").val();

    $.post("/food-pref", userDietProfile, null, "json");

    alert("Suggestion Criteria Saved!");
});


/* ----------------------------------------------------------------------- */



/*  --- Add, Remove, Delete Suggested Foods ---  */
// --- Variables ---
var addedFoods = [];
var addedFoods_names = [];
// --- Functions ---
function getAdded(nutrient){
    let added = 0;
    for(let i = 0; i<addedFoods.length; i++){
        added = added + parseFloat(addedFoods[i][nutrient]);
    }
    return added;
}

function updateExtraFood(){

    var extraFood_string = addedFoods_names.join();

    document.getElementById("extra-food").innerHTML = "Additional Foods from AI Food Suggestions:" + "<br />"; 
    document.getElementById("extra-food").innerHTML += extraFood_string;
}

// --- In-Use ---
$("#table-suggest tbody").on('click', 'button.b_add_food', function(){
    // this.disabled = true;
    let data = $("#table-suggest").DataTable().row($(this).parents('tr')).data();
    let name = data[0];
    let food = {};

    for(let i = 0; i < foods_localData.length; i++){
        if(name == foods_localData[i]["name"]){
            food = foods_localData[i];
            break;
        }
    }
    addedFoods.push(food);
    addedFoods_names.push(food["name"]);
    updateNutritionCharts();
    updateExtraFood();
});


$("#table-suggest tbody").on('click', 'button.b_remove_food', function(){
    let data = $("#table-suggest").DataTable().row($(this).parents('tr')).data();
    let name = data[0];
    let food = {};

    for(let i = 0; i < addedFoods.length; i++){
        if(name == addedFoods[i]["name"]){
            addedFoods.splice(i, 1);
            addedFoods_names.splice(addedFoods_names.indexOf(name), 1);
            break;
        }
    }
    updateNutritionCharts();
    updateExtraFood();
});


/*  --- Collect User Dislike Foods from suggestions ---  */
$("#table-suggest tbody").on('click', 'button.b_remove_item', function(){
    var data = $("#table-suggest").DataTable().row($(this).parents('tr')).data();
    var my_data = {"user": "test",
        "dislike": data[0]
    };
    $("#table-suggest").DataTable().row($(this).parents('tr')).remove().draw();
    $.post("/food-dislike" + window.location.search, my_data, null, "json");
});
