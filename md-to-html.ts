import remarkDirective from "remark-directive";
import rehypeSlug from "rehype-slug";
import { icons } from "lucide";
import remarkCalloutDirectives from "@microflash/remark-callout-directives";
import { unified } from "unified";
import rehypeDocument from "rehype-document";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

type SVGProps = Record<string, string | number>;
type IconNodeChild = readonly [tag: string, attrs: SVGProps];

const mappedIcons: Record<string, IconNodeChild[]> = {
  projects: icons.BookMarked[2]!,
  "open-source": icons.BookMarked[2]!,
  skills: icons.Wrench[2]!,
  final: icons.Goal[2]!,
  lighthouse: icons.Siren[2]!,
  display: icons.MonitorCheck[2]!,
  setup: icons.Rocket[2]!,
  features: icons.Rocket[2]!,
  usage: icons.CirclePlay[2]!,
  experience: icons.Rocket[2]!,
  education: icons.School[2]!,
  success: icons.Zap[2]!,
  improve: icons.BrainCircuit[2]!,
  language: icons.Languages[2]!,
  summary: icons.CircleUserRound[2]!,
  clean: [
    ["path", { d: "m13 11 9-9" }],
    [
      "path",
      {
        d: "M14.6 12.6a2.286 2.286 0 0 1 .2 3L10 22l-8-8 6.4-4.8a2.286 2.286 0 0 1 3 .2z",
      },
    ],
    ["path", { d: "m5 17 1.4-1.4" }],
    ["path", { d: "m6.8 10.4 6.8 6.8" }],
  ],
};

