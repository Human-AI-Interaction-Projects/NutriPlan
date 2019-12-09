//  ................................................................................
//  bakeoff2.index.js
//  javascript for index page of BakeOff2:
//  Written by: Daniel Fong, Mark Chen, Riyya Hari Iyer
//  Date Created: 10/15/2019
//  Last Modified: 11/27/2019
//  ................................................................................

/*  --- ---  */
// --- Initialization ---

// --- Variables ---

// --- Functions ---

// --- In-Use ---


/*  --- Website Header and Tabs ---  */
// --- Variables ---
var tabName = 'Food';
var tabColor = 'tomato';

// --- In-Use ---
openTab(tabName, tabColor) 



/*  --- Datepiacker ---  */
// --- Initialization ---
$(function() {
    $("#datepicker").datepicker();
});



/*  --- DataTable ---  */
// --- Initialization ---
$(document).ready(function() {
    $('#result-table').DataTable({
        "columnDefs": [{
            "targets": -1,
            "data": null,
            "defaultContent": "<button type=\"submit\" class=\"b_expand_food\"><i class=\"fas fa-angle-double-right\"></i></button>"
        }],
        "searching": false,
        "info": false
    }).clear().draw();

    $('#nutrition-facts').nutritionLabel({showLegacyVersion : false});
});


/*  --- Load Dislike Foods ---  */
// --- Variables ---
var foods_Dislike = [];

// --- Functions ---
function loadFoodsDislike() { 
    $.get("/food-dislike" + window.location.search, function(data){
        foods_Dislike = data["dislike"];
    });
}




/*  --- Nutrition Database Access ---  
 *  Nutritionix - Largest Verified Nutrition Database
 *  https://developer.nutritionix.com/docs/v2
 */
// --- Variables ---
var api_key = "5015be239c92535807bae011a26fbcd2";
var app_id = "8ea44c06";

// url for obtaining detailed nutrient breakdown of requested food(s)
var nutrient_url = "https://trackapi.nutritionix.com/v2/natural/nutrients";
// url for providing list of commonon foods to a search field     
var instant_url = "https://trackapi.nutritionix.com/v2/search/instant";         

var foods_onlineData = {};  // Data of multiple foods obtained from online database
var generatedTags = {};

// --- Functions ---
function searchFood(searchTerm) {
    var data_params = {
        "query" : searchTerm
    };
    var data_string = JSON.stringify(data_params);

    // jQuery.ajax() 
    // Perform an asynchronous HTTP (Ajax) request
    // https://api.jquery.com/jquery.ajax/
    $.ajax({
        type: "POST",
        url: nutrient_url,
        dataType: "json",
        contentType: "application/json",
        headers: {
            "x-app-id": app_id,
            "x-app-key": api_key,
            "x-remote-user-id": "0"
        },
        data: data_string,
        success: function(data){
            // save all data for use in populating nutrition facts
            // https://gist.github.com/mattsilv/7122853
            foods_onlineData = data["foods"]; 
            $("#table-search").DataTable().clear().draw();
            fillResultTable();
            alert("Success in obtaining information from database");
            //had to move this since ajax call is async, so need to do it like this
            var iter = 0;
            function sendRequestHelper(){
                if(iter < foods_onlineData.length){
                    let food = foods_onlineData[iter];
                    let food_localData_temp = addFoodToLocalDatabase(food);
                    iter++;
                    $.post('/food-database', food_localData_temp, sendRequestHelper, "json");
                }
            }
            sendRequestHelper();
        },
        error: function(xhr, status, error){
            alert("Failed to obtain information from database");
        }
    });
};

function fillResultTable() {
    $("#result-table").DataTable().clear().draw();
    for(let i = 0; i < foods_onlineData.length; i++){
        var food_array = foods_onlineData[i];
        var name = food_array["food_name"];
        var serving_size = food_array["serving_weight_grams"].toString();
        var calories = food_array["nf_calories"].toString();
        var carbohydrate = food_array["nf_total_carbohydrate"].toString();
        var protein = food_array["nf_protein"].toString();
        var fat = food_array["nf_total_fat"].toString();
        $("#result-table").DataTable().row.add([name, serving_size, calories, carbohydrate, protein, fat, "0"]).draw();
    };  
}

