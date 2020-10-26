var rr = { "waiting": false,
           "getpage": new XMLHttpRequest(),
           "delay": 1000,
           "timeout": null,
           "pageLocked": true,
           "serverURL": "http://127.0.0.1:5000",
           "window": window,
           "pagename": null,
           "pagenumber": null,
           "password": null,
         }

function show(where, what) {
    document.getElementById(where).textContent = what;
}

function filename_to_number(filename) {
    const pat = /slide0*(\d+)/
    let g = filename.match(pat)
    if (g == null) {
        return "???"
    } else {
        return g[1]
    }
}

rr.refresh_elements = function() {
    if (this.pageLocked) {
        rr.update_phantom_numbers(function(elem) {
            elem.style.backgroundColor = "white"
            elem.style.visibility = "hidden"
        })
        show("locked_display", "locked")
    } else {
        rr.update_phantom_numbers(function(elem) {
            elem.style.backgroundColor = "silver"
            elem.style.visibility = "visible"
            elem.textContent = rr.pagenumber
        })
        show("locked_display", "unlocked")
    }
}

function phantom_click() {
    console.log("phantom click")
    rr.lockPage()
}

rr.lockPage = function() {
    this.pageLocked = true
    this.refresh_elements()
}

rr.unlockPage = function() {
    this.pageLocked = false
    this.refresh_elements()
}

rr.update_phantom_numbers = function(cb) {
    pagenumber_element = document.getElementsByClassName("phantom_number")
    for (i=0; i < pagenumber_element.length; i++) {
        elem = pagenumber_element[i]
        console.log(elem)
        cb(elem)
    }
}

rr.schedule_action = function() {
    console.log("schedule_action", this);
    if (this.timeout != null) {
        window.clearInterval(this.timeout)
    }
    this.timeout = window.setInterval(sendrequest, this.delay)
}

rr.switchpage = function(dir) {
    if (rr.password == null) {
        rr.unlockPage()
    }
    links = document.head.getElementsByTagName('link')
    for (i=0; i < links.length; i++) {
        elem = links[i]
        console.log(i, elem)
        if (elem.rel == dir) {
            rr.window.location.assign(elem.href);
            return
        }
    }
    alert("Couldn't find link rel=" + dir)
}

rr.ONCE = function() {
    if (this.timeout != null) {
        window.clearInterval(this.timeout)
    }
    this.timeout = window.setTimeout(sendrequest)
}

rr.STOP = function() {
    window.clearInterval(this.timeout)
}

function sendrequest() {
    console.log("sendrequest", rr)
    if (rr.waiting) {
        // already waiting, ignore
    } else {
        rr.getpage.addEventListener("load", getCompleted );
        rr.getpage.open("GET", rr.serverURL + "/get-page");
        rr.getpage.send();
        rr.waiting = true
    }
}

function getCompleted() {
    console.log("getCompleted", this, this.responseText);
    rr.waiting = false

    reply = JSON.parse(this.responseText)
    rr.action(reply)
}

rr.action = function(response) {
    console.log("in action, response = ", response)
    this.pagename = response.page
    this.pagenumber = filename_to_number(response.page)
    update_filenamedisplay(response.page);
    if (rr.pageLocked) {
        rr.window.location.assign(response.page);
    } else {
        rr.refresh_elements()
    }
}

function STOP() {
    window.clearInterval(rr.timeout)
}

function GETcompleted() {
    console.log(this.responseText);
    reply = JSON.parse(this.responseText)
    console.log(reply);
    update_filenamedisplay(reply.page);
}

function update_filenamedisplay(text) {
    show("filename_display", text)
}

window.onkeydown = function(e) {
    e = e || window.event;
    var k = e.keyCode || e.which;
//    alert(k);
    switch(k) {
    case 34: // page down
    case 39: // right arrow
    case 78: // 'n'
        rr.switchpage("next")
        break;
    case 37: // left arrow
    case 33: // page up
    case 80: // 'p'
        rr.switchpage("previous")
        break;
    }
    return true;
}

// rr.schedule_action()
