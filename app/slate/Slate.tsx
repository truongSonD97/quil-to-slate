"use client";
import React, { useCallback, useMemo } from "react";
import {
  Editor,
  Transforms,
  createEditor,
  Descendant,
  Element as SlateElement,
} from "slate";
import { withHistory } from "slate-history";
import { parseFromHTML, withHtml } from "@/utils/convert";
// import { css } from '@emotion/css'
import {
  Slate,
  Editable,
  withReact,
  useSelected,
  useFocused,
  useSlate,
} from "slate-react";
import { Button, Toolbar } from "@/components/components";
import { Icon } from "@/components/Icon";


interface CustomElement extends SlateElement {
  type: string;
}


const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <del>{children}</del>;
  }

  return <span {...attributes}>{children}</span>;
};

const ImageElement = ({ attributes, children, element }: any) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      {children}
      <img
        src={element.url}
        // className={css`
        //   display: block;
        //   max-width: 100%;
        //   max-height: 20em;
        //   box-shadow: ${selected && focused ? '0 0 0 2px blue;' : 'none'};
        // `}
      />
    </div>
  );
};

const Element = (props: any) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    default:
      return <p {...attributes}>{children}</p>;
    case "quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "code":
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      );
    case "bulleted-list":
      return (
        <ul className="list-disc" {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "heading-three":
      return <h3 {...attributes}>{children}</h3>;
    case "heading-four":
      return <h4 {...attributes}>{children}</h4>;
    case "heading-five":
      return <h5 {...attributes}>{children}</h5>;
    case "heading-six":
      return <h6 {...attributes}>{children}</h6>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return (
        <ol className="list-decimal" {...attributes}>
          {children}
        </ol>
      );
    case "link":
      return (
        <a href={element.url} {...attributes}>
          {children}
        </a>
      );
    case "image":
      return <ImageElement {...props} />;
  }
};

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

const LIST_TYPES: any[] = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES: any[] = ["left", "center", "right", "justify"];

const SlateEditor = () => {
  const localQuillData = getEditorData();
  const JSONInitValue = parseFromHTML(localQuillData);

  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
  const editor = useMemo(
    () => withHtml(withReact(withHistory(createEditor()))),
    []
  );

  return (
    <div className="px-[20px] py-[20px]">
      <div className="border rounded mb-[40px]">
        <p>JSON Data:</p>
        <p>{JSON.stringify(JSONInitValue)}</p>
      </div>
      <div className="px-[40px] py-[20px] rounded border">
        <Slate editor={editor} initialValue={JSONInitValue}>
          <Toolbar>
            <MarkButton format="bold" icon="MdFormatBold" />
            <MarkButton format="italic" icon="MdFormatItalic" />
            <MarkButton format="underline" icon="MdFormatUnderlined" />
            <BlockButton format="heading-one" icon="LuHeading1" />
            <BlockButton format="heading-two" icon="LuHeading2" />
            <BlockButton format="heading-three" icon="LuHeading3" />
            <BlockButton format="block-quote" icon="MdFormatQuote" />
            <BlockButton format="numbered-list" icon="MdFormatListNumbered" />
            <BlockButton format="bulleted-list" icon="MdFormatListBulleted" />
            <BlockButton format="left" icon="MdFormatAlignLeft" />
            <BlockButton format="center" icon="MdFormatAlignCenter" />
            <BlockButton format="right" icon="MdFormatAlignRight" />
            <BlockButton format="justify" icon="MdFormatAlignJustify" />
          </Toolbar>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Paste in some HTML..."
            className=" font-sans border-0 outline-0"
            
          />
        </Slate>
      </div>
    </div>
  );
};

function getEditorData() {
  const localQuill = localStorage.getItem("data") || "";
  const quillData = JSON.parse(localQuill);
  return quillData;
}




const toggleBlock = (editor: any, format: any) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n: {type:string} | any) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes((n as CustomElement).type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<any>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: any, format: any) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor: any, format: any, blockType: any = "type") => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n: any) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as any)[blockType] === format,
    })
  );

  return !!match;
};

const isMarkActive = (editor: any, format: any) => {
  const marks: any = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const BlockButton = ({ format, icon }: any) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
      )}
      onMouseDown={(event: any) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon nameIcon={icon} propsIcon={{ size: 20 }} />
    </Button>
  );
};

const MarkButton = ({ format, icon }: any) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event: any) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon nameIcon={icon} propsIcon={{ size: 20 }} />
    </Button>
  );
};

export default SlateEditor;
