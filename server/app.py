
from flask_api import FlaskAPI
from flask_cors import CORS

app = FlaskAPI("page-turner")
CORS(app)


app.pageTurner = { }
