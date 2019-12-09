//	................................................................................
//  bakeoff2.preference.js
//	javascript for User Preference page of BakeOff2:
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
var tabName = 'Preference';
var color = 'dodgerblue';

// --- In-Use ---
openTab(tabName, color) 


// Load the html elements of the web page before the local data
$(document).ready(function() {
    $("#slider-user-carbohydrates").slider({
        max: 100,
        min: 0,
        step: 1,
        slide: function(event, ui){
            var calories = $("#dri-calories").val();
            calories = Math.round(calories);
            var percentage = ui.value;
            
            dailyPlan_carbohydrates = Math.round(percentage * 0.01 * calories / 4);
            $("#user-carbohydrates").val(dailyPlan_carbohydrates);
            dailyPlan_calories = Math.round((4 * dailyPlan_carbohydrates + 4 * dailyPlan_proteins + 9 * dailyPlan_fats) / 10) * 10;
            $("#user-calories").val(dailyPlan_calories);
        }
    });
 
    $("#slider-user-proteins").slider({
        max: 100,
        min: 0,
        step: 1,
        slide: function(event, ui){
            var calories = $("#dri-calories").val();
            calories = Math.round(calories);
            var percentage = parseInt(ui.value);

            dailyPlan_proteins = Math.round(percentage * 0.01 * calories / 4);
            $("#user-proteins").val(dailyPlan_proteins);
            dailyPlan_calories = Math.round((4 * dailyPlan_carbohydrates + 4 * dailyPlan_proteins + 9 * dailyPlan_fats) / 10) * 10;
            $("#user-calories").val(dailyPlan_calories);
        },
    });

    $("#slider-user-fats").slider({
        max: 100,
        min: 0,
        step: 1,
        slide: function(event, ui){
            var calories = $("#dri-calories").val();
            calories = Math.round(calories);
            var percentage = ui.value;

            dailyPlan_fats = Math.round(percentage * 0.01 * calories / 9);
            $("#user-fats").val(dailyPlan_fats);
            dailyPlan_calories = Math.round((4 * dailyPlan_carbohydrates + 4 * dailyPlan_proteins + 9 * dailyPlan_fats) / 10) * 10;
            $("#user-calories").val(dailyPlan_calories);
        }
    });

    $('#rules-table').DataTable({
        "columnDefs": [{
            "targets": -1,
            "data": null,
            "defaultContent": "<button type=\"submit\" id=\"b_expand_food\"><i class=\"fas fa-trash-alt\"></i></button>"
        }],
        "searching": false,
        "info": false
    }).clear().draw();
});





/*  --- Load Diet Profile ---  */
// --- Variables ---
var userDietProfile = {};

// --- Functions ---
function loadDietProfile() {
    $.get("/food-pref", function(data){
        userDietProfile = data["plan"];

        if (data["plan"] != null) {
            $("#dri-calories").val(data["plan"]["target_calories"]);
            $("#age").val(data["plan"]["age"]);
            $("#height").val(data["plan"]["height"]);
            $("#weight").val(data["plan"]["weight"]);    
            $("#sex").val(data["plan"]["sex"]);
            $("#activity").val(data["plan"]["activity_level"]);

            $("#user-calories").val(data["plan"]["plan_calories"]);
            $("#user-carbohydrates").val(data["plan"]["plan_carbohydrates"]);
            $("#user-proteins").val(data["plan"]["plan_proteins"]);
            $("#user-fats").val(data["plan"]["plan_fats"]);

            $("#cutoff-calories").val(data["plan"]["cutoff_calories"]);
            $("#cutoff-carbohydrates").val(data["plan"]["cutoff_carbohydrates"]);
            $("#cutoff-proteins").val(data["plan"]["cutoff_proteins"]);
            $("#cutoff-fats").val(data["plan"]["cutoff_fats"]);
            $("#cutoff-iron").val(data["plan"]["cutoff_iron"]);
            $("#cutoff-calcium").val(data["plan"]["cutoff_calcium"]);
            $("#cutoff-magnesium").val(data["plan"]["cutoff_magnesium"]);
            $("#cutoff-vitaminD").val(data["plan"]["cutoff_vitaminD"]);
            $("#cutoff-vitaminB12").val(data["plan"]["cutoff_vitaminB12"]);
            $("#suggest-cutoff-conditions").val(data["plan"]["required_condition"]);
            $("#suggest-cutoff-nutrients").val(data["plan"]["required_nutrient"]);


            userAge = $("#age").val();
            userHeight = $("#height").val();
            userWeight = $("#weight").val();    
            userSex = $("#sex").val();
            userActivityLevel = $("#activity").val();
            
            dailyTarget_calories = $("#dri-calories").val();
            dailyPlan_calories = $("#user-calories").val();
            dailyPlan_carbohydrates = $("#user-carbohydrates").val();
            dailyPlan_proteins = $("#user-proteins").val();
            dailyPlan_fats = $("#user-fats").val();
        
            userFood_calories_cutoff = $("#cutoff-calories").val();
            userFood_carbohydrate_cutoff = $("#cutoff-carbohydrates").val();
            userFood_protein_cutoff = $("#cutoff-proteins").val();
            userFood_fat_cutoff = $("#cutoff-fats").val();
            userFood_iron_cutoff = $("#cutoff-iron").val();
            userFood_calcium_cutoff = $("#cutoff-calcium").val();
            userFood_magnesium_cutoff = $("#cutoff-magnesium").val();
            userFood_vitaminD_cutoff = $("#cutoff-vitaminD").val();
            userFood_vitaminB12_cutoff = $("#cutoff-vitaminB12").val();
        
            aiFood_required_condition = $("#suggest-cutoff-conditions").val();
            aiFood_required_nutrient = $("#suggest-cutoff-nutrients").val();


            $("#slider-user-carbohydrates").slider("value", Math.round(data["plan"]["plan_carbohydrates"] * 4 / data["plan"]["target_calories"] * 100) );
            $("#slider-user-proteins").slider("value", Math.round(data["plan"]["plan_proteins"] * 4 / data["plan"]["target_calories"]* 100) );
            $("#slider-user-fats").slider("value", Math.round(data["plan"]["plan_fats"] * 9 / data["plan"]["target_calories"] * 100) );
        }
    });
}

