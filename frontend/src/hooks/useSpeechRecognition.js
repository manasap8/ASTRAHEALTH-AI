import { useCallback, useEffect, useRef, useState } from 'react'

const ERROR_MESSAGES = {
  'not-allowed': 'Microphone permission was denied. Allow access in your browser settings to use voice input.',
  'service-not-allowed': 'Voice recognition is blocked by the browser. Text input remains available.',
  'audio-capture': 'No microphone was detected. Connect a microphone or use text input.',
  'no-speech': 'No speech detected. Try again when you are ready.',
  network: 'The browser’s speech service is unavailable. Text input remains available.',
  aborted: '',
}

const recognitionIsSupported = () =>
  typeof window !== 'undefined' &&
  Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)

export function useSpeechRecognition({ onFinal } = {}) {
  const [supported, setSupported] = useState(recognitionIsSupported)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')

  const recognitionRef = useRef(null)
  const wantListeningRef = useRef(false)
  const continuousRef = useRef(false)
  const restartTimerRef = useRef(null)
  const onFinalRef = useRef(onFinal)

  useEffect(() => {
    onFinalRef.current = onFinal
  }, [onFinal])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) return undefined

    const recognition = new Recognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setListening(true)
      setError('')
    }

    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript ?? ''
        if (event.results[index].isFinal) finalText += transcript
        else interimText += transcript
      }
      setInterim(interimText.trim())
      if (finalText.trim()) {
        setInterim('')
        onFinalRef.current?.(finalText.trim())
      }
    }

    recognition.onerror = (event) => {
      const message = ERROR_MESSAGES[event.error] ?? `Voice input error: ${event.error}.`
      setError(message)
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)) {
        wantListeningRef.current = false
        setListening(false)
      }
    }

    recognition.onend = () => {
      setListening(false)
      setInterim('')
      if (!wantListeningRef.current || !continuousRef.current) return
      restartTimerRef.current = setTimeout(() => {
        if (!wantListeningRef.current) return
        try {
          recognition.continuous = true
          recognition.start()
        } catch {
          // InvalidStateError means recognition is already starting; ignore it.
        }
      }, 450)
    }

    recognitionRef.current = recognition

    return () => {
      wantListeningRef.current = false
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
      try {
        recognition.abort()
      } catch {
        // ignore teardown errors
      }
      recognitionRef.current = null
    }
  }, [])

  const start = useCallback(({ continuous = false } = {}) => {
    if (!recognitionRef.current) {
      setError('Voice input is not supported in this browser. You can still use text chat.')
      return false
    }
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    wantListeningRef.current = true
    continuousRef.current = continuous
    setError('')
    try {
      recognitionRef.current.continuous = continuous
      recognitionRef.current.start()
      return true
    } catch (startError) {
      if (startError?.name === 'InvalidStateError') return true
      wantListeningRef.current = false
      setError('Voice input could not start. Check microphone permissions and try again.')
      return false
    }
  }, [])

  const stop = useCallback(() => {
    wantListeningRef.current = false
    continuousRef.current = false
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    try {
      recognitionRef.current?.stop()
    } catch {
      // ignore
    }
    setListening(false)
    setInterim('')
  }, [])

  return { supported, listening, interim, error, start, stop, clearError: () => setError('') }
}
