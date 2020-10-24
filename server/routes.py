
# API:
#  GET: retrieve current page number
#  POST:  update current page number

from app import app
from flask import request
from flask_api import status
from exceptions import WrongPassword
from pprint import pprint
import sys

def failure(msg):
    return { "success": False, "error": msg }

@app.route('/get-page')
def get_page():
    return { "page": app.server.get_pageName() }

@app.route('/set-page', methods=['POST'])
def set_page():
    if "page" not in request.data:
        return failure("No page specified"), status.HTTP_400_BAD_REQUEST

    if "password" not in request.data:
        return failure("No password specified"), status.HTTP_401_UNAUTHORIZED

    password = request.data["password"]
    page = request.data["page"]
    try:
        app.server.update_pageName(page, password)
    except WrongPassword:
        return failure("Incorrect password"), status.HTTP_401_UNAUTHORIZED

    return { "success": True }
