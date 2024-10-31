class RenderEngine {
    constructor(slideshow) {
        this.slideshow = this.xmlToJson(slideshow);
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
}
