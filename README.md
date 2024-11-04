# Pulling data from an HTML comment

A Pykelet front matter block is essentially the same as that of a YAML Jekyll/Hugo front matter block except that we encase it in an HTML comment &lt;!-- ... --&gt; rather than YAML ---...---

The aim is to be able to pull information from a source-code style comment.
This is not intended for SEO purposes (comments are generally no longer indexed by search bots), so such data should still be put in the header if required.

## Example

*This HTML comment is extracted and then for example purposes, displays it as...*

    <!--PYKELET
      FILENAME:    example.html
      DESCRIPTION: This is a demonstration HTML file showing metadata extraction.
      AUTHOR:      Andrew Kingdom
      LICENSE:     MIT (3-clause BSD)
      -->

*into this...*

<h3>Hello World</h1>
<p>This is a demonstration of extracting and displaying metadata from HTML comments.</p>
<div><strong>PYKELET:</strong> </div><div><strong>FILENAME:</strong> example.html</div><div><strong>DESCRIPTION:</strong> This is a demonstration HTML file showing metadata extraction.</div><div><strong>AUTHOR:</strong> Andrew Kingdom</div><div><strong>LICENSE:</strong> MIT (3-clause BSD)</div>

