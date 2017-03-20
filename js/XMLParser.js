﻿/**
 * XMLParser - Parses XML.
 * GitHub: https://github.com/Pevtrick/XMLParser
 * by Patrick Jentsch: https://github.com/Pevtrick
 */

/**
 * The XMLDocument.parse() method parses the XMLDocument, constructing the JavaScript value or object described by the document.
 * @param {String} [attributePrefix=] - A Prefix, which is added to all properties generated by XML attributes.
 * @returns {Object} - The generated object according to the XMLDocument.
 */
XMLDocument.prototype.parse = function(attributePrefix) {
    if (attributePrefix === undefined) {attributePrefix = "";}
    var object;

    object = {};
    object[this.documentElement.nodeName] = this.documentElement.parse(attributePrefix);

    return object;
};

/**
 * The Node.parse() method parses the Node, constructing the JavaScript value or object described by the node.
 * @param {String} [attributePrefix=] - A Prefix, which is added to all properties generated by XML attributes.
 * @returns {Object} - The generated object according to the Node.
 */
Node.prototype.parse = function(attributePrefix) {
    var hasAttributes;
    var hasChildNodes;
    var i;
    var object;

    object = null;

    switch (this.nodeType) {
        case Node.ELEMENT_NODE:
            /* Add some useful properties to node */
            hasAttributes = this.attributes.length > 0;
            hasChildNodes = this.childNodes.length > 0;

            /* Return null if the node doesn't contain any attributes or child nodes */
            if (!(hasAttributes || hasChildNodes)) {
                break;
            }

            object = {};

            /* Process attributes */
            for (i = 0; i < this.attributes.length; i++) {
                object[attributePrefix + this.attributes[i].name] = this.attributes[i].value;
            }

            /* Process child nodes */
            for (i = 0; i < this.childNodes.length; i++) {
                switch (this.childNodes[i].nodeType) {
                    case Node.ELEMENT_NODE:
                        break;
                    case Node.TEXT_NODE:
                        /* Check whether the child text node is the only content of the this. */
                        if (!hasAttributes && this.childNodes.length === 1) {
                            object = this.childNodes[i].parse(attributePrefix);
                            continue;
                        }
                        if (this.childNodes[i].data.trim() === "") {continue;}
                        break;
                    default:
                        /* This recursion leads to a console message. */
                        this.childNodes[i].parse(attributePrefix);
                        continue;
                }
                /**
                 * If the child node is the first of its type in this childset,
                 * process it and add it directly as a property to the return object.
                 * If not add it to an array which is set as a property of the return object.
                 */
                if (this.childNodes[i].nodeName in object) {
                    if (!Array.isArray(object[this.childNodes[i].nodeName])) {
                        object[this.childNodes[i].nodeName] = [object[this.childNodes[i].nodeName]];
                    }
                    object[this.childNodes[i].nodeName].push(this.childNodes[i].parse(attributePrefix));
                } else {
                    object[this.childNodes[i].nodeName] = this.childNodes[i].parse(attributePrefix);
                }
            }
            break;
        case Node.TEXT_NODE:
            if (this.data.trim() !== "") {
                object = this.data;
            }
            break;
        case Node.COMMENT_NODE:
            console.log("Skipping comment node:");
            console.log(node);
            break;
        case Node.DOCUMENT_NODE:
            object = {};
            object[this.documentElement.nodeName] = this.documentElement.parse(attributePrefix);
            break;
        default:
            /**
             * The following node types are not processed because they don't offer data, which has to be stored in the object:
             * Node.PROCESSING_INSTRUCTION_NODE, Node.DOCUMENT_TYPE_NODE, Node.DOCUMENT_FRAGMENT_NODE
             * The following node types are deprecated and therefore not supported by this function:
             * Node.ATTRIBUTE_NODE, Node.CDATA_SECTION_NODE, Node.ENTITY_REFERENCE_NODE, Node.ENTITY_NODE, Node.NOTATION_NODE
             */
            console.log("Node type: '" + this.nodeType + "' is not supported.");
            console.log(node);
            break;
    }

    return object;
}