// --- In-Use ---
loadDietProfile();




/*  --- Daily Reference Intake Planner ---  */
// Dietary Reference Intakes: The Essential Guide to Nutrient Requirements (2006)
// https://www.nap.edu/read/11537/chapter/8
// http://www.nationalacademies.org/hmd/~/media/Files/Activity%20Files/Nutrition/DRI-Tables/8_Macronutrient%20Summary.pdf

// --- Variables ---
var userSex = "";
var userAge = 0;
var userHeight = 0;
var userWeight = 0;
var userActivityLevel = "";

var dailyTarget_calories = 0;
var dailyPlan_calories = 0; 
var dailyPlan_carbohydrates = 0; 
var dailyPlan_proteins = 0;  
var dailyPlan_fats = 0;  

var userFood_calories_cutoff = 99999;  // initialize to a very large number for case where user not set cutoff
var userFood_carbohydrate_cutoff = 99999;
var userFood_protein_cutoff = 99999;
var userFood_fat_cutoff = 99999;
var userFood_iron_cutoff = 99999;
var userFood_calcium_cutoff = 99999;
var userFood_magnesium_cutoff = 99999;
var userFood_vitaminD_cutoff = 99999;
var userFood_vitaminB12_cutoff = 99999;
var aiFood_required_condition = "";
var aiFood_required_nutrient = "";



// --- Functions ---
function calculateCalories_EER() {
    // EER for ages 0 to 2
    if (userAge == 0) {
        return Math.round(((89 * userWeight) - 100) + 68.75);
    }
    if (userAge <= 2) {
        return Math.round(((89 * userWeight) - 100) + 20.00);
    }

    // Get PA coefficient
    var userPA;
    if (userActivityLevel == "Sedentary") userPA = 1.00;
    if (userActivityLevel == "Low Active") {
        if (userSex == "Male") {
            userPA = (userAge <= 18 ? 1.13 : 1.11);
        }
        if (userSex == "Female") {
            userPA = (userAge <= 18 ? 1.16 : 1.12);
        }
    }

    if (userActivityLevel == "Active") {
        if (userSex == "Male") {
            userPA = (userAge <= 18 ? 1.26 : 1.25);
        }
        if (userSex == "Female") {
            userPA = (userAge <= 18 ? 1.31 : 1.27);
        }
    }

    if (userActivityLevel == "Very Active") {
        if (userSex == "Male") {
            userPA = (userAge <= 18 ? 1.42 : 1.48);
        }
        if (userSex == "Female") {
            userPA = (userAge <= 18 ? 1.56 : 1.45);
        }
    }

    // EER for ages 3 to 18
    if (userAge <= 8) {
        if (userSex == "Male") {
            return Math.round(88.5 - (61.9 * userAge) + (userPA * 
                ((26.7 * userWeight) + (903 * userHeight))) + 20);
        }
        if (userSex == "Female") {
            return Math.round(135.3 - (30.8 * userAge) + (userPA * 
                ((10.0 * userWeight) + (934 * userHeight))) + 20);
        }
    }

    if (userAge <= 18) {
        if (userSex == "Male") {
            return Math.round(88.5 - (61.9 * userAge) + (userPA * 
                ((26.7 * userWeight) + (903 * userHeight))) + 25);
        }
        if (userSex == "Female") {
            return Math.round(135.3 - (30.8 * userAge) + (userPA * 
                ((10.0 * userWeight) + (934 * userHeight))) + 25);
        }
    }
    
    // EER for ages 19+
    if (userAge > 18) {
        if (userSex == "Male") {
            return Math.round(662 - (9.53 * userAge) + (userPA * 
                ((15.91 * userWeight) + (539.6 * userHeight))));
        }
        if (userSex == "Female") {
            return Math.round(354 - (6.91 * userAge) + (userPA * 
                ((9.36 * userWeight) + (726 * userHeight)))) ;
        }
    }

}

