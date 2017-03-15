﻿/**
 * XMLParser - Parses XML.
 * by Patrick Jentsch: https://github.com/Pevtrick
 */

/**
 * The XMLDocument.parse() method parses the XMLDocument, constructing the JavaScript value or object described by the document.
 * @param {String} [attributePrefix=] - A Prefix, which is added to all properties generated by XML attributes.
 * @returns {Object} - The generated object according to the XMLDocument.
 */
XMLDocument.prototype.parse = function(attributePrefix) {
    return XMLDocument.parse(this, attributePrefix);
};

/**
 * The XMLDocument.parse() static method parses a XMLDocument, constructing the JavaScript value or object described by the document.
 * @param {XMLDocument} xml - The document to be parsed.
 * @param {String} [attributePrefix=] - A string, which is added as a prefix to all properties generated by XML attributes.
 * @returns {Object} - The Object corresponding to the given XML document.
 */
XMLDocument.parse = function(xml, attributePrefix) {
    if (attributePrefix === undefined) {attributePrefix = "";}
    return processNode(xml, attributePrefix);

    function processNode(node) {
        var i;
        var object = null;

        switch(node.nodeType) {
            case Node.ELEMENT_NODE:
                /* Add some useful properties to node */
                node._hasAttributes = node.attributes.length > 0;
                node._haschildNodes = node.childNodes.length > 0;

                /* Return null if the node doesn't contain any attributes or child nodes */
                if (!node._hasAttributes && !node._haschildNodes) {
                    break;
                }

                object = {};

                /* Process attributes */
                for (i = 0; i < node.attributes.length; i++) {
                    object[attributePrefix + node.attributes[i].name] = node.attributes[i].value;
                }

                /* Process child nodes */
                for (i = 0; i < node.childNodes.length; i++) {
                    switch(node.childNodes[i].nodeType) {
                        case Node.ELEMENT_NODE:
                            break;
                        case Node.TEXT_NODE:
                            /* Add isEmpty property to node */
                            node.childNodes[i]._isEmpty = node.childNodes[i].data.trim() === "";
                            if (!node._hasAttributes && node.childNodes.length === 1) {
                                object = processNode(node.childNodes[i], attributePrefix);
                                continue;
                            } else {
                                if (node.childNodes[i]._isEmpty) {continue;}
                                if (object === null) {object = {};}
                            }
                            break;
                        case Node.COMMENT_NODE:
                        default:
                            processNode(node.childNodes[i], attributePrefix);
                            continue;
                    }
                    /**
                     * If the child node is the first of its type in this childset,
                     * process it and add it directly as a property to the return object.
                     * If not add it to an array which is set as a property of the return object.
                     */
                    if (node.childNodes[i].nodeName in object) {
                        if (!Array.isArray(object[node.childNodes[i].nodeName])) {
                            object[node.childNodes[i].nodeName] = [object[node.childNodes[i].nodeName]];
                        }
                        object[node.childNodes[i].nodeName].push(processNode(node.childNodes[i], attributePrefix));
                    } else {
                        object[node.childNodes[i].nodeName] = processNode(node.childNodes[i], attributePrefix);
                    }
                }
                break;
            case Node.TEXT_NODE:
                /* Add isEmpty property to node */
                node._isEmpty = node.data.trim() === "";
                if (!node._isEmpty) {
                    object = node.data.trim();
                }
                break;
            case Node.COMMENT_NODE:
                console.log("Skipping comment node:");
                console.log(node);
                break;
            case Node.DOCUMENT_NODE:
                object = {};
                object[node.documentElement.nodeName] = processNode(node.documentElement, attributePrefix);
                break;
            default:
                /**
                 * The following node types are not processed because they don't offer data, which has to be stored in the object:
                 * Node.PROCESSING_INSTRUCTION_NODE, Node.DOCUMENT_TYPE_NODE, Node.DOCUMENT_FRAGMENT_NODE
                 * The following node types are deprecated and therefore not supported by this function:
                 * Node.ATTRIBUTE_NODE, Node.CDATA_SECTION_NODE, Node.ENTITY_REFERENCE_NODE, Node.ENTITY_NODE, Node.NOTATION_NODE
                 */
                console.log("Node type: '" + node.nodeType + "' is not supported.");
                console.log(node);
                break;
        }
        return object;
    }
};