function addFoodToLocalDatabase(food) {

    function helperVitID(attribute_ID){
        for(let i = 0; i < food["full_nutrients"].length; i++) {
            if(attribute_ID == food["full_nutrients"][i]["attr_id"]){
                return food["full_nutrients"][i]["value"];
            }	
        }
        return "0"; //not found probably means zero amount
    }

    
    let serving = food["serving_weight_grams"];
    function helperNormalize(item){
        return Math.round((item * 100 / serving) * 100) / 100;
    }
    //create the food's nutrition dictionary object

    //first, normalize to 100g serving sizes
    var food_localData = {
        "name": food["food_name"],
        "serving": 100,
        "calories": helperNormalize(food["nf_calories"]),
        "carbohydrates": helperNormalize(food["nf_total_carbohydrate"]),
        "proteins": helperNormalize(food["nf_protein"]),
        "fats": helperNormalize(food["nf_total_fat"]),
        "iron": helperNormalize(helperVitID(303)),
        "vitaminD": helperNormalize(helperVitID(324)),
        "vitaminB12": helperNormalize(helperVitID(418)),
        "calcium": helperNormalize(helperVitID(301)),
        "magnesium": helperNormalize(helperVitID(304)),
    };
    
    var food_localData_original = {
        "name": food["food_name"],
        "serving": food["serving_weight_grams"],
        "calories": food["nf_calories"],
        "carbohydrates": food["nf_total_carbohydrate"],
        "proteins": food["nf_protein"],
        "fats": food["nf_total_fat"],
        "iron": helperVitID(303),
        "vitaminD": helperVitID(324),
        "vitaminB12": helperVitID(418),
        "calcium": helperVitID(301),
        "magnesium": helperVitID(304),
    };


    //next, try to determine tags
    let tags = [];

    if( ((food_localData["proteins"] * 4) > (0.4 * food_localData["calories"])) || (food_localData["proteins"] > 20)){
        tags.push("High Proteins");
    }
    else if( (food_localData["proteins"] * 4) < (0.2 * food_localData["calories"]) || (food_localData["proteins"] < 5)){
        tags.push("Low Proteins");
    }

    if( (food_localData["carbohydrates"] * 4) > (0.4 * food_localData["calories"]) || (food_localData["carbohydrates"] > 30)){
        tags.push("High Carbohydrates");
    }
    else if( (food_localData["carbohydrates"] * 4) < (0.2 * food_localData["calories"]) || (food_localData["proteins"] < 5)){
        tags.push("Low Carbohydrates");
    }

    if( (food_localData["fats"] * 9) > (0.4 * food_localData["calories"]) || (food_localData["fats"] > 20)){
        tags.push("High Fats");
    }
    else if( (food_localData["fats"] * 9) < (0.2 * food_localData["calories"]) || (food_localData["proteins"] < 5)){
        tags.push("Low Fats");
    }
    /*
    if( ((food_localData["proteins"] * 4) > (0.4 * food_localData["calories"])) ){
        tags.push("High Proteins");
    }
    else if( (food_localData["proteins"] * 4) < (0.2 * food_localData["calories"]) ){
        tags.push("Low Proteins");
    }

    if( (food_localData["carbohydrates"] * 4) > (0.4 * food_localData["calories"]) ){
        tags.push("High Carbohydrates");
    }
    else if( (food_localData["carbohydrates"] * 4) < (0.2 * food_localData["calories"]) ){
        tags.push("Low Carbohydrates");
    }

    if( (food_localData["fats"] * 9) > (0.4 * food_localData["calories"]) ){
        tags.push("High Fats");
    }
    else if( (food_localData["fats"] * 9) < (0.2 * food_localData["calories"]) ){
        tags.push("Low Fats");
    }
    */
    food_localData_original["tags"] = JSON.stringify(tags);
    generatedTags[food["food_name"]] = JSON.stringify(tags);
    return food_localData_original;
    //$.post('/food-database', food_localData, null, "json");
}

// --- In-Use ---
$('#index-search-icon').click(function() {
    searchFood($("#search-keyword").val());
});



