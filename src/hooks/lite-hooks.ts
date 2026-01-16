import { useEffect } from "react"

export function useAutosizeTextArea({ ref, dependencies }: any) {
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto"
            ref.current.style.height = ref.current.scrollHeight + "px"
        }
    }, [ref, dependencies])
}

export function useAudioRecording({ onTranscriptionComplete }: any = {}) {
    return {
        isListening: false,
        isSpeechSupported: false,
        isRecording: false,
        isTranscribing: false,
        audioStream: null,
        toggleListening: () => { },
        stopRecording: () => {
            onTranscriptionComplete?.("Sample transcription")
        },
    }
}
