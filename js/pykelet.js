// pykelet.js 
/**
 * @file pykelet.js
 * @fileoverview This script reads a special **'Pykelet comment block'** from the HTML.
 * * --- **JSDoc and File Structure Requirements** ---
 * This file uses a specific header structure for documentation and version control:
 * 1. Must begin with the **JSDoc block** (`/** ... */`).
 * 2. Mandatory tags are typically **@file** (first) and **@fileoverview**.
 * 3. Optional tags like **@license** and **@author** should follow.
 * 4. The **mandatory `window.versions` update code** must immediately follow the JSDoc block.
 * * --- **Pykelet Comment Block (HTML Metadata)** ---
 * * **1. Pykelet Comment Block:**
 * The block must be an **HTML comment** (<!-- ... -->) placed **before the `<html>` tag** (after `<!DOCTYPE html>`).
 * THE HTML data must start with the marker `PYKELET` on the first line, followed by metadata in YAML Jekyll/Hugo `KEY: VALUE` format.
 * * **Example HTML Structure:**
 * <!DOCTYPE html>
 * <!--PYKELET
 * TITLE: My Document Title
 * AUTHOR: John Doe
 * -->
 * <html>
 * <head>
 * <script src="js/pykelet.js"></script>
 * ...
 * The `pykelet.js` reference is recommended to be placed immediately after the `<head>` tag so that any subsequent scripting can reference the named key-value pairs as set in the comment block.
 *
 * * **2. Core Functionality:**
 * The script copies all key-value pairs found within this block into `document.pykelet.comment`.
 * Additionally, it automatically populates HTML elements whose `id` attribute matches a
 * key from the Pykelet block (e.g., an element with id="TITLE" will get the content
 * from the 'TITLE' key).
 * * **3. IMPORTANT:** * Include this script as early as possible in the document (ideally as the first item in the `<head>`),
 * and ensure the **Pykelet comment block** is placed **immediately after `<!DOCTYPE html>`** for reliable access.
 * * **4. Disable Auto-Fill:**
 * Auto-filling can be disabled by defining `const disabled_fillDocumentFromPykeletComments = true;`
 * in a script *before* this file is loaded.
 * * @author Andrew Kingdom
 * @license MIT (3-clause BSD)
 * @copyright You MAY freely use this file but NO ONE SHALL REMOVE the author credentials.
 */
window.versions={...(window.versions||{}), pykelet:'2.0.6'}; // Update versions object with our version single source of truth. NB: @version is not used in the JSDOC above.


/**
 * Initializes the document.pykelet object by immediately reading the Pykelet block from the HTML.
 * This should be called early to make the metadata available as soon as possible.
 */
function initPykeletFromComment() {
	document.pykelet = {
        comment: getPykeletFromComment() // Grab details from the Pykelet block comment immediately.
	};
}

/**
 * Populates HTML elements with content from the parsed Pykelet block.
 * An HTML element's 'id' must match a key (case-insensitive) from the Pykelet block for it to be filled.
 * For example, if the Pykelet block contains 'TITLE: My Page', an element <span id="TITLE"></span>
 * will have its textContent set to "My Page".
 * @param {boolean} [force=false] - If true, forces the document filling even if
 * 'disabled_fillDocumentFromPykeletComments' is defined.
 */
function fillDocumentFromPykeletComments(force = false) {
    if (!force && typeof(disabled_fillDocumentFromPykeletComments) !== 'undefined') {
        console.log('Pykelet document filling skipped as disabled_fillDocumentFromPykeletComments is true.');
        return; // Don't fill the document if disabled_fillDocumentFromPykeletComments is defined, unless forced.
    }

	const comments = document.pykelet.comment;
    if (comments) {
        for (let key in comments) {
            if (comments.hasOwnProperty(key)) {
                // Keys from the Pykelet block are automatically converted to uppercase by getPykeletFromComment.
                // Ensure we match element IDs in a case-insensitive way if needed,
                // but direct match is simpler if IDs are expected to be uppercase.
                const element = document.getElementById(key); // Assuming HTML IDs will match the uppercase keys
                if (element) {
                    element.textContent = comments[key];
//                     console.debug(`Pykelet: Populated element #${key} with '${comments[key]}'`);
                } else {
//                     console.debug(`Pykelet: No element found with ID '${key}' to populate.`);
                }
            }
        }
    } else {
        console.warn('Pykelet: No metadata found in Pykelet block comment to fill document elements.');
    }
}

