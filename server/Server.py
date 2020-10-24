
from app import app
import exceptions
import routes

class PTServer():
    def __init__(self):
        self.pageName = "slide001.html"
        self.load_password()

    def load_password(self):
        with open("etc/password") as fh:
            self.password = fh.readline().rstrip()

    def get_pageName(self):
        return self.pageName

    def update_pageName(self, newPageName, password):
        if password != self.password:
            raise exceptions.WrongPassword()

        self.pageName = newPageName
