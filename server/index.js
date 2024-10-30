// CONFIG

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

const {profanity, CensorType} = require("@2toad/profanity");

let connected = [];
let userTokens = [];
let banned = [];
let history = [];

let joinConnected = 0;
let userConnected = 0;
let hostConnected = 0;
let specConnected = 0;
let nodeConnected = 0;

function out(message) {
    console.log(message);
    history.push(message);
    node.emit("output", message);
}

function log(message) {
    console.log(message);
    history.push(message);
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

// SETUP COMMAND FUNCTIONS

const dangerousCommands = [];

function executeCommand(command) {
    // session ...
    if (command.startsWith("session")) {
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
    }

    out("Command not found");
}

function canHostExecute(command) {
    if (dangerousCommands.includes(command)) return true;
    return false;
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

// JOIN

function jout(message) {
    out(joinPrefix + message);
}

app.get("/", (req, res) => {
    res.sendFile(dir + "/join.html");
});

join.on("connect", socket => {
    jout("client connected");
    joinConnected++;

    socket.on("disconnect", () => {
        jout("client disconnected");
        joinConnected--;
    });

    // ---

    socket.on("new user", originalUsername => {
        let username = originalUsername.trim();
        username = username.length > 30 ? username.slice(0, 27) + "..." : username;
        jout(username + " is requesting to join");

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

        // username approved
        const token = generateToken();
        jout(username + " was approved");
        jout(username + "'s token is " + token);
        connected.push(username);
        userTokens.push({username: username, token: token});

        socket.emit("user approval", {
            permission: true,
            token: token
        });
    });
});

// USER

function uout(message) {
    out(userPrefix + message);
}

app.get("/user", (req, res) => {
    res.sendFile(dir + "/user.html");
});

user.on("connect", socket => {
    uout("client connected");
    userConnected++;

    socket.on("disconnect", () => {
        uout("client disconnected");
        userConnected--;
    });

    // ---
});

// HOST

function hout(message) {
    out(hostPrefix + message);
}

app.get("/host", (req, res) => {
    res.sendFile(dir + "/host.html");
});

host.on("connect", socket => {
    hout("client connected");
    hostConnected++;

    socket.on("disconnect", () => {
        hout("client disconnected");
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

spec.on("connect", socket => {
    sout("client connected");
    specConnected++;

    socket.on("disconnect", () => {
        sout("client disconnected");
        specConnected--;
    });

    // ---
});

// NODE

function nout(message) {
    out(nodePrefix + message);
}

app.get("/node", (req, res) => {
    res.sendFile(dir + "/node.html");
});

node.on("connect", socket => {
    nout("client connected");
    nodeConnected++;

    socket.on("disconnect", () => {
        nout("client disconnected");
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