/**
 * Searches the HTML document for the first 'Pykelet block' comment and parses its contents.
 * A 'Pykelet block' is an HTML comment starting with 'PYKELET'.
 * Inside, it contains key:value pairs, one per line.
 * Example
 * *    <!--PYKELET
 * *    DESCRIPTION: This tool helps identify the most important parts in a text.
 * *    TITLE:		Identify key phrases in a text.
 * *    FILENAME:    text_tool.html
 * *    AUTHOR:      Andrew Kingdom
 * *    -->
 * The extracted key-value pairs are returned as an object (dictionary).
 * This function replicates the functionality of a YAML front matter block,
 * adapted for HTML comments.
 * @param {Comment|undefined} [pykeletComment=undefined] - Optional. A specific comment Node to parse.
 * If undefined, the function will search the document.
 * @returns {Object|null} An object containing the extracted key-value pairs, or null if no Pykelet block is found.
 */
function getPykeletFromComment(pykeletComment = undefined) {
    /**
     * Helper function to get all comment nodes from a given DOM element.
     * @param {Element} elem - The DOM element to search within.
     * @returns {Comment[]} An array of comment nodes.
     */
	function getComments(elem) {
	  return Array.from(elem.childNodes).filter(node => node.nodeType === Node.COMMENT_NODE);
	}
    /**
     * Helper function to get all comment nodes from a given DOM element.
     * @param {Element} elem - The DOM element to search within.
     * @returns {Comment[]} An array of comment nodes.
     */	
	function isValidPykeletNode(node){
    return node && node.nodeType === Node.COMMENT_NODE &&
           typeof node.nodeValue === "string" &&
           node.nodeValue.trim().startsWith("PYKELET");
  }

	if(pykeletComment === undefined) {
        // If no specific comment is provided, search the document for the first PYKELET comment.
        // It first checks for a 'markdown-body' class (common in GitHub-rendered HTML)
        // as a potential container, otherwise, it searches the entire document body.
        const githubBody = document.getElementsByClassName('markdown-body')[0];
		const comments = getComments(githubBody ? githubBody : document);
		
		pykeletComment = comments.find(comment => comment.nodeValue.trim().startsWith('PYKELET'));
    }
    if (!pykeletComment) {
        console.info('Pykelet: No comment block found');
        return null; // No PYKELET comment found (redundant if previous check is thorough, but as a safeguard)
    }
    if (!isValidPykeletNode(pykeletComment)) {
      return null; // Not valid
    }
    let metadata = {}
    // Trim leading/trailing whitespace and remove the '<!--' and '-->' markers.
    const lines = pykeletComment.nodeValue
                    .trim()  // if Cannot read properties error, you're probably supplying an invalid comment (and probably shouldn't supply anything).
                    .replace(/<!--\s*PYKELET\s*/g, '')
                    .replace(/\s*-->/g, '')
                    .split('\n');
    
    lines.forEach(line => {
        const [key, ...valueParts] = line.trim().split(':');
        const fullKey = `${key.trim()}`.toUpperCase();
        if (fullKey) {
            metadata[fullKey] = valueParts.join(':').trim();
        }
    });

    return metadata;
}

/**
 * Returns an array of all 'Pykelet block' comments found within a given DOM element.
 * This is a special utility function primarily intended for 'index' or 'listing' files
 * that might embed multiple Pykelet blocks (e.g., in <data> elements) to collect metadata
 * about other files. For most single HTML files, 'getPykeletFromComment' is sufficient.
 * @param {Element} elem - The DOM element to search within (e.g., 'document' or a specific container).
 * @returns {Comment[]} An array of comment nodes that are Pykelet blocks.
 */
function getPykeletsFromComments(elem) {
    /**
     * Helper function to get all comment nodes from a given DOM element.
     * @param {Element} elem - The DOM element to search within.
     * @returns {Comment[]} An array of comment nodes.
     */
	function getComments(elem) {
	  return Array.from(elem.childNodes).filter(node => node.nodeType === Node.COMMENT_NODE);
	}
    
    // Retrieve all comment nodes from the provided element and filter for PYKELET comments.
    const comments = getComments(elem)?.filter(comment => comment.nodeValue.trim().startsWith('PYKELET'));

    return comments || []; // Return an empty array if no comments or elem is null/undefined
}


// --- Script Execution Flow ---

// 1. Immediately initialize 'document.pykelet.comment'.
// This makes the Pykelet metadata available as soon as this script executes,
// before the entire DOM content is loaded.
initPykeletFromComment();

// 2. Defer the auto-population of HTML elements until the DOM is fully loaded.
// This ensures that all target HTML elements (with matching IDs) exist in the document
// before the script attempts to fill them.
window.addEventListener('DOMContentLoaded', fillDocumentFromPykeletComments);

// Note: For debugging, you can access the parsed metadata via 'document.pykelet.comment'
// in your browser's developer console after the page loads.
