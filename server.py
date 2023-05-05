from flask import Flask, jsonify, request, send_from_directory
import json
from collections import defaultdict

app = Flask(__name__, static_folder="static")

# Global response list
responses = []

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/results", methods=["POST"])
def post_results():
    global responses
    new_responses = request.get_json()
    responses.extend(new_responses)
    entry_data = defaultdict(lambda: {"count": 0, "x_sum": 0, "y_sum": 0})

    for response in responses:
        print(response)
        entry = response["entry"]
        entry_data[entry]["count"] += 1
        entry_data[entry]["x_sum"] += response["x"]
        entry_data[entry]["y_sum"] += response["y"]

    results = [
        {
            "entry": entry,
            "average_x": data["x_sum"] / data["count"],
            "average_y": data["y_sum"] / data["count"],
        }
        for entry, data in entry_data.items()
    ]

    return jsonify(results)

@app.route('/results', methods=['GET'])
def get_results():
    global responses

    entry_data = defaultdict(lambda: {"count": 0, "x_sum": 0, "y_sum": 0})

    for response in responses:
        entry = response["entry"]
        entry_data[entry]["count"] += 1
        entry_data[entry]["x_sum"] += response["x"]
        entry_data[entry]["y_sum"] += response["y"]

    results = [
        {
            "entry": entry,
            "average_x": data["x_sum"] / data["count"],
            "average_y": data["y_sum"] / data["count"],
        }
        for entry, data in entry_data.items()
    ]

    return jsonify(results)

@app.route("/download-responses")
def download_responses():
    return jsonify(responses)

'''
if __name__ == "__main__":
    app.run(debug=True)
'''