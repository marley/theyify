function walk(rootNode)
{
    // Find all the text nodes in rootNode
    var walker = document.createTreeWalker(
        rootNode,
        NodeFilter.SHOW_TEXT,
        null,
        false
    ),
    node;

    // Modify each text node's value
    while (node = walker.nextNode()) {
        handleText(node);
    }
}

function handleText(textNode) {
  textNode.nodeValue = replaceText(textNode.nodeValue);
}

function replaceText(v)
{
 
    // 'he or she' to 'they'
    v = v.replace(/\bHe or she\b/g, "They");
    v = v.replace(/\bhe or she\b/g, "they");
    v = v.replace(/\bShe or he\b/g, "They");
    v = v.replace(/\bshe or he\b/g, "they");

    // 'him or her' to 'them'
    v = v.replace(/\bHim or her\b/g, "Them");
    v = v.replace(/\bhim or her\b/g, "them");
    v = v.replace(/\bHer or him\b/g, "Them");
    v = v.replace(/\bher or him\b/g, "them");
  
    // 'his or her' to 'their'
    v = v.replace(/\bHis or her\b/g, "Their");
    v = v.replace(/\bhis or her\b/g, "their");
    v = v.replace(/\bHer or his\b/g, "Their");
    v = v.replace(/\bher or his\b/g, "their");

    // 'he/she', 'him/her', 'his/her'
    v = v.replace(/\bHe\/She\b/g, "They");
    v = v.replace(/\bhe\/she\b/g, "they");
    v = v.replace(/\bHim\/Her\b/g, "Them");
    v = v.replace(/\bhim\/her\b/g, "them");
    v = v.replace(/\bHis\/Her\b/g, "Their");
    v = v.replace(/\bhis\/her\b/g, "their");


    return v;
}

// Returns true if a node should *not* be altered in any way
function isForbiddenNode(node) {
    return node.isContentEditable || // DraftJS and many others
    (node.parentNode && node.parentNode.isContentEditable) || // Special case for Gmail
    (node.tagName && (node.tagName.toLowerCase() == "textarea" || // Some catch-alls
                     node.tagName.toLowerCase() == "input"));
}

// The callback used for the document body and title observers
function observerCallback(mutations) {
    var i, node;

    mutations.forEach(function(mutation) {
        for (i = 0; i < mutation.addedNodes.length; i++) {
            node = mutation.addedNodes[i];
            if (isForbiddenNode(node)) {
                // Should never operate on user-editable content
                continue;
            } else if (node.nodeType === 3) {
                // Replace the text for text nodes
                handleText(node);
            } else {
                // Otherwise, find text nodes within the given node and replace text
                walk(node);
            }
        }
    });
}

// Walk the doc (document) body, replace the title, and observe the body and title
function walkAndObserve(doc) {
    var docTitle = doc.getElementsByTagName('title')[0],
    observerConfig = {
        characterData: true,
        childList: true,
        subtree: true
    },
    bodyObserver, titleObserver;

    // Do the initial text replacements in the document body and title
    walk(doc.body);
    doc.title = replaceText(doc.title);

    // Observe the body so that we replace text in any added/modified nodes
    bodyObserver = new MutationObserver(observerCallback);
    bodyObserver.observe(doc.body, observerConfig);

    // Observe the title so we can handle any modifications there
    if (docTitle) {
        titleObserver = new MutationObserver(observerCallback);
        titleObserver.observe(docTitle, observerConfig);
    }
}
walkAndObserve(document);
