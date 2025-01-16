import React from "react";
import Markdown from "markdown-to-jsx";
import type { ReactNode } from "react";

const elements = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "marquee",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",

  // SVG
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "stop",
  "svg",
  "text",
  "tspan",
];

const allowedElements = ["a", "b", "strong", "em", "u", "code", "del"];

const CustomLink = ({
  children,
  ...props
}: {
  children: ReactNode;
  [key: string]: any;
}) => (
  <a {...props} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

const MarkdownWrapper = ({ children }: { children: ReactNode }) => {
  const boldRegex = /\*(.*?)\*/g;
  const tildaRegex = /~(.*?)~/g;

  if (typeof children === "string" && children.includes("BEGIN:VCARD"))
    //children = "Diga olá ao seu novo contato clicando em *conversar*!";
    children = null;

  if (typeof children === "string" && children.includes("data:image/"))
    children = null;

  if (typeof children === "string" && boldRegex.test(children)) {
    children = children.replace(boldRegex, "**$1**");
  }
  if (typeof children === "string" && tildaRegex.test(children)) {
    children = children.replace(tildaRegex, "~~$1~~");
  }

  const options = React.useMemo(() => {
    const markdownOptions: { [key: string]: any } = {
      disableParsingRawHTML: true,
      forceInline: true,
      overrides: {
        a: { component: CustomLink },
      },
    };

    elements.forEach((element) => {
      if (!allowedElements.includes(element)) {
        markdownOptions.overrides[element] = (el: { children?: ReactNode }) =>
          el.children || null;
      }
    });

    return markdownOptions;
  }, []);

  if (!children) return null;

  return (
    <Markdown options={options}>
      {typeof children === "string" ? children : ""}
    </Markdown>
  );
};

export default MarkdownWrapper;
