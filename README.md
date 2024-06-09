# markdown-pdf

Convert markdown files to PDF or HTML.

## Requirements

- https://nodejs.org
- https://www.princexml.com
- https://poppler.freedesktop.org

### Check that the binaries can be found

```sh
which node prince pdfunite pdfinfo
```

## Usage

```sh "pdf" "html"
node --import tsx/esm md-to-pdf.ts input.md output.pdf
node --import tsx/esm md-to-html.ts input.md output.html
```

## Features

### Intelligently split pages at headings

When generating a PDF with multiple pages, the converter will split the document in a way that the page break does not occur in the middle of a section.

### Heading bar with icons

At the left side of the page there is a bar with fun icons.

### Pretty code blocks

https://rehype-pretty.pages.dev/#usage adds support for syntax highlighting and custom highlighted sections.

### Callout directives

https://github.com/Microflash/remark-callout-directives adds support for callout directives like `:::note` and `:::warning`.
