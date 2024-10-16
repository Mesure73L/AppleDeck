// CONFIG

const joinPort = 3000;
const userPort = 3001;
const hostPort = 3002;
const specPort = 3003;
const nodePort = 3004;

const joinPrefix = "[JOIN] ";
const userPrefix = "[USER] ";
const hostPrefix = "[HOST] ";
const specPrefix = "[SPEC] ";
const nodePrefix = "[NODE] ";

const tokenLength = 3;

// SETUP SERVERS

const express = require("express");
const joinApp = express();
const userApp = express();
const hostApp = express();
const specApp = express();
const nodeApp = express();
const http = require("http");
const joinServer = http.createServer(joinApp);
const userServer = http.createServer(userApp);
const hostServer = http.createServer(hostApp);
const specServer = http.createServer(specApp);
const nodeServer = http.createServer(nodeApp);
const {Server} = require("socket.io");
const {isBooleanObject} = require("util/types");
const join = new Server(joinServer);
const user = new Server(userServer);
const host = new Server(hostServer);
const spec = new Server(specServer);
const node = new Server(nodeServer);
const dir = __dirname.replace("server", "client");

// OTHER SETUP

let connected = [];
let userTokens = [];
let banned = [];
let history = [];

function out(message) {
    console.log(message);
    history.push(message);
}

function generateToken() {
    let token = "";

    for (let i = 0; i < tokenLength; i++) {
        token += Math.random().toString(36);
    }

    return token.replaceAll("0.", "");
}

// JOIN

function jout(message) {
    out(joinPrefix + message);
}

joinApp.get("/", (req, res) => {
    res.sendFile(dir + "/join.html");
});

joinApp.get("/logo", (req, res) => {
    res.sendFile(dir + "/logo.png");
});

join.on("connect", socket => {
    jout("client connected");

    socket.on("disconnect", () => {
        jout("client disconnected");
    });

    // ---

    socket.on("New User", username => {
        jout(username + " is requesting to join");

        if (connected.includes(username)) {
            return join.emit("User Approval", {
                username: username,
                permission: false,
                reason: "Nickname is already in use!"
            });
        }

        if (banned.includes(username)) {
            return join.emit("User Approval", {
                username: username,
                permission: false,
                reason: "Nickname is banned!"
            });
        }

        const token = generateToken();
        jout(username + " was approved");
        jout(username + "'s token is " + token);
        connected.push(username);
        userTokens.push({username: username, token: token});

        join.emit("User Approval", {
            username: username,
            permission: true,
            token: token
        });
    });
});

// USER

function uout(message) {
    out(userPrefix + message);
}

userApp.get("/", (req, res) => {
    res.sendFile(dir + "/user.html");
});

userApp.get("/logo", (req, res) => {
    res.sendFile(dir + "/logo.png");
});

user.on("connection", socket => {
    uout("client connected");

    socket.on("disconnect", () => {
        uout("client disconnected");
    });
});

// HOST

function hout(message) {
    out(hostPrefix + message);
}

hostApp.get("/", (req, res) => {
    res.sendFile(dir + "/host.html");
});

hostApp.get("/logo", (req, res) => {
    res.sendFile(dir + "/logo.png");
});

host.on("connect", socket => {
    hout("client connected");

    socket.on("disconnect", () => {
        hout("client disconnected");
    });
});

// SPEC

function sout(message) {
    out(specPrefix + message);
}

specApp.get("/", (req, res) => {
    res.sendFile(dir + "/spec.html");
});

specApp.get("/logo", (req, res) => {
    res.sendFile(dir + "/logo.png");
});

spec.on("connect", socket => {
    sout("client connected");

    socket.on("disconnect", () => {
        sout("client disconnected");
    });
});

// NODE

function nout(message) {
    out(nodePrefix + message);
}

nodeApp.get("/", (req, res) => {
    res.sendFile(dir + "/node.html");
});

nodeApp.get("/logo", (req, res) => {
    res.sendFile(dir + "/logo.png");
});

node.on("connect", socket => {
    nout("client connected");

    socket.on("disconnect", () => {
        nout("client disconnected");
    });
});

// START SERVERS

joinServer.listen(joinPort, () => {
    jout(`listening on *:${joinPort}`);
});

userServer.listen(userPort, () => {
    uout(`listening on *:${userPort}`);
});

hostServer.listen(hostPort, () => {
    hout(`listening on *:${hostPort}`);
});

specServer.listen(specPort, () => {
    sout(`listening on *:${specPort}`);
});

nodeServer.listen(nodePort, () => {
    nout(`listening on *:${nodePort}`);
});
