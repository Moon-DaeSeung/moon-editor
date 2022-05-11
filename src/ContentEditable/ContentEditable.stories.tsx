import React from 'react'
import { ComponentMeta } from '@storybook/react'
import ContentEditable from './ContentEditable'
import { useState } from '@storybook/addons'
import tw from 'twin.macro'

export default {
  title: 'Contentitable',
  component: ContentEditable
} as ComponentMeta <typeof ContentEditable>

export const First = () => {
  const [html, setHtml] = useState('asdfasdf <strong>hi</strong>')
  return (
    <ContentEditable css={tw`bg-blue-50`} html={html} onChange={setHtml}/>
  )
}
