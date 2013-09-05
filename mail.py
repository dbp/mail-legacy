from bottle import route, run
from os import popen

@route('/mail/')
def index():
    f = popen("notmuch search tag:important AND tag:unread AND tag:inbox")
    return "<div>%s</div>" % "</div><br/><div>".join(f.readlines())

run(host='localhost', port=40000)
