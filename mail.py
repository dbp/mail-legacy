from bottle import route, run
from os import popen

def add_link(line):
    w = line.split()
    return "<a href='/mail/%s'>%s</a>" % (w[0].split(":")[1], " ".join(w[1:]))

@route('/mail/')
def index():
    f = popen("notmuch search tag:important AND tag:unread AND tag:inbox")
    return "<div>%s</div>" % "</div><br/><div>".join(map(add_link, f.readlines()))

@route('/mail/<thread>')
def read(thread):
    f = popen("notmuch show thread:%s" % thread)
    return "<div>%s</div>" % "</div><div>".join(f.readlines())

run(host='localhost', port=40000)
