import { jsx } from 'slate-hyperscript'
import { Transforms } from 'slate'



const ELEMENT_TAGS:any = {
  A: (el:any) => ({ type: 'link', url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: 'quote' }),
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-four' }),
  H5: () => ({ type: 'heading-five' }),
  H6: () => ({ type: 'heading-six' }),
  IMG: (el:any) => ({ type: 'image', url: el.getAttribute('src') }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: () => ({ type: 'paragraph' }),
  PRE: () => ({ type: 'code' }),
  UL: () => ({ type: 'bulleted-list' }),
}

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS:any = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
}

export const deserialize:any = (el:any) => {
  if (el.nodeType === 3) {
    return el.textContent.trim() ? el.textContent : null;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === 'BR') {
    return { text: '\n' };
  }

  const { nodeName } = el;
  let parent = el;

  if (nodeName === 'PRE' && el.childNodes[0] && el.childNodes[0].nodeName === 'CODE') {
    parent = el.childNodes[0];
  }

  let children = Array.from(parent.childNodes)
    .map(deserialize)
    .flat()
    .filter(child => child !== null);

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx('element', attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map(child => jsx('text', attrs, child));
  }

  return children;
};



export const withHtml = (editor:any) => {
  const { insertData, isInline, isVoid } = editor

  editor.isInline = (element:any) => {
    return element.type === 'link' ? true : isInline(element)
  }

  editor.isVoid = (element:any) => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.insertData = (data:any) => {
    const html = data.getData('text/html')
    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html')
      const fragment = deserialize(parsed.body)
      Transforms.insertFragment(editor, fragment)
      return 
    }

    insertData(data)
  }

  return editor
}


export const parseFromHTML:any = (htmlString:string) =>{
  const parsed = new DOMParser().parseFromString(htmlString, 'text/html');
  const fragment = Array.from(parsed.body.childNodes).map(deserialize).flat().filter(item => !!item);
  return fragment;
}


