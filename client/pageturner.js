var rr = { "waiting": false,
           "getpage": new XMLHttpRequest(),
           "delay": 1000,
           "timeout": null,
           "pageLocked": true,
           "serverURL": "http://127.0.0.1:5000",
           "window": window,
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

rr.schedule_action = function() {
    console.log("schedule_action", this);
    if (this.timeout != null) {
        window.clearInterval(this.timeout)
    }
    this.timeout = window.setInterval(sendrequest, this.delay)
}

rr.STOP = function() {
    window.clearInterval(this.timeout)
}

rr.action = function(response) {
    console.log("in action, response = ", response)
    update_filenamedisplay(response.page);
}


function STOP() {
    window.clearInterval(rr.timeout)
}

function lockPage() {
    pageLocked = true;
}
function unlockPage() {
    pageLocked = false;
}

function GETcompleted() {
    console.log(this.responseText);
    reply = JSON.parse(this.responseText)
    console.log(reply);
    update_filenamedisplay(reply.page);
}

function update_filenamedisplay(text) {
    document.getElementById('filenamedisplay').textContent = text;
}
