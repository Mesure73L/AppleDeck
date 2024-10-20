// CONFIG

const clntPort = 3000;

const clntPrefix = "[CLNT] ";
const joinPrefix = "[JOIN] ";
const userPrefix = "[USER] ";
const hostPrefix = "[HOST] ";
const specPrefix = "[SPEC] ";
const nodePrefix = "[NODE] ";

const joinNamespace = "/join";
const userNamespace = "/user";
const hostNamespace = "/host";
const specNamespace = "/spec";
const nodeNamespace = "/node";

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

// OTHER SETUP

const {profanity, CensorType} = require("@2toad/profanity");

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
        if (i != tokenLength - 1) {
            token += "-";
        }
    }

    return token.replaceAll("0.", "");
}

// CLNT

function cout(message) {
    out(clntPrefix + message);
}

app.get("/logo", (req, res) => {
    res.sendFile(dir + "/logo.png");
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

    socket.on("disconnect", () => {
        jout("client disconnected");
    });

    // ---

    socket.on("New User", fullUsername => {
        const username = fullUsername.trim();

        jout(username + " is requesting to join");

        if (connected.includes(username)) {
            jout(username + " was denied: name in use");
            return join.emit("User Approval", {
                username: username,
                permission: false,
                reason: "Nickname is already in use!"
            });
        }

        if (username == "" || username == undefined) {
            jout(username + " was denied: name is blank");
            return join.emit("User Approval", {
                username: username,
                permission: false,
                reason: "Nickname cannot be blank!"
            });
        }

        if (banned.includes(username)) {
            jout(username + " was denied: name is banned");
            return join.emit("User Approval", {
                username: username,
                permission: false,
                reason: "Nickname is banned!"
            });
        }

        if (profanity.exists(username)) {
            jout(username + " was denied: name contains profanity");
            return join.emit("User Approval", {
                username: username,
                permission: false,
                reason: "Nickname cannot contain profanity!"
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

app.get("/user", (req, res) => {
    res.sendFile(dir + "/user.html");
});

user.on("connect", socket => {
    uout("client connected");

    socket.on("disconnect", () => {
        uout("client disconnected");
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

    socket.on("disconnect", () => {
        hout("client disconnected");
    });

    // ---
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

    socket.on("disconnect", () => {
        sout("client disconnected");
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

    socket.on("disconnect", () => {
        nout("client disconnected");
    });

    // ---
});


// START SERVERS

server.listen(clntPort, () => {
    cout(`listening on *:${clntPort}`);
});
