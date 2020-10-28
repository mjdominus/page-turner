

var rr_init = { "waiting": false,
                "delay": 3000,
                "timeout": null,
                "pageLocked": true,
                "serverURL": "http://127.0.0.1:5000",
                "pagename": null,
                "pagenumber": null,
                "password": null,
              }

var rr = {};
var r = {};

window.onload = function () {
    restoreState()

    if (r.data.password == null) {  // follower
        r.refresh_elements()
        r.timeout = window.setInterval(sendrequest, r.data.delay)
    } else { // leader

    }
}

function saveState(what) {
    window.sessionStorage.setItem("saved", JSON.stringify(what))
}

function restoreState() {
    var rr
    console.log("restoring state")
    saved_json = window.sessionStorage.getItem("saved")
    if (! saved_json) {
        console.log("creating new state object")
        rr = { ...rr_init }
    } else {
        console.log("found saved state:", saved_json)
        rr = JSON.parse(saved_json)
    }
    r.data = rr
    r.getpage = new XMLHttpRequest()
    stuff_text("debug_rr", JSON.stringify(rr))
}

function stuff_text(where, what) {
    document.getElementById(where).textContent = what;
}

function filename_to_number(filename) {
    //    const pat = /slide0*(\d+)/
    console.log("to number: ", filename)
    const pat = /test(\d*)\.html$/
    let g = filename.match(pat)
    if (g == null) {
        return "???"
    } else {
        return g[1]
    }
}

r.refresh_elements = function() {
    if (this.data.pageLocked) {
        this.update_phantom_numbers(function(elem) {
            elem.style.backgroundColor = "white"
            elem.style.visibility = "hidden"
        })
    } else {
        var data = this.data
        this.update_phantom_numbers(function(elem) {
            elem.style.backgroundColor = "silver"
            elem.style.visibility = "visible"
            elem.textContent = data.pagenumber
        })
    }
}

r.update_phantom_numbers = function(cb) {
    pagenumber_element = document.getElementsByClassName("phantom_number")
    for (i=0; i < pagenumber_element.length; i++) {
        elem = pagenumber_element[i]
        console.log(elem)
        cb(elem)
    }
}

function phantom_click() {
    console.log("phantom click")
    r.lockPage()

    saveState(r.data)
    window.location.assign(r.data.pagename);
}

r.lockPage = function() {
    this.data.pageLocked = true
    this.refresh_elements()
}

r.unlockPage = function() {
    this.data.pageLocked = false
    this.refresh_elements()
}

r.schedule_action = function() {
    console.log("schedule_action", this);
    if (this.timeout != null) {
        window.clearInterval(this.timeout)
    }
    this.timeout = window.setInterval(sendrequest, this.data.delay)
}

function getlink(dir) {
    links = document.head.getElementsByTagName('link')
    for (i=0; i < links.length; i++) {
        elem = links[i]
        if (elem.rel == dir) {
            return elem.href
        }
    }
    alert("Couldn't find link rel=" + dir)
}

r.switchpage = function(dir) {
    if (this.data.password == null) {
        this.unlockPage()
    }
    saveState(this.data)
    window.location.assign(getlink(dir));
}

r.ONCE = function() {
    if (this.timeout != null) {
        window.clearInterval(this.timeout)
    }
    this.timeout = window.setTimeout(sendrequest)
}

r.STOP = function() {
    window.clearInterval(this.timeout)
}

function sendrequest() {
    console.log("sendrequest", rr)
    if (r.waiting) {
        // already waiting, ignore
    } else {
        r.getpage.addEventListener("load", getCompleted );
        r.getpage.open("GET", r.data.serverURL + "/get-page");
        r.getpage.send();
        r.waiting = true
    }
}

function getCompleted() {
    console.log("getCompleted", this, this.responseText);
    reply = JSON.parse(this.responseText)
    r.action(reply)
}

r.action = function(response) {
    this.waiting = false
    newpage = (new URL(response.page, window.location)).href
    console.log("in action, response = ", response, "; newpage = ", newpage)

    if (this.data.pageLocked) {
        if (newpage == this.data.pagename) {
            console.log("Same page, won't reload")
        } else {
            this.data.pagename = newpage
            this.data.pagenumber = filename_to_number(newpage)

            console.log("Assigning new page: old: ", this.data.pagename, " new: ", newpage)
            saveState(this.data)
            window.location.assign(newpage);
        }
    } else {
        console.log("not locked, refreshing")
        this.data.pagename = newpage
        this.data.pagenumber = filename_to_number(newpage)

        this.refresh_elements()
    }
}

function STOP() {
    window.clearInterval(r.data.timeout)
}

function GETcompleted() {
    console.log(this.responseText);
    reply = JSON.parse(this.responseText)
    console.log(reply);
    r.action(reply)
}

window.onkeydown = function(e) {
    e = e || window.event;
    var k = e.keyCode || e.which;
//    alert(k);
    switch(k) {
    case 34: // page down
    case 39: // right arrow
    case 78: // 'n'
        r.switchpage("next")
        break;
    case 37: // left arrow
    case 33: // page up
    case 80: // 'p'
        r.switchpage("previous")
        break;
    }
    return true;
}

// rr.schedule_action()
