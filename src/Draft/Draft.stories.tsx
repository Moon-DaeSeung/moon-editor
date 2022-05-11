
import React, { useState } from 'react'
import { ComponentMeta } from '@storybook/react'
import { Editor, EditorState, ContentState, convertFromHTML } from 'draft-js'

export default {
  title: 'Draft',
  component: Editor
} as ComponentMeta <typeof Editor>

export const First = () => {
  const html = '<strong>hi</strong> hi'
  const content = ContentState.createFromBlockArray(convertFromHTML(html).contentBlocks)
  const [editorState, setEditorState] = useState(() => EditorState.createWithContent(content))
  return (
    <Editor editorState={editorState} onChange={setEditorState} />
  )
}
