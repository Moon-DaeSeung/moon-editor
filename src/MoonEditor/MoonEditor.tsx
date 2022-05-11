/* eslint-disable no-case-declarations */
import React, { useState, useEffect, useCallback, ReactNode, cloneElement, useRef, createRef } from 'react'
import ReactMarkdown from 'react-markdown'
import TurndownService, { Node } from 'turndown'
import ContentEditable from '../ContentEditable'
import ReactDomServer from 'react-dom/server'
import tw from 'twin.macro'
import { useTrigger } from '../hooks/useTrigger'

const turnDownService = new TurndownService()

type State = {
  nodeIndex: number
  anchorOffset: number
  keyDownEvent: 'none' | 'up' | 'down' | 'enter' | 'backspace'
}

const MoonEditor = () => {
  const initial = '# Hello, *Mercury*!!\n\n .\n\naasn\nss'.replace(/\n\n[ ]+/g, '\n\n')
  const [item, setItem] = useState(initial)
  const [serialized, setSerialized] = useState(item.split('\n\n').filter(word => !!word))
  const stateRef = useRef<State>(
    {
      nodeIndex: -1,
      anchorOffset: 0,
      keyDownEvent: 'none'
    }
  )
  const nodesRef = useRef<any[]>([])
  const [trigger, forceUpdate] = useTrigger()

  useEffect(() => {
    setItem(serialized.join('\n\n'))
  }, [serialized])

  const focusNode = useCallback((index: number) => {
    const node = nodesRef.current[index]
    if (!node) return
    node.focus()
  }, [])

  const emitKeyDownEvent = useCallback((type: State['keyDownEvent']) => {
    forceUpdate()
    stateRef.current.keyDownEvent = type
  }, [])

  useEffect(() => {
    const index = stateRef.current.nodeIndex
    const keyDownEvent = stateRef.current.keyDownEvent
    switch (keyDownEvent) {
      case 'enter':
        focusNode(index + 1)
        break
      case 'down':
        focusNode(index + 1)
        break
      case 'backspace':
        if (stateRef.current.anchorOffset > 1) break
        focusNode(index - 1)
        break
    }
    stateRef.current.keyDownEvent = 'none'
  }, [item])

  useEffect(() => {
    const index = stateRef.current.nodeIndex
    const keyDownEvent = stateRef.current.keyDownEvent
    const selection = window.getSelection()
    if (!selection) return
    if (selection.anchorOffset !== stateRef.current.anchorOffset) return
    if (keyDownEvent === 'down') {
      const node = nodesRef.current[index + 1]
      if (node) {
        node.focus()
      } else {
        createNewLine(index)
      }
    }

    if (keyDownEvent === 'up') {
      focusNode(index - 1)
    }
  }, [trigger])

  const createNewLine = useCallback((index: number) => {
    setSerialized(prev => {
      const front = prev.slice(0, index + 1)
      const end = prev.slice(index + 1)
      const result = [...front, '&NewLine;', ...end]
      return result
    })
  }, [])

  const render = useCallback((props: {node: any, index?: number, children: ReactNode}) => {
    const { node, children, index: indexProps } = props
    const index = indexProps!
    const { tagName } = node
    const element = cloneElement(<></>, {}, children)
    const html = ReactDomServer.renderToString(element)

    const handleChange = (innerHTML: string) => {
      if (innerHTML) {
        const html = `<${tagName}>` + innerHTML + `</${tagName}>`
        const remark = turnDownService.turndown(html)
        setSerialized(prev => {
          const copied = [...prev]
          copied[index] = remark
          return copied
        })
      } else {
        console.log('hu')
        setSerialized(prev => {
          return prev.filter((_, index) => index !== stateRef.current.nodeIndex)
        })
      }
    }

    const handleKeyDown = (e: any) => {
      const selection = window.getSelection()
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        document.execCommand('insertHTML', false, '\n')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        createNewLine(index)
        emitKeyDownEvent('enter')
      } else if (!e.shiftKey && e.key === 'ArrowDown') {
        stateRef.current.anchorOffset = selection ? selection.anchorOffset : 0
        emitKeyDownEvent('down')
      } else if (!e.shiftKey && e.key === 'ArrowUp') {
        stateRef.current.anchorOffset = selection ? selection.anchorOffset : 0
        emitKeyDownEvent('up')
      } else if (e.key === 'Backspace') {
        stateRef.current.anchorOffset = selection ? selection.anchorOffset : 0
        emitKeyDownEvent('backspace')
      } else {
        emitKeyDownEvent('none')
      }
    }

    const handleFocus = () => {
      stateRef.current.nodeIndex = index
    }

    const handleBlur = () => {
      stateRef.current.nodeIndex = -1
    }

    return (
      <ContentEditable
        innerRef={(node: any) => { nodesRef.current[index] = node } }
        css={tw`bg-blue-50 p-1`}
        tagName={tagName}
        html={html}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    )
  }, [])

  return (
    <div>
      <ReactMarkdown
        includeElementIndex
        components={
          {
            p: render,
            h1: render,
            h2: render,
            h3: render,
            div: render
          }
        }
      >
        {item}
      </ReactMarkdown>
    </div>
  )
}

export default MoonEditor
