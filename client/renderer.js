class RenderEngine {
    constructor(slideshow) {
        this.slideshow = this.xmlToJson(slideshow);
        this.width = this.getSlideshow().size.width;
        this.height = this.getSlideshow().size.height;
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
                    element.innerText = e.text;
                    element.style.color = e.color;
                    element.style.fontFamily = e.fontFamily;
                    element.style.fontSize = e.fontSize + "px";
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

                    WebFont.load({
                        google: {
                            families: [e.fontFamily]
                        }
                    });

                    html.append(element);
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
                const list = [];
                xmlNode.childNodes.forEach(child => {
                    if (child.nodeType === Node.ELEMENT_NODE) {
                        list.push(convertXmlToJson(child));
                    }
                });
                return list;
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
