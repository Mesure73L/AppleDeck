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
let banned = [];
let history = [];

function out(message) {
    console.log(message);
    history.push(message);
}

function jout(message) {
    out(joinPrefix + message);
}

function uout(message) {
    out(userPrefix + message);
}

function hout(message) {
    out(hostPrefix + message);
}

function sout(message) {
    out(specPrefix + message);
}

function nout(message) {
    out(nodePrefix + message);
}

// JOIN

joinApp.get("/", (req, res) => {
    res.sendFile(dir + "/join.html");
});

join.on("connect", socket => {
    jout("client connected");

    socket.on("disconnect", () => {
        jout("client disconnected");
    });
});

// USER

userApp.get("/", (req, res) => {
    res.sendFile(dir + "/user.html");
});

user.on("connection", socket => {
    uout("client connected");

    socket.on("disconnect", () => {
        uout("client disconnected");
    });
});

// HOST

hostApp.get("/", (req, res) => {
    res.sendFile(dir + "/host.html");
});

host.on("connect", socket => {
    hout("client connected");

    socket.on("disconnect", () => {
        hout("client disconnected");
    });
});

// SPEC

specApp.get("/", (req, res) => {
    res.sendFile(dir + "/spec.html");
});

spec.on("connect", socket => {
    sout("client connected");

    socket.on("disconnect", () => {
        sout("client disconnected");
    });
});

// NODE

nodeApp.get("/", (req, res) => {
    res.sendFile(dir + "/node.html");
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
