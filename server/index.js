// CONFIG

// allow toasts? must be false if app is hosted on the following tlds:
// .ru  .su  .by  .рф
// more information is in CONFIG_OPTIONS.md.
const allowToasts = true;

// the url to a slideshow to try and start with
// no slideshow will be started if left blank
const startingSlideshow = "";

// default allowlist, can be changed later in the console
let allowlist = false;
let allowed = [];

// default denylist, can be changed later in the console
let banned = [];

// the port that the server will be listening on
const clntPort = 3000;

// prefixes for logging to the console
const clntPrefix = "[CLNT] ";
const joinPrefix = "[JOIN] ";
const userPrefix = "[USER] ";
const hostPrefix = "[HOST] ";
const specPrefix = "[SPEC] ";
const nodePrefix = "[NODE] ";

// the names of namespaces
// changing this will require changing it in the html files too
const joinNamespace = "/join";
const userNamespace = "/user";
const hostNamespace = "/host";
const specNamespace = "/spec";
const nodeNamespace = "/node";

// the length of user tokens
const tokenLength = 5;

// SETUP SERVERS

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const {Server} = require("socket.io");
const {isBooleanObject} = require("util/types");
const io = new Server(server);
const dir = __dirname.replace("server", "client");

const join = io.of(joinNamespace);
const user = io.of(userNamespace);
const host = io.of(hostNamespace);
const spec = io.of(specNamespace);
const node = io.of(nodeNamespace);

// SETUP VARIABLES, FUNCTIONS, AND OTHER LIBRARIES

const fs = require("fs");
const {profanity, CensorType} = require("@2toad/profanity");
const xml2js = require("xml2js");
const axios = require("axios");

