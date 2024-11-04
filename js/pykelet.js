// ---
// FILENAME:     pykelet.js 
// VERSION:      2.0.1
//
// IMPORTANT:    Include this file as early as possible in an HTML document, ideally as first item in the HTML header.
// DESCRIPTION:  This copies all front-matter variables into document.pykelet.comments. This also copies each variable as text into an HTML element with matching id (to disable this define const disabled_fillDocumentFromPykeletComments=true in a script before this file is called). Part of the Pykelet suite. 
//  
// AUTHOR:       Andrew Kingdom
// LICENSE:      MIT (3-clause BSD) · You MAY freely use this file but you SHALL NOT remove the author credentials.
// ---

function initPykeletFromComment() {
	document.pykelet = {
		comment: getPykeletFromComment()  // grab details from Pykelet Resume immediately.
	};
}

function fillDocumentFromPykeletComments(force = false) {
	if(!force && typeof(disabled_fillDocumentFromPykeletComments) !== 'undefined') return;  // don't fill the document if disabled_fillDocumentFromPykeletComments is defined, unless the caller overrides this.
	const comments = document.pykelet.comment;
	for (let key in comments) {
		if (comments.hasOwnProperty(key)) {
			const element = document.getElementById(key);
			if (element) {
				element.textContent = comments[key];
			}
		}
	}
}

// Returns an object of key:value pairs from the first '<!--PYKELET' comment found in the root level of this file.
// Normally this result should be saved in document.window.pykelet.metadata
// Normally the pykeleComment parameter is unused (call with empty parenthesis).
// This is essentially a YAML front matter block, except we use <!-- ... --> rather than --- ... ---
//
// Example
// <!--PYKELET
// 
// DESCRIPTION: This tool helps identify the most important parts in a text.
// 
// TITLE:		Identify key phrases in a text.
// FILENAME:    text_tool.html
// AUTHOR:      Andrew Kingdom
// 
// -->

function getPykeletFromComment(pykeletComment = undefined) {
	function getComments(elem) {
	  return Array.from(elem.childNodes).filter(node => node.nodeType === Node.COMMENT_NODE);
	}
	
	if(pykeletComment === undefined) {
		// Unspecified, so get the first PYKELET comment found
		// Retrieve comments from the root element
		const githubBody = document.getElementsByClassName('markdown-body')[0];  // use github target if present
		const comments = getComments(githubBody ? githubBody : document);
		
		// Find the PYKELET comment
		pykeletComment = comments.find(comment => comment.nodeValue.trim().startsWith('PYKELET'));
	}
    if (pykeletComment) {
        const metadata = {};
        const lines = pykeletComment.nodeValue
                        .trim()  // if Cannot read properties error, you're probably supplying an invalid comment (and probably shouldn't supply anything).
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
    return null;  // No PYKELET comment found
}

// Returns an array of all pykelet comments within this file.
// This is a special case intended for index files only. 
// This allows easily copy and paste of the comments from other files. 
// For all other files there is normally only one such comment present.
// Normally elem would be the DOM document, or a <data> element.
function getPykeletsFromComments(elem) {
	function getComments(elem) {
	  return Array.from(elem.childNodes).filter(node => node.nodeType === Node.COMMENT_NODE);
	}
    
	// Retrieve comments from the root element and extract the PYKELET comments
    const comments = getComments(elem)?.filter(comment => comment.nodeValue.trim().startsWith('PYKELET'));

	return comments
}


initPykeletFromComment();  // Immediate
window.addEventListener('DOMContentLoaded', fillDocumentFromPykeletComments); // Deferred, initialise once the window loads