export const mdToHtml = (
  md: string,
  options: {
    title: string;
    accent?: string;
    text?: string;
    textDimmed?: string;
    pageBackground?: string;
    pageHeight?: string;
  },
) => {
  const {
    title,
    accent = "#0969da",
    text = "#171515",
    textDimmed = "#24292f",
    pageBackground = "#ffffff",
    pageHeight = "297mm",
  } = options;
  function createCssIcon(nodes: IconNodeChild[]) {
    function encodeSVG(data: string) {
      return data
        .replace(/"/g, `'`)
        .replace(/>\s{1,}</g, `><`)
        .replace(/\s{2,}/g, ` `)
        .replace(/[\r\n%#()<>?[\\\]^`{|}]/g, encodeURIComponent);
    }
    function attrsToString(attrs) {
      return Object.keys(attrs)
        .map((key) => `${key}="${attrs[key]}"`)
        .join(" ");
    }
    const parentAttrs = {
      xmlns: "http://www.w3.org/2000/svg",
      width: 28,
      height: 28,
      viewBox: "0 0 33.6 33.6",
    };
    const backgroundAttrs = {
      fill: pageBackground,
      d: "M0 0h33.6v33.6H0z",
    };
    const forgroundGroupAttrs = {
      stroke: accent,
      fill: "none",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      transform: "translate(5, 4)",
    };
    const svg = `
<svg ${attrsToString(parentAttrs)}>
  <path ${attrsToString(backgroundAttrs)} />
  <g ${attrsToString(forgroundGroupAttrs)}>${nodes.reduce(
    (acc, [tag, attributes]) =>
      `${acc}<${tag} ${Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")} />`,
    "",
  )}</g>
</svg>
      `.trim();

    return `
background-image: url("data:image/svg+xml,${encodeSVG(svg)}");
background-position: center;
background-repeat: no-repeat;
transform: translate(0, 2px);
    `.trim();
  }
  const style = `
@import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;800;900&display=swap");
@import url("https://fonts.googleapis.com/css?family=Inter:400,400i,500,500i,600,600i,700,700i,800,800i&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap");
:root {
  --screen-zoom: 1;
  --accent: ${accent};
  --text: ${text};
  --text-dimmed: ${textDimmed};
  --padding: 10mm;
  --page-background: ${pageBackground};
  --body-background: #f6f8fa;
  --page-width: calc(210mm - 2 * var(--padding));
}
@page {
  size: 210mm ${pageHeight};
  margin: var(--padding);
  background-color: var(--page-background);
}
* {
  margin: 0;
  padding: 0;
}
html {
  background: var(--page-background);
  font-size: .5rem;
}
[data-highlighted-line],
[data-highlighted-chars]
{
  background: #0969da21;
  border-radius: 2px;
}
[data-highlighted-chars][data-chars-id="danger"] {
  background: #B31D2821;
}
[data-highlighted-chars][data-chars-id="success"] {
  background: #22863A21;
}
pre code[data-language="sh"] > [data-line]::before {
  counter-increment: line;
  content: "$";
  display: inline-block;
  width: 1rem;
  margin-right: 2rem;
  text-align: right;
  color: gray;
}
mark {
  background: rgb(255, 255, 0);
  color: #000;
}
body {
  color: var(--text);
  background: var(--page-background);
  padding-left: var(--padding);
  font-family: "Sora", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  font-size: 1.45rem;
  font-style: normal;
  font-weight: normal;
  line-height: 1.6;
  margin: auto;
  color: var(--text);
  position: relative;
}
body > h1::before,
body > h2::before,
body > h3::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' height='28' viewBox='0 0 28 20' width='28' %3E%3Cpath fill='${pageBackground.replace(
    /^#/,
    "%23",
  )}' d='M0 0h33.6v33.6H0z'/%3E%3Ccircle cx='14' cy='12' r='5' stroke='%23d0d6df' stroke-width='2'%3E%3C/circle%3E%3C/svg%3E");
  transform: translate(0, -2px);
  height: 100%;
  width: 28px;
  content: "";
  margin-right: calc(var(--padding) - 15px);
  margin-left: calc(-13px - var(--padding));
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
  position: absolute;
  top: 0;
}
body > h1:first-of-type::before {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' height='28' viewBox='0 0 28 20' width='28' %3E%3Cpath fill='${pageBackground.replace(
    /^#/,
    "%23",
  )}' d='M0 0h33.6v33.6H0z'/%3E%3Ccircle cx='14' cy='12' r='5' stroke='%23d0d6df' stroke-width='2'%3E%3C/circle%3E%3C/svg%3E"),
    linear-gradient(
      0deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0) 50%,
      var(--page-background) 50%,
      var(--page-background) 100%
    );
  background-position: center;
  background-repeat: no-repeat;
}
body > h2::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' height='28' viewBox='0 0 28 20' width='28' %3E%3Cpath fill='${pageBackground.replace(
    /^#/,
    "%23",
  )}' d='M0 0h33.6v33.6H0z'/%3E%3Ccircle cx='14' cy='11' r='5' stroke='${accent.replace(
    /^#/,
    "%23",
  )}' stroke-width='2'%3E%3C/circle%3E%3C/svg%3E");
}
${Object.entries(mappedIcons)
  .map(([id, name]) => `h2[id*='${id}']::before {${createCssIcon(name)}}`)
  .join("\n")}
body::before {
  position: absolute;
  bottom: 0;
  top: -100vh;
  left: 0;
  width: 2px;
  content: "";
  height: 200vh;
  background: #dadfe9;
}
body:has(h1)::before {
  top: 22px;
}
@media not print {
  body:has(h1)::before {
    top: 50px;
  }
  @media (min-width: 420px) {
    body {
      box-shadow: 0 0 0 1px #d0d7de;
      line-height: 1.6;
      zoom: var(--screen-zoom);
    }
    html {
      background: var(--body-background);
    }
  }
  body::before {
    top: var(--padding);
    left: calc(var(--padding));
    height: unset;
  }
  body {
    line-height: 1.6;
    padding: var(--padding);
    padding-left: calc(var(--padding) * 2);
    border-radius: clamp(
      0px,
      calc(
        100vw - var(--page-width) * var(--screen-zoom) - var(--padding) *
          var(--screen-zoom) * 3
      ),
      6px
    );
    margin: clamp(
        0px,
        (100% - var(--page-width)) / 2 - var(--padding) * 1.5,
        0.75in
      )
      auto;
    min-height: clamp(
      0px,
      calc(100vh - 100vw + var(--page-width) + var(--padding) * 3),
      calc(100vh - var(--padding) * 3)
    );
    width: calc(100% - var(--padding) * 3);
    max-width: var(--page-width);
    min-width: calc(300px - var(--padding) * 3);
  }
}
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Inter";
  font-weight: bold;
  position: relative;
}
h1 {
  font-size: 3.6rem;
  font-weight: normal;
  margin-top: 0;
  text-align: left;
}
h2 {
  font-size: 2.4rem;
  margin-top: 1em;
}
h3 {
  font-size: 2rem;
  margin-top: 0.5em;
}
h4,
h5,
h6 {
  font-size: 1.8rem;
  margin-top: 0.4em;
}
b,
strong {
  font-weight: bold;
}
i,
em {
  font-style: italic;
}
ul {
  list-style-type: none;
}
ul li:before {
  content: "-";
  font-weight: bold;
  margin-right: 0.5em;
}
ul,
ol {
  margin-top: 0.5em;
  list-style-position: inside;
}
ol li:before {
  content: "";
  margin-right: 0.25em;
}
ol li::marker {
  padding-right: 0;
  text-align: inherit;
  font-weight: bold;
}
h3 + ul {
  margin-top: 0;
}
a {
  color: var(--accent);
  text-decoration: underline;
}
code {
  font-family: DejaVu Sans Mono;
  background-color: var(--body-background) !important;
  box-shadow: 0 0 0 1px #d0d7de;
  border-radius: 4px;
  padding: 0 4px;
}
pre code {
  margin-top: 1em;
  padding: 8px 12px;
  display: block;
}
p {
  margin-top: 0.5em;
}
h3 + p {
  margin-top: 0.2em;
}
li > p {
  margin-top: 0;
}
table {
  margin-top: 0.5em;
  table-layout: fixed;
  width: 100%;
}
table th,
table tr {
  font-weight: normal;
}
table.no-margin {
  margin: 0 !important;
}
img {
  margin-top: 1em;
  max-width: 100%;
  box-shadow: 0 0 0 1px #d0d7de;
  border-radius: 4px;
  margin-right: 2rem;
}
body {
  color: var(--text-dimmed);
}
h1 {
  color: var(--text);
  font-weight: 700;
  font-size: 4rem;
  letter-spacing: -2px;
}
h3,
h4,
h5,
h6 {
  color: var(--text);
  font-weight: 600;
}
h2 {
  color: var(--accent);
  border-radius: 4px;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 1px;
  position: relative;
}
b,
strong {
  color: var(--text);
  font-weight: 600;
}
h1 b,
h1 strong {
  font-weight: 900;
}
h2 b,
h2 strong,
h3 b,
h3 strong,
h4 b,
h4 strong,
h5 b,
h5 strong,
h6 b,
h6 strong {
  font-weight: 800;
}
a b,
a strong {
  font-weight: 800;
}
ul {
  padding-left: 12px;
}
ul li {
  list-style-type: none;
  position: relative;
}
ul li:before {
  font-family: "Inter";
  font-weight: 600;
  content: "•";
  left: -12px;
  position: absolute;
}
a {
  border-bottom: 2px solid var(--accent);
  color: var(--text);
  font-weight: 600;
  text-decoration: none;
}
hr {
  border: none;
  margin-top: 1em;
  margin-bottom: 1em;
  border-top: 2px solid #dadfe9;
}
blockquote {
  position: relative;
  font-style: italic;
  margin-top: 1em;
  margin-left: 1em;
}
blockquote > * {
  color: #636c76;
}
blockquote::before {
  content: "";
  width: 4px;
  background: #d0d7de;
  border-radius: 4px;
  height: 100%;
  position: absolute;
  margin-left: -1em;
}
.callout {
  --accent: #0969da;
}
.callout.callout-question {
  --accent: hsl(261, 69%, 59%);
}
.callout.callout-warn {
  --accent: hsl(40, 100%, 30%);
}
.callout.callout-deter {
  --accent: hsl(356, 71%, 48%);
}
.callout {
  margin-top: 1em;
  background: var(--body-background);
  border-radius: 8px;
  padding: .5em 1em;
  position: relative;
}
.callout::before {
  content: "";
  background: var(--accent);
  display: inline-block;
  height: 100%;
  margin-right: 1em;
  width: 4px;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 4px 0 0 4px;
}
.callout-indicator > svg {
  height: 1.2em;
  width: 1.2em;
  stroke-width: 3;
  margin-right: 4px;
}
.callout-indicator {
  color: var(--accent);
  margin-bottom: -.25em;
  font-size: 1.8rem;
  font-weight: 600;
  font-family: "Inter";
  font-weight: bold;
  display: flex;
  align-items: center;
}
.callout-indicator strong {
  font-weight: 800;
}
.callout-indicator * {
  color: var(--accent);
}
    `;

  const calloutOptions = {
    aliases: {
      tip: "commend",
      important: "assert",
      warning: "warn",
      caution: "deter",
    },
    callouts: {
      prompt: {
        title: "Prompt",
        hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot-message-square"><path d="M12 6V2H8"/><path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/><path d="M2 12h2"/><path d="M9 11v2"/><path d="M15 11v2"/><path d="M20 12h2"/></svg>`,
      },
      question: {
        title: "Question",
        hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-question"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
      },
      note: {
        hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-notebook-pen"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M18.4 2.6a2.17 2.17 0 0 1 3 3L16 11l-4 1 1-4Z"/></svg>`,
      },
      commend: {
        title: "Info",
        hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
      },
      assert: {
        title: "Important",
        hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-warning"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v2"/><path d="M12 13h.01"/></svg>`,
      },
      warn: {
        hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
      },
      deter: {
        title: "Caution",
        hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
      },
    },
  };

  return unified()
    .use(remarkParse, { fragment: true })
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkCalloutDirectives, calloutOptions)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypePrettyCode, { theme: "github-light" })
    .use(rehypeDocument, { style, title })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md)
    .then((result) => result.toString());
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    const md = readFileSync(process.argv[2], "utf8");
    const html = await mdToHtml(md, { title: "" });
    writeFileSync(process.argv[3], html, "utf8");
  })().catch((error) => {
    throw error;
  });
}