async function xmlToJson(xmlString) {
    const parser = new xml2js.Parser({explicitArray: false});
    return new Promise((resolve, reject) => {
        parser.parseString(xmlString, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

let connected = [];
let userAccounts = [];
let specAccounts = [];
let nodeAccounts = [];
let history = [];

let joinConnected = 0;
let userConnected = 0;
let hostConnected = 0;
let specConnected = 0;
let nodeConnected = 0;

let slide = 0;
let slideshow;
let slideshowRaw;
let slideshowUrl;

let devmode = false;
let devmodeConfirm;

let inputs = {};

function slideshowError(oldSlideshow, oldSlideshowRaw, oldSlideshowUrl) {
    out("Failed to start the slideshow.");
    out("This could be due to the URL being invalid or the file isn't in XML format.");
    slideshow = oldSlideshow;
    slideshowRaw = oldSlideshowRaw;
    slideshowUrl = oldSlideshowUrl;
    return;
}

function setSlideshow(url) {
    const oldSlideshow = slideshow;
    const oldSlideshowRaw = slideshowRaw;
    const oldSlideshowUrl = slideshowUrl;
    slideshowUrl = url;

    if (url.startsWith("http://") || url.startsWith("https://")) {
        axios
            .get(url)
            .then(response => {
                processSlideshowData(response.data);
            })
            .catch(error => {
                return slideshowError(oldSlideshow, oldSlideshowRaw, oldSlideshowUrl);
            });
    } else {
        fs.readFile(dir + "/" + url, async (err, data) => {
            if (err) return slideshowError(oldSlideshow, oldSlideshowRaw, oldSlideshowUrl);
            processSlideshowData(
                data.toString("utf8"),
                oldSlideshow,
                oldSlideshowRaw,
                oldSlideshowUrl
            );
        });
    }
}

async function processSlideshowData(data, oldSlideshow, oldSlideshowRaw, oldSlideshowUrl) {
    try {
        const json = await xmlToJson(data);
        slideshow = json;
        slideshowRaw = data;
        out("Slideshow started.");
        user.emit("slideshow updated");
        spec.emit("slideshow updated");
        return true;
    } catch (err) {
        slideshowError(oldSlideshow, oldSlideshowRaw, oldSlideshowUrl);
        return false;
    }
}

if (!startingSlideshow == "") {
    setSlideshow(startingSlideshow);
}

function out(message) {
    console.log(message);
    history.push(message);
    node.emit("output", message);
}

function log(message) {
    console.log(message);
}

function generateToken() {
    let token = "";

    for (let i = 0; i < tokenLength; i++) {
        token += Math.random().toString(36);
        if (i != tokenLength - 1) {
            token += "-";
        }
    }

    return token.replaceAll("0.", "");
}

function generateCode() {
    const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";

    for (let i = 0; i < 6; i++) {
        if (i === 3) {
            code += "-";
        }
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
}

// SETUP COMMAND FUNCTIONS

const dangerousCommands = ["devmode"];

function executeCommand(command) {
    // allowlist ...
    if (command.startsWith("allowlist")) {
        const cmd = command.substring(9).trim();

        // allowlist add ...
        if (cmd.startsWith("add")) {
            const add = cmd.substring(3).trim();

            if (add == "" || add == undefined) return out("Username must be specified.");

            if (allowed.includes(add)) return out("That username is already allowed.");

            allowed.push(add);
            out(add + " has been added to the allowlist.");
            return;
        }

        // allowlist disable
        if (cmd == "disable") {
            if (!allowlist) return out("Allowlist was already disabled.");
            allowlist = false;
            out("Disabled the allowlist.");
            return;
        }

        // allowlist enable
        if (cmd == "enable") {
            if (allowlist) return out("Allowlist was already enabled.");
            allowlist = true;
            out("Enabled the allowlist.");
            return;
        }

        // allowlist list
        if (cmd == "list") {
            if (!allowlist) {
                out("The allowlist is currently disabled.");
                out("However, the following usernames are allowed:");
            } else {
                out("The following usernames are allowed:");
            }

            if (allowed.length == 0) return out("The allowlist is empty.");

            allowed.forEach(user => {
                out(" - " + user);
            });
            return;
        }

        // allowlist remove ...
        if (cmd.startsWith("remove")) {
            const remove = cmd.substring(6).trim();

            if (remove == "" || remove == undefined) return out("Username must be specified.");

            if (!allowed.includes(remove)) return out("That username was not allowed.");

            allowed = allowed.filter(user => user !== remove);
            out(remove + " has been removed from the allowlist.");
            return;
        }
    }

    // devmode ...
    if (command.startsWith("devmode")) {
        const cmd = command.substring(7).trim();

        // devmode disable
        if (cmd == "disable") {
            if (devmode) {
                devmode = false;
                out("Disabled devmode.");
                return;
            } else {
                out("Devmode was already disabled.");
                return;
            }
        }

        // devmode enable
        if (cmd == "enable") {
            if (devmode) return out("Devmode was already enabled.");

            const now = Date.now();

            if (now - devmodeConfirm < 60000) {
                devmode = true;
                out(
                    'Enabled devmode. You can disable it at any time by running "devmode disable".'
                );
                devmodeConfirm = 0;
                return;
            } else {
                devmodeConfirm = now;
                out("Are you sure you want to enable devmode?");
                out("Devmode allows the host client to run any command.");
                out(
                    'Type "devmode enable" again in the next 60 seconds if you would like to enable devmode.'
                );
                return;
            }
        }
    }

    // input ...
    else if (command.startsWith("input")) {
        const cmd = command.substring(5).trim();

        // input delete ...
        if (cmd.startsWith("delete")) {
            const input = cmd.substring(6).trim().split(" ");
            const id = input[0];

            let username = "";
            for (let i = 1; i < input.length; i++) {
                username += input[i];
                if (i != input.length - 1) username += " ";
            }

            if (inputs[id] == undefined) return out("That input does not exist.");
            if (inputs[id][username] == undefined)
                return out("That user did not complete that input.");

            delete inputs[id][username];
            out("Deleted the input " + id + " from " + username + ".");
            return;
        }

        // input get ...
        if (cmd.startsWith("get")) {
            const input = cmd.substring(3).trim().split(" ");
            const id = input[0];

            let username = "";
            for (let i = 1; i < input.length; i++) {
                username += input[i];
                if (i != input.length - 1) username += " ";
            }

            if (inputs[id] == undefined) return out("That input does not exist.");
            if (inputs[id][username] == undefined)
                return out("That user did not complete that input.");

            return out(inputs[id][username]);
        }
    }

    // session ...
    else if (command.startsWith("session")) {
        const cmd = command.substring(7).trim();

        // session count
        if (cmd == "count") {
            let count =
                joinConnected + userConnected + hostConnected + specConnected + nodeConnected;
            out("There are currently " + count + " total clients connected.");
            out(" - " + joinConnected + " join connections");
            out(" - " + userConnected + " user connections");
            out(" - " + hostConnected + " host connections");
            out(" - " + specConnected + " spec connections");
            out(" - " + nodeConnected + " node connections");
            return;
        }

        // session reload ...
        else if (cmd.startsWith("reload")) {
            if (slideshow == undefined) return out("The session is not started.");

            let reload = cmd.substring(6).trim();

            if (reload == "" || reload == undefined) reload = slideshowUrl;

            setSlideshow(reload);
            out("The session has been reloaded.");
            return;
        }

        // session reset ...
        else if (cmd.startsWith("reset")) {
            if (slideshow == undefined) return out("The session is not started.");

            let reset = cmd.substring(5).trim();

            if (reset == "" || reset == undefined) reset = slideshowUrl;

            user.sockets.forEach(socket => {
                socket.disconnect(true);
            });

            spec.sockets.forEach(socket => {
                socket.disconnect(true);
            });

            userAccounts = [];
            specAccounts = [];

            userConnected = 0;
            specConnected = 0;

            setSlideshow(reset);
            return;
        }

        // session start ...
        else if (cmd.startsWith("start")) {
            if (slideshow != undefined) return out("The session is already started.");

            const start = cmd.substring(5).trim();

            if (start == "" || start == undefined) return out("Slideshow URL must be specified.");

            setSlideshow(start);

            return;
        }
    }

    // slide ...
    else if (command.startsWith("slide")) {
        const cmd = command.substring(5).trim();

        // slide current
        if (cmd == "current") {
            out("The current slide is slide " + (slide + 1) + ".");
            return;
        }

        // slide first
        else if (cmd == "first") {
            slide = 0;
            user.emit("slide", slide);
            spec.emit("slide", slide);
            out("Jumped to the first slide.");
            return;
        }

        // slide jump ...
        else if (cmd.startsWith("jump")) {
            const jump = cmd.substring(4).trim();

            if (jump == "" || jump == undefined) {
                out("Slide must be an integer.");
                return;
            }

            try {
                if (slide == parseInt(jump) - 1) return out("You are already on that slide.");
                slide = parseInt(jump) - 1;
            } catch (e) {
                out("Slide must be an integer.");
                return;
            }

            if (slideshow.Slideshow.Slides.Slide[jump - 1] != undefined) {
                user.emit("slide", jump - 1);
                spec.emit("slide", jump - 1);
                out("Jumped to slide " + jump + ".");
                return;
            } else {
                out("That slide does not exist!");
                return;
            }
        }

        // slide last
        else if (cmd == "last") {
            slide = slideshow.Slideshow.Slides.Slide.length - 1;
            user.emit("slide", slide);
            spec.emit("slide", slide);
            out("Jumped to the last slide (slide " + (slide + 1) + ").");
            return;
        }

        // slide next
        else if (cmd == "next") {
            if (slide == slideshow.Slideshow.Slides.Slide.length - 1) {
                out("There are no more slides.");
                return;
            } else {
                slide += 1;
                user.emit("slide", slide);
                spec.emit("slide", slide);
                out("Went to the next slide (slide " + (slide + 1) + ").");
                return;
            }
        }

        // slide previous
        else if (cmd == "previous") {
            if (slide == 0) {
                out("You are on the first slide.");
                return;
            } else {
                slide -= 1;
                user.emit("slide", slide);
                spec.emit("slide", slide);
                out("Went to the previous slide (slide " + (slide + 1) + ").");
                return;
            }
        }
    }

    // user ...
    else if (command.startsWith("user")) {
        const cmd = command.substring(4).trim();

        // user kick ...
        // user ban ...
        if (cmd.startsWith("kick") || cmd.startsWith("ban")) {
            const kick = cmd.substring(4).trim();

            if (kick == "" || kick == undefined) {
                out("User must be specified.");
                return;
            }

            if (connected.includes(kick)) {
                let userFound = false;
                user.sockets.forEach(socket => {
                    if (socket.username == kick) {
                        userFound = true;

                        socket.emit("kicked");
                        socket.disconnect(true);
                        socket.authenticated = false;

                        userAccounts = userAccounts.filter(account => account.username !== kick);
                        connected = connected.filter(user => user !== kick);

                        if (cmd.startsWith("ban")) {
                            banned.push(kick);
                            out(kick + " has been kicked and the usernamed has been banned.");
                        }

                        if (cmd.startsWith("kick")) out(kick + " has been kicked.");
                        return;
                    }
                });

                spec.sockets.forEach(socket => {
                    if (socket.username == kick) {
                        userFound = true;

                        socket.emit("kicked");
                        socket.disconnect(true);
                        socket.authenticated = false;

                        userAccounts = userAccounts.filter(account => account.username !== kick);
                        connected = connected.filter(user => user !== kick);

                        if (cmd.startsWith("ban")) {
                            banned.push(kick);
                            out(kick + " has been kicked and the usernamed has been banned.");
                        }

                        if (cmd.startsWith("kick")) out(kick + " has been kicked.");
                        return;
                    }
                });

                if (!userFound) out("An unrecognized error occurred.");
                return;
            } else {
                banned.push(kick);
                out(kick + " was not found, but the username was banned.");
                return;
            }
        }

        // user unban
        if (cmd.startsWith("unban")) {
            const unban = cmd.substring(6).trim();

            if (unban == "" || unban == undefined) return out("Username must be specified.");

            if (banned.includes(unban)) {
                banned = banned.filter(user => user !== unban);
                out(unban + " has been unbanned.");
                return;
            }

            out("That username is not banned.");
            return;
        }
    }

    out("Command not found");
}

function canHostExecute(command) {
    if (devmode) return true;
    const check = new RegExp(`^(${dangerousCommands.join("|")})`);
    if (check.test(command)) return false;
    return true;
}

// CLNT

function cout(message) {
    out(clntPrefix + message);
}

app.get("/logo", (req, res) => {
    res.sendFile(dir + "/logo.png");
});

app.get("/cookies", (req, res) => {
    res.sendFile(dir + "/cookies.js");
});

app.get("/slideshow", (req, res) => {
    res.send(slideshowRaw);
});

app.get("/renderer", (req, res) => {
    res.sendFile(dir + "/renderer.js");
});

app.get("/sweetalert", (req, res) => {
    if (!allowToasts) return res.send("");
    res.redirect("https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js");
});

// JOIN

function jout(message) {
    out(joinPrefix + message);
}

app.get("/", (req, res) => {
    res.redirect("/join-user");
});

app.get("/join-user", (req, res) => {
    res.sendFile(dir + "/join-user.html");
});

app.get("/join-host", (req, res) => {
    res.sendFile(dir + "/join-host.html");
});

app.get("/join-spec", (req, res) => {
    res.sendFile(dir + "/join-spec.html");
});

app.get("/join-node", (req, res) => {
    res.sendFile(dir + "/join-node.html");
});

join.on("connect", socket => {
    joinConnected++;

    socket.on("disconnect", () => {
        joinConnected--;
    });

    // ---

    socket.on("new user", request => {
        // user and spec
        if (request.type == "user" || request.type == "spec") {
            let username = request.username.trim();
            username = username.length > 30 ? username.slice(0, 27) + "..." : username;

            // name in use
            if (connected.includes(username)) {
                jout(username + " was denied: name in use");
                return socket.emit("user approval", {
                    permission: false,
                    reason: "Nickname is already in use!"
                });
            }

            // name is blank
            if (username == "" || username == undefined) {
                jout(username + " was denied: name is blank");
                return socket.emit("user approval", {
                    permission: false,
                    reason: "Nickname cannot be blank!"
                });
            }

            // name is not approved
            if (allowlist && !allowed.includes(username)) {
                jout(username + " was denied: name is not approved");
                return socket.emit("user approval", {
                    permission: false,
                    reason: "Nickname is not approved!"
                });
            }

            // name is banned
            if (banned.includes(username)) {
                jout(username + " was denied: name is banned");
                return socket.emit("user approval", {
                    permission: false,
                    reason: "Nickname is banned!"
                });
            }

            // name contains profanity
            if (profanity.exists(username)) {
                jout(username + " was denied: name contains profanity");
                return socket.emit("user approval", {
                    permission: false,
                    reason: "Nickname cannot contain profanity!"
                });
            }

            // username too long
            if (username.length > 25) {
                jout(username + " was denied: username too long");
                return socket.emit("user approval", {
                    permission: false,
                    reason: "Nickname cannot be longer than 25 characters!"
                });
            }

            // session not started
            if (slideshow == null) {
                jout(username + " was denied: session not started");
                return socket.emit("user approval", {
                    permission: false,
                    reason: "There is currently no active session."
                });
            }

            // username approved
            const token = generateToken();
            jout(username + " was approved");
            connected.push(username);

            if (request.type == "user") userAccounts.push({username: username, token: token});
            if (request.type == "spec") specAccounts.push({username: username, token: token});

            socket.emit("user approval", {
                permission: true,
                token: token
            });
        }

        // host
        else if (request.type == "host") {
        }

        // node
        else if (request.type == "node") {
            const code = generateCode();
            const now = Date.now();
            log("A request for console access was sent.");
            log("To verify it, give the following code to the requester: " + code);

            socket.emit("node ready");
            socket.on("node code", nodeCode => {
                if (nodeCode == code && Date.now() - now < 60000) {
                    const token = generateToken();
                    socket.emit("node approval", {permission: true, token: token});
                    nodeAccounts.push({token: token});
                } else {
                    socket.emit("node approval", {
                        permission: false,
                        reason: "The code you provided is either invalid or expired."
                    });
                }
            });
        }
    });
});

// USER

function uout(message) {
    out(userPrefix + message);
}

app.get("/user", (req, res) => {
    res.sendFile(dir + "/user.html");
});

user.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (token == undefined) {
        uout("client denied: no token");
        return next(new Error("No token provided"));
    }

    const userToken = userAccounts.find(ut => ut.token == token);

    if (userToken == undefined) {
        uout("client denied: invalid token");
        return next(new Error("Invalid token"));
    }

    next();
});

user.on("connect", socket => {
    const username = userAccounts.find(ut => ut.token == socket.handshake.auth.token).username;
    socket.username = username;

    uout(username + " connected");
    userConnected++;

    socket.on("disconnect", () => {
        uout(username + " disconnected");
        userConnected--;
    });

    // ---

    socket.emit("slide", slide);

    socket.on("interactive - input", input => {
        uout(username + " sent input: " + input.value + " (ID: " + input.id + ")");

        if (inputs[input.id] == undefined) inputs[input.id] = {};
        inputs[input.id][username] = input.value == "" ? null : input.value;
    });
});

// HOST

function hout(message) {
    out(hostPrefix + message);
}

app.get("/host", (req, res) => {
    res.sendFile(dir + "/host.html");
});

host.on("connect", socket => {
    hostConnected++;

    socket.on("disconnect", () => {
        hostConnected--;
    });

    // ---

    host.on("command", command => {
        log("host@AppleDeck $ " + command);

        if (canHostExecute(command)) return executeCommand(command);
        out("Command not found");
    });
});

// SPEC

function sout(message) {
    out(specPrefix + message);
}

app.get("/spec", (req, res) => {
    res.sendFile(dir + "/spec.html");
});

spec.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (token == undefined) {
        sout("client denied: no token");
        return next(new Error("No token provided"));
    }

    const specToken = specAccounts.find(st => st.token == token);

    if (specToken == undefined) {
        sout("client denied: invalid token");
        return next(new Error("Invalid token"));
    }

    next();
});

spec.on("connect", socket => {
    const username = specAccounts.find(ut => ut.token == socket.handshake.auth.token).username;
    socket.username = username;

    sout(username + " connected");
    specConnected++;

    socket.on("disconnect", () => {
        sout(username + " disconnected");
        specConnected--;
    });

    // ---

    socket.emit("slide", slide);

    socket.on("get input", id => {
        if (inputs[id] == undefined) return;
        socket.emit("input responses", inputs[id]);
    });
});

// NODE

function nout(message) {
    out(nodePrefix + message);
}

app.get("/node", (req, res) => {
    res.sendFile(dir + "/node.html");
});

node.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (token == undefined) {
        nout("client denied: no token");
        return next(new Error("No token provided"));
    }

    const nodeToken = nodeAccounts.find(nt => nt.token == token);

    if (nodeToken == undefined) {
        nout("client denied: invalid token");
        return next(new Error("Invalid token"));
    }

    nout("client connected");
    next();
});

node.on("connect", socket => {
    nodeConnected++;

    socket.on("disconnect", () => {
        nodeConnected--;
    });

    // ---

    socket.emit("history", history);

    socket.on("command", command => {
        log("admin@AppleDeck $ " + command);

        executeCommand(command);
    });
});

// START SERVERS

server.listen(clntPort, () => {
    cout(`listening on *:${clntPort}`);
});
