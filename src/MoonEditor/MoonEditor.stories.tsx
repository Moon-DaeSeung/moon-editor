import React from 'react'
import MoonEditor from './MoonEditor'
import { ComponentMeta } from '@storybook/react'

export default {
  title: 'Editor',
  component: MoonEditor
} as ComponentMeta <typeof MoonEditor>

export const First = () => {
  return (
    <MoonEditor/>
  )
}