function calculateCarbohydrate() {
    // 1 gram carbohydrate gives 4 calories

    // Carbohydrate for all ages 
    // Account for 45% to 65% of EER --> use 50% so it adds to 100%
    return Math.round(0.50 * dailyTarget_calories / 4);
}

function calculateProtein() {
    // 1 gram protein gives 4 calories

    // Protein for ages 0 to 3:
    // Account for 5% to 20% of EER (extrapolated)--> use 15%
    if (userAge <= 3) {
        return Math.round(0.15 * dailyTarget_calories / 4);
    }

    // Protein for ages 4 to 18
    // Account for 10% to 30% of EER --> use 20%
    else if (userAge <= 18) {
        return Math.round(0.2 * dailyTarget_calories / 4);
    }

    // Protein for ages 19+
    // Account for 10% to 35% of EER --> use 22.5%
    else if (userAge > 18) {
        return Math.round(0.225 * dailyTarget_calories / 4);
    }
}

function calculateFat() {
    // 1 gram fat gives 9 calories

    // Fat for ages 0 to 3:
    // Account for 30% to 40% of EER (extrapolated)--> use 35%
    if (userAge <= 3) {
        return Math.round(0.35 * dailyTarget_calories / 9);
    }

    // Fat for ages 4 to 18
    // Account for 25% to 35% of EER --> use 30%
    else if (userAge <= 18) {
        return Math.round(0.3 * dailyTarget_calories / 9);
    }

    // Fat for ages 19+
    // Account for 20% to 35% of EER --> use 27.5%
    else if (userAge > 18) {
        return Math.round(0.275 * dailyTarget_calories / 9);
    }
}

// --- In-Use ---
$("#dri-calculate-button").click(function() {
    userAge = $("#age").val();
    userHeight = $("#height").val();
    userWeight = $("#weight").val();    
    userSex = $("#sex").val();
    userActivityLevel = $("#activity").val();
    
	dailyTarget_calories = calculateCalories_EER();
    $("#dri-calories").val(dailyTarget_calories);
    
    dailyPlan_carbohydrates = calculateCarbohydrate();
    $("#user-carbohydrates").val(dailyPlan_carbohydrates);
    dailyPlan_proteins = calculateProtein();
    $("#user-proteins").val(dailyPlan_proteins);
    dailyPlan_fats = calculateFat();
    $("#user-fats").val(dailyPlan_fats);

    dailyPlan_calories = dailyTarget_calories;
    $("#user-calories").val(dailyPlan_calories);


    // https://api.jqueryui.com/slider/#method-option
    $("#slider-user-carbohydrates").slider("value", 50);
    $("#slider-user-proteins").slider("value", 25);
    $("#slider-user-fats").slider("value", 25);

    alert("Diet Plan computed!");
});


$("#user-carbohydrates").change(function() {
    dailyPlan_carbohydrates = $("#user-carbohydrates").val();
    dailyPlan_proteins = $("#user-proteins").val();
    dailyPlan_fats = $("#user-fats").val();

    dailyPlan_calories = Math.round((4 * dailyPlan_carbohydrates + 4 * dailyPlan_proteins + 9 * dailyPlan_fats) / 10) * 10;
    $("#user-calories").val(dailyPlan_calories);
});
$("#user-proteins").change(function() {
    dailyPlan_carbohydrates = $("#user-carbohydrates").val();
    dailyPlan_proteins = $("#user-proteins").val();
    dailyPlan_fats = $("#user-fats").val();

    dailyPlan_calories = Math.round((4 * dailyPlan_carbohydrates + 4 * dailyPlan_proteins + 9 * dailyPlan_fats) / 10) * 10;
    $("#user-calories").val(dailyPlan_calories);
});
$("#user-fats").change(function() {
    dailyPlan_carbohydrates = $("#user-carbohydrates").val();
    dailyPlan_proteins = $("#user-proteins").val();
    dailyPlan_fats = $("#user-fats").val();

    dailyPlan_calories = Math.round((4 * dailyPlan_carbohydrates + 4 * dailyPlan_proteins + 9 * dailyPlan_fats) / 10) * 10;
    $("#user-calories").val(dailyPlan_calories);
});



