import { useState, useCallback } from "react"

interface useCopyToClipboardProps {
  text: string
  copyMessage?: string
  duration?: number
}

export function useCopyToClipboard({
  text,
  duration = 2000,
}: useCopyToClipboardProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), duration)
    } catch (error) {
      console.error("Failed to copy text: ", error)
    }
  }, [text, duration])

  return { isCopied, handleCopy }
}
