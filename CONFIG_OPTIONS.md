# AppleDeck Config

At the start of `server/index.js`, there is a section for config. This document will explain each config option and what it does.

## Allowing Toasts

This config option lets you say if you want toasts to be enabled. This should be a boolean (true/false).

Default:

```js
const allowToasts = true;
```

### Why does this option exist?

The toasts use a library called [SweetAlert2](https://github.com/sweetalert2/sweetalert2). In some domains, the website will be blocked and it will play the national anthem of Ukraine.

Exerpt from their README:

> **Important notice about the usage of this software for `.ru`, `.su`, `.by`, and `.рф` domain zones**
>
> As a consequence of the illegal war in Ukraine, the behavior of this repository and related npm package [sweetalert2](https://www.npmjs.com/package/sweetalert2) is different for `.ru`, `.su`, `.by`, and `.рф` domain zones.
>
> Including this software in any domain in `.ru`, `.su`, `.by`, and `.рф` domain zones will block the website navigation and play the national anthem of Ukraine.
>
> This behavior is classified as [protestware](https://snyk.io/blog/protestware-open-source-types-impact/) and this project is listed in [GitHub Advisory Database](https://github.com/advisories/GHSA-mrr8-v49w-3333) and [Snyk Vulnerability DB](https://security.snyk.io/package/npm/sweetalert2/11.5.2).

AppleDeck is not protestware, but uses the SweetAlert2 library which is. If you want to use AppleDeck on `.ru`, `.su`, `.by`, or `.рф` domains, you should set this to false to prevent the library from loading.

## Default Settings

These options are settings that can be changed using the console. These do not need to be changed for any reason but can to make the startup process easier.

### Starting Slideshow

This option should be a URL (in a string) that contains the XML file for your slideshow.

Default:

```js
const startingSlideshow = "";
```

### Default Allowlist

There are two options here. The first says if the allowlist should be enabled by default (boolean) and the second is the actual allowlist (list of strings).

Default:

```js
let allowlist = false;
let allowed = [];
```

### Default Denylist

This option is a list of usernames as strings and says what usernames are banned by default.

Default:

```js
let banned = [];
```

## Client Port

This option is an integer containing the port to start the server on. If there are other servers being hosted on the localhost, there may be conflict with some ports.

Default:

```js
const clntPort = 3000;
```

## Logging Prefixes

These settings change the prefixes of certain console messages. Changing these may also require changing them in `client/node.html`.

Default:

```js
const clntPrefix = "[CLNT] ";
const joinPrefix = "[JOIN] ";
const userPrefix = "[USER] ";
const hostPrefix = "[HOST] ";
const specPrefix = "[SPEC] ";
const nodePrefix = "[NODE] ";
```

## Namespace Names

These options change the names of the namespaces that are used by socket.io. Changing these will require changing them in all HTML files in the `~/client` directory.

Default:

```js
const joinNamespace = "/join";
const userNamespace = "/user";
const hostNamespace = "/host";
const specNamespace = "/spec";
const nodeNamespace = "/node";
```

## Token Length

This option is an integer and says how many segments should be in a token.

Default:

```js
const tokenLength = 5;
```
