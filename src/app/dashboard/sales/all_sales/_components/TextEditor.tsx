import { useCallback, useEffect, useRef, useState } from 'react';

import RichTextEditor, { BaseKit } from 'reactjs-tiptap-editor';
import { Bold } from 'reactjs-tiptap-editor/bold';
import { BulletList } from 'reactjs-tiptap-editor/bulletlist';
import { Emoji } from 'reactjs-tiptap-editor/emoji';
import { FontFamily } from 'reactjs-tiptap-editor/fontfamily';
import { FontSize } from 'reactjs-tiptap-editor/fontsize';
import { Heading } from 'reactjs-tiptap-editor/heading';
import { LineHeight } from 'reactjs-tiptap-editor/lineheight';
import { OrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { TaskList } from 'reactjs-tiptap-editor/tasklist';
import { TextAlign } from 'reactjs-tiptap-editor/textalign';
import 'reactjs-tiptap-editor/style.css';

import styles from './TextEditor.module.css';

const extensions = [
  BaseKit.configure({
    placeholder: {
      showOnlyCurrent: true,
    },
    characterCount: {
      limit: 50_000,
    },
  }),
  FontFamily,
  Heading.configure({ spacer: true }),
  FontSize,
  Bold,
  Emoji,
  BulletList,
  OrderedList,
  TextAlign.configure({ types: ['heading', 'paragraph'], spacer: true }),
  LineHeight,
  TaskList.configure({
    spacer: true,
    taskItem: {
      nested: true,
    },
  }),
];

function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    // @ts-ignore
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

interface TextEditorProps {
  view?: boolean;
  setTermsCondition: (value: string) => void;
  initialContent?: string;
  Preview?: boolean;
}

const TextEditor = ({
  view = false,
  setTermsCondition,
  initialContent,
  Preview = false,
}: TextEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const refEditor = useRef<any>(null);

  useEffect(() => {
    if (initialContent !== undefined) {
      setContent(initialContent);
      setTermsCondition(initialContent);
    }
  }, [initialContent, setTermsCondition]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onValueChange = useCallback(
    debounce((value: any) => {
      setContent(value);
      setTermsCondition(value);
    }, 300),
    [setTermsCondition]
  );

  return (
    <div
      className={`my-0 flex w-full min-w-0 max-w-full flex-col gap-[24px] overflow-x-auto rounded-lg border border-white bg-white/60 ${styles.wrapper}`}
    >
      <RichTextEditor
        maxHeight="400px"
        output="html"
        content={content as any}
        onChangeContent={onValueChange}
        extensions={extensions}
        dark={false}
        disabled={view}
        contentClass=" !border !border-white"
      />
    </div>
  );
};

export default TextEditor;
