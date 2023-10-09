import joblib
import pandas as pd
import warnings
import sys
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def hello_world():
        return "<p>Hello, hacker!</p>"

warnings.filterwarnings("ignore")
def predict(t, g):
        # Load the trained RandomRegressor model only once
        loaded_model = joblib.load('temp_model.pkl')


        try:
                # The user will change the value of the temperature only
                t = int(t)

                # Load the data for gene names
                tp = pd.read_csv("temp_gene.csv")
                p = tp["Reporter Name"].values

                # Use list comprehension for predictions
                n = [i for i in range(1, len(p) + 1) if loaded_model.predict([(i, t)])[0] >= 0.1 and loaded_model.predict([(i, t)])[0] < 100]

        except KeyboardInterrupt:
                print("\nExiting...")

        try:
                # The user will change the value of the temperature only
                g = int(t)

                # Load the data for gene names
                gp = pd.read_csv("temp_gene.csv")
                o = gp["Reporter Name"].values

                nw=[]
                nw = [i for i in range(1, len(o) + 1) if loaded_model.predict([(i, t)])[0] >= 0.1]

        except KeyboardInterrupt:
                print("\nExiting...")
        # Read the CSV file into a DataFrame
        r = pd.read_csv('proteins.csv')
        # Define the list of values to search for
        n=[str(item) for item in n]
        nw=[str(item) for item in nw]
        # Use boolean indexing to filter the DataFrame
        filtered_df = r[r['Gene'].str.contains('|'.join(n), case=False, na=False)]
        filtered_df = r[r['Gene'].str.contains('|'.join(nw), case=False, na=False)]
        # Extract the desired columns into separate lists
        indexes = filtered_df.index + 1  # Adding 1 to get 1-based index
        names = filtered_df["Protein names"].tolist()
        gene = filtered_df["Gene Names"].tolist()
        sequence = filtered_df["Sequence"].tolist()
        chromosome = filtered_df["Proteomes"].tolist()

        return {
                "names": names,
                "gene": gene,
                "sequence": sequence,
                "chromosome": chromosome
        }

@app.route('/predict', methods=['POST'])
def make_prediction():
        t = request.form.get('temp')
        g = request.form.get('grav')
        prediction = predict(t, g)
        return jsonify({
                'prediction': prediction
        })

if __name__ == '__main__':
    app.run()