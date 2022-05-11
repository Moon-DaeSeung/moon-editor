import React from 'react'

function normalizeHtml (str: string): string {
  return str && str.replace(/&nbsp;|\u202F|\u00A0/g, ' ')
}

export default class ContentEditable extends React.Component<ContentEditableProps> {
  el: any
  lastHtml: string
  commit: boolean
  getEl: () => HTMLElement | undefined
  emitChange: () => void

  constructor (props: ContentEditableProps) {
    super(props)
    this.el = typeof this.props.innerRef === 'function' ? { current: null } : React.createRef<HTMLElement>()
    this.lastHtml = this.props.html
    this.commit = true
    this.getEl = () => (this.props.innerRef && typeof this.props.innerRef !== 'function' ? this.props.innerRef : this.el).current
    this.emitChange = () => {
      const el = this.getEl()
      if (!el) return
      const html = el.innerHTML
      this.commit = false
      this.lastHtml = html
      this.props.onChange(html)
    }
  }

  handleKeyDown (e: any) {
    if (e.keyCode === 13) {
      e.preventDefault()
      document.execCommand('insertHTML', false, '\n')
    }
  }

  render () {
    const { html, style, innerRef, tagName, ...props } = this.props
    return React.createElement(
      tagName || 'div',
      {
        ...props,
        ref: typeof innerRef === 'function'
          ? (current: HTMLElement) => {
              innerRef(current)
              this.el.current = current
            }
          : innerRef || this.el,
        style: { ...style, whiteSpace: 'pre-wrap' },
        onInput: this.emitChange,
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur,
        onKeyDown: this.props.onKeyDown || this.handleKeyDown,
        contentEditable: true,
        spellCheck: false,
        dangerouslySetInnerHTML: { __html: html }
      })
  }

  shouldComponentUpdate (nextProps: ContentEditableProps): boolean {
    const prevHtml = normalizeHtml(this.lastHtml)
    const nextHtml = normalizeHtml(nextProps.html)

    if (prevHtml === nextHtml) {
      this.commit = true
    }

    return this.commit && prevHtml !== nextHtml
  }

  componentDidUpdate () {
    const el = this.getEl()
    if (!el) return
    if (this.props.html !== el.innerHTML) {
      el.innerHTML = this.props.html
    }
    this.lastHtml = this.props.html
  }
}

type ContentEditableProps = {
  innerRef?: React.RefObject<HTMLElement> | Function,
  html: string
  style?: any
  onChange: (html: string) => void
  tagName?: string
  onKeyDown?: (e: any) => void
  onFocus?: (e: any) => void
  onBlur?: (e: any) => void
}
