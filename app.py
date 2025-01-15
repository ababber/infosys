from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://postgres:password@db:5432/infosys"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


@app.route("/")
def hello():
    return "Hello, Flask with PostgreSQL!"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
