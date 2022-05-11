import React, { useCallback, useState } from 'react'

export const useTrigger = (): [number, () => void] => {
  const [count, setCount] = useState(0)
  const update = useCallback(() => {
    setCount(prev => prev + 1)
  }, [])
  return [count, update]
}
