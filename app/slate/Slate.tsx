"use client"
import React, { useCallback, useMemo } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history'
import { parseFromHTML, withHtml } from '@/utils/convert';
// import { css } from '@emotion/css'
import {
  Slate,
  Editable,
  withReact,
  useSelected,
  useFocused,
} from 'slate-react'


const Leaf = ({ attributes, children, leaf }:any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  if (leaf.strikethrough) {
    children = <del>{children}</del>
  }

  return <span {...attributes}>{children}</span>
}


const ImageElement = ({ attributes, children, element }:any) => {
  const selected = useSelected()
  const focused = useFocused()
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
  )
}

const Element = (props:any) => {
  const { attributes, children, element } = props

  switch (element.type) {
    default:
      return <p {...attributes}>{children}</p>
    case 'quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'code':
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      )
    case 'bulleted-list':
      return <ul className="list-disc" {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol className='list-decimal'  {...attributes}>{children}</ol>
    case 'link':
      return (
        <a href={element.url} {...attributes}>
          {children}
        </a>
      )
    case 'image':
      return <ImageElement {...props} />
  }
}


const SlateEditor = () => {
  const renderElement = useCallback((props:any) => <Element {...props} />, [])
  const renderLeaf = useCallback((props:any) => <Leaf {...props} />, [])
  const editor = useMemo(
    () => withHtml(withReact(withHistory(createEditor()))),
    []
  )

  const localQuillData = getEditorData()
  console.log("🚀 ~ SlateEditor ~ localQuillData:", localQuillData)

  return (
      <div className='px-[20px] py-[20px]'>
      <Slate editor={editor} initialValue={parseFromHTML(localQuillData)}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Paste in some HTML..."
          className='px-[40px] py-[20px] rounded border'
          contentEditable
        />
      </Slate>
      </div>
  )
}


function getEditorData(){
    const localQuill = localStorage.getItem("data") || ""
    const quillData = JSON.parse(localQuill)
    return quillData
}

export default SlateEditor;
