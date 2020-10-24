
from app import app
import exceptions
import routes

class PTServer():
    def __init__(self):
        self.pageNumber = 73
        self.load_password()

    def load_password(self):
        with open("etc/password") as fh:
            self.password = fh.readline().rstrip()

    def get_pageNumber(self):
        return self.pageNumber

    def update_pageNumber(self, newPageNumber, password):
        if password != self.password:
            raise exceptions.WrongPassword()

        self.pageNumber = int(newPageNumber)
