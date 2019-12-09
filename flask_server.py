#   ................................................................................
#   flask_server.py
#   Python code of a flask sever for local Web development 
#   Written by: Daniel Fong, Mark Chen, Riyya Hari Iyer
#   Date Created: 10/15/2019
#   Last Modified: 12/03/2019
#   ................................................................................

import os
import json
from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify


# --- Define a local Web server --- #
app = Flask(__name__)

@app.route("/")
def hello():
    message = "Hello World!"
    return render_template('index.html', message=message)

@app.route("/index.html")
def index():
    message = "Welcome to index.html!"  
    return render_template('index.html', message=message)

@app.route("/history.html")
def history():
    message = "Welcome to history.html!"  
    return render_template('history.html', message=message)

@app.route("/track.html")
def track():
    message = "Welcome to track.html!"  
    return render_template('track.html', message=message)

@app.route("/preference.html")
def preference():
    message = "Welcome to preference.html!"   
    return render_template('preference.html', message=message)

@app.route("/Recipes.html")
def Recipes():
    message = "Welcome to Recipes.html!"  
    return render_template('Recipes.html', message=message)

@app.route("/food-database", methods = ['GET', 'POST'])
def foodDatabase():
    if request.method == 'GET':
        json_file = os.path.join(app.root_path, 'food_data', 'localFoods.json')

        with open(json_file) as file:
            data = json.load(file)
            return jsonify(data)

    elif request.method == 'POST':
        json_file = os.path.join(app.root_path, 'food_data', 'localFoods.json')
        if not os.path.isfile(json_file):
            with open(json_file, 'w') as file:
                json.dump([], file)

        stored_data = None
        received_data = None

        with open(json_file, 'r') as file:
            stored_data = json.load(file)  # in python list

        # print("STORED DATA ____________________________")
        # print(type(stored_data))
        # print(stored_data)

        received_data = request.form.to_dict()  # in python dict
        received_data["tags"] = json.loads(received_data["tags"])
        # print("RECEIVED DATA______________________________")
        # print(type(received_data))
        # print(received_data)

        if not any(temp["name"] == received_data["name"] for temp in stored_data):
        	stored_data.append(received_data.copy())
        
        # print("NEW STORED DATA______________________________________")
        # print(type(stored_data))
        # print(stored_data)

        # Remove duplicate dicts
        # https://stackoverflow.com/questions/9427163/remove-duplicate-dict-in-list-in-python
        # seen = set()
        # combined_data = []
        # for dictionary in stored_data:
        #     dictionary_tuple = tuple(dictionary.items())
        #     if dictionary_tuple not in seen:
        #         seen.add(dictionary_tuple)
        #         combined_data.append(dictionary)

        # print("COMBINED DATA________________________________")
        # print(type(combined_data))
        # print(combined_data)

        # dictonary to string
        # json_combined_data = json.dumps(combined_data)
        # print(type(json_combined_data))
        # print(json_combined_data)
        json_stored_data = json.dumps(stored_data)
        with open(json_file, 'w') as file:
            file.seek(0)
            file.write(json_stored_data) 
            file.truncate()
        
        return json_stored_data

 

@app.route("/food-log", methods = ['GET', 'POST', 'DELETE'])
def foodLog():
    user = request.args.get('user', default = 'test', type = str)
    if request.method == 'GET':
        with open('user_data/{}_log.txt'.format(user)) as file:
            data = json.load(file)
            return jsonify(data)

    elif request.method == 'POST' or request.method == 'DELETE':
        json_file = os.path.join(app.root_path, 'user_data', '{}_log.txt'.format(user))
        if not os.path.isfile(json_file):
            with open(json_file, 'w') as file:
                try:
                    json.dump({"user": user}, file)
                except:
                    print("User doesn't exist and couldn't create user profile!")

        with open('user_data/{}_log.txt'.format(user), 'r+') as file:
            try:
                stored_data = json.load(file)
                received_data = request.form.to_dict()
                processFoodData(received_data, stored_data, request.method)
                json_data = json.dumps(stored_data)
                file.seek(0)
                file.write(json_data)
                file.truncate()
                return json_data
            except Exception as e:
                print("Couldn't write to user data!:", e)
                return "ERROR"

def processFoodData(received_data, stored_data, method):
    #Make sure required fields are present
    if method == 'POST' and not all(keys in received_data for keys in ["name", "meal", "date", "user", "serving", "calories", "carbohydrates", "proteins", "fats"]):
        raise Exception("not all required data was present in received_data")
    elif method == 'DELETE' and not all(keys in received_data for keys in ["name", "meal", "date", "user"]):
        raise Exception("not all required data was present in received_data")

    if received_data["name"] != "":
        if "tags" in received_data:
            received_data["tags"] = json.loads(received_data["tags"])
        remove = ["meal", "date", "user"]
        food_temp = {x: received_data[x] for x in received_data if x not in remove}
        if received_data["date"] in stored_data:
            if received_data["meal"] in stored_data[received_data["date"]]:
                if method == 'POST':
                    stored_data[received_data["date"]][received_data["meal"]].append(food_temp)
                    print("Received:", received_data)
                elif method == 'DELETE':
                    for index in range(len(stored_data[received_data["date"]][received_data["meal"]])):
                        if(stored_data[received_data["date"]][received_data["meal"]][index]["name"] == received_data["name"]):
                            print("Deleted", received_data["name"], "at", index )
                            stored_data[received_data["date"]][received_data["meal"]].pop(index)
                            break
            else:
                stored_data[received_data["date"]] = {"Breakfast": [], "Lunch": [], "Dinner": []}
                stored_data[received_data["date"]][received_data["meal"]].append(food_temp)
        else:
            stored_data[received_data["date"]] = {"Breakfast": [], "Lunch": [], "Dinner": []}
            stored_data[received_data["date"]][received_data["meal"]].append(food_temp)