/*  --- Food Criteria Planner ---  */
// --- In-Use ---
$("#food-pref-cutoff-button").click(function() {
    userFood_calories_cutoff = $("#cutoff-calories").val();
    userFood_carbohydrate_cutoff = $("#cutoff-carbohydrates").val();
    userFood_protein_cutoff = $("#cutoff-proteins").val();
    userFood_fat_cutoff = $("#cutoff-fats").val();
    userFood_iron_cutoff = $("#cutoff-iron").val();
    userFood_calcium_cutoff = $("#cutoff-calcium").val();
    userFood_magnesium_cutoff = $("#cutoff-magnesium").val();
    userFood_vitaminD_cutoff = $("#cutoff-vitaminD").val();
    userFood_vitaminB12_cutoff = $("#cutoff-vitaminB12").val();

    aiFood_required_condition = $("#suggest-cutoff-conditions").val();
    aiFood_required_nutrient = $("#suggest-cutoff-nutrients").val();

    // Update user's diet profile object
    userDietProfile["cutoff_calories"] = $("#cutoff-calories").val();
    userDietProfile["cutoff_carbohydrates"] = $("#cutoff-carbohydrates").val();
    userDietProfile["cutoff_proteins"] = $("#cutoff-proteins").val();
    userDietProfile["cutoff_fats"] = $("#cutoff-fats").val();
    userDietProfile["cutoff_iron"] = $("#cutoff-iron").val();
    userDietProfile["cutoff_calcium"] = $("#cutoff-calcium").val();
    userDietProfile["cutoff_magnesium"] = $("#cutoff-magnesium").val();
    userDietProfile["cutoff_vitaminD"] = $("#cutoff-vitaminD").val();
    userDietProfile["cutoff_vitaminB12"] = $("#cutoff-vitaminB12").val();

    userDietProfile["required_condition"] =  $("#suggest-cutoff-conditions").val();
    userDietProfile["required_nutrient"] = $("#suggest-cutoff-nutrients").val();

    $.post("/food-pref", userDietProfile, null, "json");

    alert("Food Criteria Saved!");
});



/*  --- Save Diet Profile ---  */
// --- In-Use ---
$("#diet-plan-save-button").click(function() {

    userAge = $("#age").val();
    userHeight = $("#height").val();
    userWeight = $("#weight").val();    
    userSex = $("#sex").val();
    userActivityLevel = $("#activity").val();
    
	dailyTarget_calories = $("#dri-calories").val();
    dailyPlan_calories = $("#user-calories").val();
    dailyPlan_carbohydrates = $("#user-carbohydrates").val();
    dailyPlan_proteins = $("#user-proteins").val();
    dailyPlan_fats = $("#user-fats").val();

    userFood_calories_cutoff = $("#cutoff-calories").val();
    userFood_carbohydrate_cutoff = $("#cutoff-carbohydrates").val();
    userFood_protein_cutoff = $("#cutoff-proteins").val();
    userFood_fat_cutoff = $("#cutoff-fats").val();
    userFood_iron_cutoff = $("#cutoff-iron").val();
    userFood_calcium_cutoff = $("#cutoff-calcium").val();
    userFood_magnesium_cutoff = $("#cutoff-magnesium").val();
    userFood_vitaminD_cutoff = $("#cutoff-vitaminD").val();
    userFood_vitaminB12_cutoff = $("#cutoff-vitaminB12").val();

    aiFood_required_condition = $("#suggest-cutoff-conditions").val();
    aiFood_required_nutrient = $("#suggest-cutoff-nutrients").val();


    //create user's diet profile object
    user_newDietProfile = {
		"age"       	 : userAge,
		"sex" 			 : userSex,
		"height"		 : userHeight,
		"weight"		 : userWeight,
		"activity_level" : userActivityLevel,

        "target_calories": dailyTarget_calories,
        "plan_calories": dailyPlan_calories,
        "plan_carbohydrates": dailyPlan_carbohydrates,
        "plan_proteins": dailyPlan_proteins,
        "plan_fats": dailyPlan_fats,

        "cutoff_calories": userFood_calories_cutoff,
        "cutoff_carbohydrates": userFood_carbohydrate_cutoff,
        "cutoff_proteins": userFood_protein_cutoff,
        "cutoff_fats": userFood_fat_cutoff,
        "cutoff_iron": userFood_iron_cutoff,
        "cutoff_vitaminD": userFood_vitaminD_cutoff,
        "cutoff_vitaminB12": userFood_vitaminB12_cutoff,
        "cutoff_calcium": userFood_calcium_cutoff,
        "cutoff_magnesium": userFood_magnesium_cutoff,
        "required_condition": aiFood_required_condition,
        "required_nutrient": aiFood_required_nutrient
    };

    $.post("/food-pref", user_newDietProfile, null, "json");

    alert("Preference Profile Saved!");
});









