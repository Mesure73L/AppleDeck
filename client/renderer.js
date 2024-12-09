class RenderEngine {
    constructor(slideshow, type) {
        this.slideshow = this.xmlToJson(slideshow);
        this.width = this.getSlideshow().size.width;
        this.height = this.getSlideshow().size.height;
        this.type = type;
    }

    getSlideshow() {
        return this.slideshow;
    }

    getAllSlides() {
        return this.getSlideshow().slides;
    }

    getSlideJSON(slide) {
        return this.getSlideshow().slides[slide];
    }

    getSlide(slide) {
        const elements = this.getSlideJSON(slide).elements;
        const html = document.createElement("div");
        html.style.width = "100%";
        html.style.height = "100%";
        html.style.backgroundColor = this.getSlideJSON(slide).backgroundColor;

        for (let i = 0; i < elements.length; i++) {
            const e = elements[i];

            // STATIC ELEMENTS
            if (e.type == "Static") {
                // text
                if (e.template == "Text") {
                    const element = document.createElement("p");
                    element.innerText = e.text.replaceAll("\\n", "\n");
                    element.style.color = e.color;
                    element.style.fontFamily = e.fontFamily;
                    element.style.fontSize = e.fontSize + "px";
                    element.style.position = "absolute";
                    element.style.rotate = e.position.rotation + "deg";
                    element.style.whiteSpace = "nowrap";
                    element.style.textAlign = e.textAlign;

                    if (e.position.x == "Center") {
                        element.style.left = "50%";
                        element.style.transform = "translateX(-50%)";
                    } else if (e.position.x.startsWith("-")) {
                        element.style.right = e.position.x.substring(1) + "px";
                    } else {
                        element.style.left = e.position.x + "px";
                    }

                    if (e.position.y == "Center") {
                        element.style.top = "50%";
                        element.style.transform = "translateY(-50%)";
                    } else if (e.position.y.startsWith("-")) {
                        element.style.bottom = e.position.y.substring(1) + "px";
                    } else {
                        element.style.top = e.position.y + "px";
                    }

                    if (e.position.x == "Center" && e.position.y == "Center") {
                        element.style.transform = "translate(-50%, -50%)";
                    }

                    if (e.position.origin != null) {
                        const originY = e.position.origin.split("-")[0];
                        const originX = e.position.origin.split("-")[1];
                        element.style.transformOrigin = originX + " " + originY;

                        let transforms = [];

                        if (e.position.x.startsWith("-")) {
                            if (originX == "center") transforms.push("translateX(50%)");
                            else if (originX == "left") transforms.push("translateX(100%)");
                        } else {
                            if (originX == "center") transforms.push("translateX(-50%)");
                            else if (originX == "right") transforms.push("translateX(-100%)");
                        }

                        if (e.position.y.startsWith("-")) {
                            if (originY == "center") transforms.push("translateY(25%)");
                            else if (originY == "top") transforms.push("translateY(100%)");
                        } else {
                            if (originY == "center") transforms.push("translateY(-50%)");
                            else if (originY == "bottom") transforms.push("translateY(-100%)");
                        }

                        if (e.position.rotation) {
                            transforms.push(`rotate(${e.position.rotation}deg)`);
                        }

                        element.style.transform = transforms.join(" ");
                    }

                    WebFont.load({
                        google: {
                            families: [e.fontFamily]
                        }
                    });

                    html.append(element);
                } else if (e.template == "HTML") {
                    try {
                        const element = document.createElement("p");
                        element.innerHTML = e.text.replaceAll("\\n", "<br>");
                        element.style.color = e.color;
                        element.style.fontFamily = e.fontFamily;
                        element.style.fontSize = e.fontSize + "px";
                        element.style.position = "absolute";
                        element.style.rotate = e.position.rotation + "deg";
                        element.style.whiteSpace = "nowrap";
                        element.style.textAlign = e.textAlign;

                        if (e.position.x == "Center") {
                            element.style.left = "50%";
                            element.style.transform = "translateX(-50%)";
                        } else if (e.position.x.startsWith("-")) {
                            element.style.right = e.position.x.substring(1) + "px";
                        } else {
                            element.style.left = e.position.x + "px";
                        }

                        if (e.position.y == "Center") {
                            element.style.top = "50%";
                            element.style.transform = "translateY(-50%)";
                        } else if (e.position.y.startsWith("-")) {
                            element.style.bottom = e.position.y.substring(1) + "px";
                        } else {
                            element.style.top = e.position.y + "px";
                        }

                        if (e.position.x == "Center" && e.position.y == "Center") {
                            element.style.transform = "translate(-50%, -50%)";
                        }

                        if (e.position.origin != null) {
                            const originY = e.position.origin.split("-")[0];
                            const originX = e.position.origin.split("-")[1];
                            element.style.transformOrigin = originX + " " + originY;

                            let transforms = [];

                            if (e.position.x.startsWith("-")) {
                                if (originX == "center") transforms.push("translateX(50%)");
                                else if (originX == "left") transforms.push("translateX(100%)");
                            } else {
                                if (originX == "center") transforms.push("translateX(-50%)");
                                else if (originX == "right") transforms.push("translateX(-100%)");
                            }

                            if (e.position.y.startsWith("-")) {
                                if (originY == "center") transforms.push("translateY(25%)");
                                else if (originY == "top") transforms.push("translateY(100%)");
                            } else {
                                if (originY == "center") transforms.push("translateY(-50%)");
                                else if (originY == "bottom") transforms.push("translateY(-100%)");
                            }

                            if (e.position.rotation) {
                                transforms.push(`rotate(${e.position.rotation}deg)`);
                            }

                            element.style.transform = transforms.join(" ");
                        }

                        WebFont.load({
                            google: {
                                families: [e.fontFamily]
                            }
                        });

                        html.append(element);
                    } catch (e) {
                        alert(e);
                    }
                }

                // image
                else if (e.template == "Image") {
                    const element = document.createElement("img");
                    element.src = e.source;
                    element.width = e.size.width;
                    element.height = e.size.height;
                    element.style.position = "absolute";
                    element.style.rotate = e.position.rotation + "deg";

                    if (e.position.x == "Center") {
                        element.style.left = "50%";
                        element.style.transform = "translateX(-50%)";
                    } else if (e.position.x.startsWith("-")) {
                        element.style.right = e.position.x.substring(1) + "px";
                    } else {
                        element.style.left = e.position.x + "px";
                    }

                    if (e.position.y == "Center") {
                        element.style.top = "50%";
                        element.style.transform = "translateY(-50%)";
                    } else if (e.position.y.startsWith("-")) {
                        element.style.bottom = e.position.y.substring(1) + "px";
                    } else {
                        element.style.top = e.position.y + "px";
                    }

                    if (e.position.x == "Center" && e.position.y == "Center") {
                        element.style.transform = "translate(-50%, -50%)";
                    }

                    if (e.position.origin != null) {
                        const originY = e.position.origin.split("-")[0];
                        const originX = e.position.origin.split("-")[1];
                        element.style.transformOrigin = originX + " " + originY;

                        let transforms = [];

                        if (e.position.x.startsWith("-")) {
                            if (originX == "center") transforms.push("translateX(50%)");
                            else if (originX == "left") transforms.push("translateX(100%)");
                        } else {
                            if (originX == "center") transforms.push("translateX(-50%)");
                            else if (originX == "right") transforms.push("translateX(-100%)");
                        }

                        if (e.position.y.startsWith("-")) {
                            if (originY == "center") transforms.push("translateY(25%)");
                            else if (originY == "top") transforms.push("translateY(100%)");
                        } else {
                            if (originY == "center") transforms.push("translateY(-50%)");
                            else if (originY == "bottom") transforms.push("translateY(-100%)");
                        }

                        if (e.position.rotation) {
                            transforms.push(`rotate(${e.position.rotation}deg)`);
                        }

                        element.style.transform = transforms.join(" ");
                    }

                    html.append(element);
                }
            }

            // INTERACTIVE ELEMENTS
            else if (e.type == "Interactive") {
                // button
                if (e.template == "Button") {
                    const element = document.createElement("button");
                    element.innerText = e.text;
                    element.style.color = e.color;
                    element.style.fontFamily = e.fontFamily;
                    element.style.fontSize = e.fontSize + "px";
                    element.style.backgroundColor = e.backgroundColor;
                    element.style.border = `${e.border.size}px ${e.border.style} ${e.border.color}`;
                    element.style.width = e.size.width + "px";
                    element.style.height = e.size.height + "px";
                    element.style.position = "absolute";
                    element.style.rotate = e.position.rotation + "deg";
                    element.style.cursor = "pointer";

                    element.addEventListener("mouseover", () => {
                        element.style.color = e.hover.color;
                        element.style.backgroundColor = e.hover.backgroundColor;
                        element.style.border = `${e.hover.border.size}px ${e.hover.border.style} ${e.hover.border.color}`;
                    });

                    element.addEventListener("mouseout", () => {
                        element.style.color = e.color;
                        element.style.backgroundColor = e.backgroundColor;
                        element.style.border = `${e.border.size}px ${e.border.style} ${e.border.color}`;
                    });

                    if (e.run && this.getSlideshow().functions.some(func => func.name == e.run)) {
                        const run = this.getSlideshow().functions.find(func => func.name == e.run);

                        // toast
                        if (run.type == "Toast") {
                            element.addEventListener("click", () => {
                                Swal.fire({
                                    icon: run.icon,
                                    title: run.title,
                                    text: run.text,
                                    showConfirmButton: false,
                                    toast: true,
                                    position: run.position,
                                    timer: run.duration,
                                    timerProgressBar: true,
                                    didOpen: toast => {
                                        toast.onmouseenter = Swal.stopTimer;
                                        toast.onmouseleave = Swal.resumeTimer;
                                    }
                                });
                            });
                        }
                    }

                    if (e.position.x == "Center") {
                        element.style.left = "50%";
                        element.style.transform = "translateX(-50%)";
                    } else if (e.position.x.startsWith("-")) {
                        element.style.right = e.position.x.substring(1) + "px";
                    } else {
                        element.style.left = e.position.x + "px";
                    }

                    if (e.position.y == "Center") {
                        element.style.top = "50%";
                        element.style.transform = "translateY(-50%)";
                    } else if (e.position.y.startsWith("-")) {
                        element.style.bottom = e.position.y.substring(1) + "px";
                    } else {
                        element.style.top = e.position.y + "px";
                    }

                    if (e.position.x == "Center" && e.position.y == "Center") {
                        element.style.transform = "translate(-50%, -50%)";
                    }

                    if (e.position.origin != null) {
                        const originY = e.position.origin.split("-")[0];
                        const originX = e.position.origin.split("-")[1];
                        element.style.transformOrigin = originX + " " + originY;

                        let transforms = [];

                        if (e.position.x.startsWith("-")) {
                            if (originX == "center") transforms.push("translateX(50%)");
                            else if (originX == "left") transforms.push("translateX(100%)");
                        } else {
                            if (originX == "center") transforms.push("translateX(-50%)");
                            else if (originX == "right") transforms.push("translateX(-100%)");
                        }

                        if (e.position.y.startsWith("-")) {
                            if (originY == "center") transforms.push("translateY(25%)");
                            else if (originY == "top") transforms.push("translateY(100%)");
                        } else {
                            if (originY == "center") transforms.push("translateY(-50%)");
                            else if (originY == "bottom") transforms.push("translateY(-100%)");
                        }

                        if (e.position.rotation) {
                            transforms.push(`rotate(${e.position.rotation}deg)`);
                        }

                        element.style.transform = transforms.join(" ");
                    }

                    WebFont.load({
                        google: {
                            families: [e.fontFamily]
                        }
                    });

                    html.append(element);
                }

                // input
                else if (e.template == "Input") {
                    const element = document.createElement("input");
                    element.style.position = "absolute";
                    element.style.width = e.size.width + "px";
                    element.style.height = e.size.height + "px";
                    element.style.color = e.color;
                    element.style.fontFamily = e.fontFamily;
                    element.style.fontSize = e.fontSize + "px";
                    element.placeholder = e.placeholder.text;
                    element.style.backgroundColor = e.backgroundColor;
                    element.style.outline = "none";
                    element.style.border = `${e.border.size}px ${e.border.style} ${e.border.color}`;
                    element.style.rotate = e.position.rotation + "deg";
                    element.style.textAlign = e.textAlign;
                    element.style.setProperty("--placeholder-color", e.placeholder.color);
                    element.maxLength = 2048;

                    const uniqueClass = "input-" + Math.random().toString(36).substring(2, 9);
                    element.classList.add(uniqueClass);

                    const style = document.getElementById("slide-style");

                    style.textContent = `
                    .${uniqueClass}::placeholder {
                        color: ${e.placeholder.color};
                    }
                    .${uniqueClass}::-webkit-input-placeholder {
                        color: ${e.placeholder.color};
                    }
                    .${uniqueClass}::-moz-placeholder {
                        color: ${e.placeholder.color};
                    }
                    .${uniqueClass}::-ms-input-placeholder {
                        color: ${e.placeholder.color};
                    }`;

                    if (this.type != "user") {
                        element.style.cursor = "pointer";
                        element.style.fontFamily = e.disabled.fontFamily;
                        element.style.fontSize = e.disabled.fontSize + "px";
                        element.placeholder = e.disabled.text;
                        element.style.backgroundColor = e.disabled.backgroundColor;
                        element.style.outline = "none";
                        element.style.border = `${e.disabled.border.size}px ${e.disabled.border.style} ${e.disabled.border.color}`;
                        element.style.textAlign = e.disabled.textAlign;
                        element.addEventListener("mousedown", event => {
                            event.preventDefault();
                            showResponses(e.id);
                        });
                        document.getElementById("slide-style").innerText = `
                        .${uniqueClass}::placeholder {
                            color: ${e.disabled.color};
                        }
                        .${uniqueClass}::-webkit-input-placeholder {
                            color: ${e.disabled.color};
                        }
                        .${uniqueClass}::-moz-placeholder {
                            color: ${e.disabled.color};
                        }
                        .${uniqueClass}::-ms-input-placeholder {
                            color: ${e.disabled.color};
                        }`;

                        inputInterval = setInterval(function () {
                            socket.emit("get input", e.id);
                        }, 2000);
                    }

                    let debounceTimer;
                    let lastEmitTime = 0;
                    const DEBOUNCE_DELAY = 3000;

                    element.addEventListener("keyup", () => {
                        clearTimeout(debounceTimer);

                        const now = Date.now();
                        if (now - lastEmitTime >= DEBOUNCE_DELAY) {
                            socket.emit("interactive - input", {id: e.id, value: element.value});
                            lastEmitTime = now;
                        } else {
                            debounceTimer = setTimeout(() => {
                                socket.emit("interactive - input", {
                                    id: e.id,
                                    value: element.value
                                });
                                lastEmitTime = Date.now();
                            }, DEBOUNCE_DELAY);
                        }
                    });

                    if (e.position.x == "Center") {
                        element.style.left = "50%";
                        element.style.transform = "translateX(-50%)";
                    } else if (e.position.x.startsWith("-")) {
                        element.style.right = e.position.x.substring(1) + "px";
                    } else {
                        element.style.left = e.position.x + "px";
                    }

                    if (e.position.y == "Center") {
                        element.style.top = "50%";
                        element.style.transform = "translateY(-50%)";
                    } else if (e.position.y.startsWith("-")) {
                        element.style.bottom = e.position.y.substring(1) + "px";
                    } else {
                        element.style.top = e.position.y + "px";
                    }

                    if (e.position.x == "Center" && e.position.y == "Center") {
                        element.style.transform = "translate(-50%, -50%)";
                    }

                    if (e.position.origin != null) {
                        const originY = e.position.origin.split("-")[0];
                        const originX = e.position.origin.split("-")[1];
                        element.style.transformOrigin = originX + " " + originY;

                        let transforms = [];

                        if (e.position.x.startsWith("-")) {
                            if (originX == "center") transforms.push("translateX(50%)");
                            else if (originX == "left") transforms.push("translateX(100%)");
                        } else {
                            if (originX == "center") transforms.push("translateX(-50%)");
                            else if (originX == "right") transforms.push("translateX(-100%)");
                        }

                        if (e.position.y.startsWith("-")) {
                            if (originY == "center") transforms.push("translateY(25%)");
                            else if (originY == "top") transforms.push("translateY(100%)");
                        } else {
                            if (originY == "center") transforms.push("translateY(-50%)");
                            else if (originY == "bottom") transforms.push("translateY(-100%)");
                        }

                        if (e.position.rotation) {
                            transforms.push(`rotate(${e.position.rotation}deg)`);
                        }

                        element.style.transform = transforms.join(" ");
                    }

                    html.append(element);
                }
            }
        }

        return html;
    }

    xmlToJson(xml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        const json = {};

        function convertXmlToJson(xmlNode) {
            const nodeName = xmlNode.nodeName
                .replace(/([A-Z]{3,})/g, match => match.toLowerCase())
                .replace(
                    /(\w)(\w*)/g,
                    (g0, g1, g2) =>
                        g1.toLowerCase() + g2.replace(/^./, match => match.toLowerCase())
                );

            if (xmlNode.childNodes.length === 0) {
                return xmlNode.textContent || "";
            }

            if (nodeName.endsWith("s")) {
                const firstChild = Array.from(xmlNode.childNodes).find(
                    child => child.nodeType === Node.ELEMENT_NODE
                );

                const isTruePlural =
                    firstChild &&
                    firstChild.nodeName.toLowerCase() === nodeName.slice(0, -1).toLowerCase();

                if (isTruePlural) {
                    const list = [];
                    xmlNode.childNodes.forEach(child => {
                        if (child.nodeType === Node.ELEMENT_NODE) {
                            list.push(convertXmlToJson(child));
                        }
                    });
                    return list;
                }
            }

            const result = {};
            let textContent = "";

            xmlNode.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    textContent += child.textContent;
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const childName = child.nodeName
                        .replace(/([A-Z]{3,})/g, match => match.toLowerCase())
                        .replace(
                            /(\w)(\w*)/g,
                            (g0, g1, g2) =>
                                g1.toLowerCase() + g2.replace(/^./, match => match.toLowerCase())
                        );
                    result[childName] = convertXmlToJson(child);
                }
            });

            if (Object.keys(result).length === 0 && textContent.trim()) {
                return textContent.trim();
            } else if (textContent.trim()) {
                Object.assign(result, {value: textContent.trim()});
                return result;
            }

            return result;
        }

        return convertXmlToJson(xmlDoc.documentElement);
    }

    getAspectRatio() {
        const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
        const greatestCommonDivisor = gcd(this.width, this.height);
        const simplifiedWidth = this.width / greatestCommonDivisor;
        const simplifiedHeight = this.height / greatestCommonDivisor;
        return `${simplifiedWidth}:${simplifiedHeight}`;
    }

    getAspectRatioDivision() {
        const ratio = this.getAspectRatio().split(":");
        return parseInt(ratio[0]) / parseInt(ratio[1]);
    }
}