@app.route("/food-pref", methods = ['GET', 'POST', 'DELETE'])
def foodPref():
    user = request.args.get('user', default = 'test', type = str)
    if request.method == 'GET':
        json_file = os.path.join(app.root_path, 'user_data', '{}_pref.txt'.format(user))
        if not os.path.isfile(json_file):
            with open(json_file, 'w') as file:
                json.dump({"user": "test", "plan": None}, file)

        with open('user_data/{}_pref.txt'.format(user)) as file:
            data = json.load(file)
            return jsonify(data)

    elif request.method == 'POST' or request.method == 'DELETE':
        json_file = os.path.join(app.root_path, 'user_data', '{}_pref.txt'.format(user))
        if not os.path.isfile(json_file):
            with open(json_file, 'w') as file:
                json.dump({"user": "test", "plan": None}, file)

        with open('user_data/{}_pref.txt'.format(user), 'r+') as file:
            stored_data = json.load(file)
            received_data = request.form.to_dict()
            print(received_data)
            stored_data["plan"] = received_data.copy()
            json_data = json.dumps(stored_data)
            file.seek(0)
            file.write(json_data)
            file.truncate()
            return json_data


@app.route("/food-dislike", methods = ['GET', 'POST', 'DELETE'])
def foodDislike():
    user = request.args.get('user', default = 'test', type = str)
    if request.method == 'GET':
        json_file = os.path.join(app.root_path, 'user_data', '{}_dislike.txt'.format(user))	
        if not os.path.isfile(json_file):	
            with open(json_file, 'w') as file:	
                json.dump({"user": "test", "dislike": []}, file)

        with open('user_data/{}_dislike.txt'.format(user)) as file:
            data = json.load(file)
            return jsonify(data)

    elif request.method == 'POST' or request.method == 'DELETE':
        json_file = os.path.join(app.root_path, 'user_data', '{}_dislike.txt'.format(user))
        if not os.path.isfile(json_file):
            with open(json_file, 'w') as file:
                json.dump({"user": "test", "dislike": []}, file)

        with open('user_data/{}_dislike.txt'.format(user), 'r+') as file:
            stored_data = json.load(file)
            received_data = request.form.to_dict()
            print(received_data)
            stored_data["dislike"].append(received_data["dislike"])
            json_data = json.dumps(stored_data)
            file.seek(0)
            file.write(json_data)
            file.truncate()
            return json_data



@app.route("/food-tag-query", methods = ['POST'])
def foodTagQuery():
    if request.method == 'POST':
        json_file = os.path.join(app.root_path, 'food_data', 'localFoods.json')

        with open(json_file, 'r') as file:
            stored_data = json.load(file)
            # print(stored_data)

            received_data = request.form.to_dict()
            print(received_data)
            target_nutrient = received_data["nutrient"]
            target_condition = received_data["condition"]
            foods_qualified = []

            for food_dict in stored_data:
                # print(food_dict)
                if target_nutrient == "proteins" and target_condition == "high":
                    if ("High Proteins" in food_dict["tags"]): 
                        foods_qualified.append(food_dict.copy())
                        print(foods_qualified)
                elif target_nutrient == "proteins" and target_condition == "low":
                    if ("Low Proteins" in food_dict["tags"]):
                        foods_qualified.append(food_dict.copy())
                        print(foods_qualified)

                elif target_nutrient == "carbohydrates" and target_condition == "high":
                    if ("High Carbohydrates" in food_dict["tags"]): 
                        foods_qualified.append(food_dict.copy())
                        print(foods_qualified)                       
                elif target_nutrient == "carbohydrates" and target_condition == "low":
                    if ("Low Carbohydrates" in food_dict["tags"]):
                        foods_qualified.append(food_dict.copy())
                        print(foods_qualified)

                elif target_nutrient == "fats" and target_condition == "high":
                    if ("High Fats" in food_dict["tags"]):
                        foods_qualified.append(food_dict.copy())
                        print(foods_qualified)
                elif target_nutrient == "fats" and target_condition == "low":
                    if ("Low Fats" in food_dict["tags"]):
                        foods_qualified.append(food_dict.copy())
                        print(foods_qualified)                     

            json_foods_qualified = json.dumps({"selected_foods": foods_qualified})
            print(json_foods_qualified)
            return json_foods_qualified


# --- Initialize a local Web server --- #
if __name__ == "__main__":
    app.debug = True
    # access the website through http://localhost:8080/
    app.run(host='0.0.0.0', port=8888)