/*  --- Nutrition Fact Board  --- */
// --- Variables ---
var food_mealData = {};   // Data of single food that will be added to user's meal history
var food_nutritionData = {};  // Data of single food that will be loaded to Nutrition Fact Label
var url_params = new URLSearchParams(window.location.search);
// --- Functions ---
//helper function for filling out nutrition table
function findVitaminValue(attribute_ID){
    for(let i = 0; i < food_nutritionData["full_nutrients"].length; i++) {
        if(attribute_ID == food_nutritionData["full_nutrients"][i]["attr_id"]){
            return food_nutritionData["full_nutrients"][i]["value"];
        }
    }
    return "0";
}

// --- In-Use ---
//Clicking column button to display data in nutrition label
$("#result-table tbody").on('click', 'button', function(){
    //Assuming we have already done database search, and populated row with data...

    //Grab data from row in table
    var row_data = $('#result-table').DataTable().row($(this).parents('tr')).data();

    //find correct food item in the saved data from when we populated the table
    for(let i = 0; i < foods_onlineData.length; i++){
        food_nutritionData = foods_onlineData[i];
        if(food_nutritionData["food_name"] == row_data[0]) { //found it, so break
            break;
        }
    }

    //food_mealData will contain user, and food name, meal time, meal date of food.
    if(url_params.has('user')){
        food_mealData["user"] = url_params.get('user');
    }
    else{
        food_mealData["user"] = "test";
    }
    food_mealData["name"] = row_data[0];
    food_mealData["serving"] = row_data[1];
    food_mealData["calories"] = row_data[2];
    food_mealData["carbohydrates"] = row_data[3];
    food_mealData["proteins"] = row_data[4];
    food_mealData["fats"] = row_data[5];
    food_mealData["iron"] = findVitaminValue(303);
    food_mealData["vitaminD"] = findVitaminValue(324);
    food_mealData["vitaminB12"] = findVitaminValue(418);
    food_mealData["calcium"] = findVitaminValue(301);
    food_mealData["magnesium"] = findVitaminValue(304);
    food_mealData["tags"] = generatedTags[row_data[0]];

    //food_nutritionData will contain important nutrition facts of food. Update nutrition label accordingly
    $('#nutrition-facts').nutritionLabel({
        itemName : food_nutritionData["food_name"],

        decimalPlacesForQuantityTextbox : 2,
        valueServingUnitQuantity : 1,

        allowFDARounding : true,
        decimalPlacesForNutrition : 1,

        showPolyFat : false,
        showMonoFat : false,

        //main nutrients
        valueCalories    : food_nutritionData["nf_calories"],
        valueTotalFat    : food_nutritionData["nf_total_fat"],
        valueSatFat      : food_nutritionData["nf_saturated_fat"],
        valueTransFat    : food_nutritionData["nf_trans_fatty_acid"],
        valueCholesterol : food_nutritionData["nf_cholesterol"],
        valueSodium      : food_nutritionData["nf_sodium"],
        valueTotalCarb   : food_nutritionData["nf_total_carbohydrate"],
        valueFibers      : food_nutritionData["nf_dietary_fiber"],
        valueSugars      : food_nutritionData["nf_sugars"],
        valueProteins    : food_nutritionData["nf_protein"],

        //additional nutrients -- determined by user preferences. Vitamin ID's can be found here: https://docs.google.com/spreadsheets/d/14ssR3_vFYrVAidDLJoio07guZM80SMR5nxdGpAX-1-A/edit#gid=0
        valueVitaminD       : findVitaminValue(324),
        valuePotassium_2018 : findVitaminValue(306),
        valueCalcium        : findVitaminValue(301),
        valueIron           : findVitaminValue(303),
        valueVitaminB12     : findVitaminValue(418),
        valueAddedSugars    : findVitaminValue(539),
        valueMagnesium      : findVitaminValue(304),

        //serving info
        valueServingWeightGrams : food_nutritionData["serving_weight_grams"],
        showLegacyVersion : false
    });
});

//Clicking add button to add to meal history
$('#food-add-icon').click(function() {
    food_mealData["meal"] = $("#meal-time").val();
    food_mealData["date"] = $("#datepicker").val();
    $.post("/food-log" + window.location.search, food_mealData, null, "json");
    alert("Sent Data to History");
});


//Example of autocomplete functionality
$( function() {
    var recentlyUsed = [
        "chicken",
        "rice"
    ];

    $("#search-keyword").autocomplete({
        source: recentlyUsed
    });
});