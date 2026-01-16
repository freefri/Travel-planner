import { cn } from "../../lib/utils"

// MarkdownRenderer Mock
export function MarkdownRenderer({ children, className }: { children: string, className?: string }) {
    return (
        <div className={cn("whitespace-pre-wrap", className)}>
            {children}
        </div>
    )
}

// Collapsible Mocks
export function Collapsible({ children, className }: any) {
    return <div className={className}>{children}</div>
}

export function CollapsibleTrigger({ children }: any) {
    return <>{children}</>
}

export function CollapsibleContent({ children }: any) {
    return <>{children}</>
}

// FilePreview Mock
export function FilePreview({ file, onRemove }: any) {
    return (
        <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-xs">
            <span>{file.name}</span>
            {onRemove && (
                <button onClick={onRemove} className="text-muted-foreground hover:text-foreground">
                    &times;
                </button>
            )}
        </div>
    )
}

// AudioVisualizer Mock
export function AudioVisualizer({ stream: _stream, isRecording, onClick }: any) {
    return <div onClick={onClick} className="flex h-12 w-full items-center justify-center bg-muted/50">Audio Visualizer {isRecording ? '(Recording)' : ''}</div>
}

// InterruptPrompt Mock
export function InterruptPrompt({ isOpen, close }: { isOpen: boolean, close?: () => void }) {
    if (!isOpen) return null
    return (
        <div onClick={close} className="absolute -top-10 left-0 right-0 text-center text-xs text-muted-foreground cursor-pointer">
            Press Enter again to stop generation
        </div>
    )
}
