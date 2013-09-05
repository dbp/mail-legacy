from bottle import route, run, template
from os import popen

@route('/mail/')
def index():
    f = popen("notmuch search tag:important AND tag:unread AND tag:inbox")
    return template('<pre>{{output}}</pre>', output="\n".join(f.readlines()))

run(host='localhost', port=40000)
