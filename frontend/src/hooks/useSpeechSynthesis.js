import { useCallback, useEffect, useRef, useState } from 'react'

export function cleanTextForSpeech(text = '') {
  return text
    .replace(/SpO₂/g, 'blood oxygen')
    .replace(/SpO2/g, 'blood oxygen')
    .replace(/°C/g, ' degrees Celsius')
    .replace(/mSv/g, ' millisieverts')
    .replace(/BPM/g, 'beats per minute')
    .replace(/br\/min/g, 'breaths per minute')
    .replace(/&/g, ' and ')
    .replace(/[•·]/g, ' ')
    .replace(/[*_#>`]/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function useSpeechSynthesis() {
  const supported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window

  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState('')
  const [voices, setVoices] = useState([])
  const [selectedVoiceName, setSelectedVoiceName] = useState('')
  const utteranceRef = useRef(null)
  const finishCallbackRef = useRef(null)

  useEffect(() => {
    if (!supported) return undefined
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices()
      setVoices(available)
      const preferred =
        available.find((voice) => /google us english/i.test(voice.name)) ??
        available.find((voice) => /samantha|aria|jenny|female/i.test(voice.name) && voice.lang.startsWith('en')) ??
        available.find((voice) => voice.lang === 'en-US') ??
        available.find((voice) => voice.lang.startsWith('en'))
      if (preferred) setSelectedVoiceName(preferred.name)
    }
    loadVoices()
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices)
    }
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    utteranceRef.current = null
    finishCallbackRef.current = null
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  useEffect(() => () => {
    if (supported) {
      utteranceRef.current = null
      finishCallbackRef.current = null
      window.speechSynthesis.cancel()
    }
  }, [supported])

  const speak = useCallback(
    (text, { rate = 1, onEnd } = {}) => {
      if (!supported) {
        setError('Speech output is not supported in this browser.')
        return false
      }
      const clean = cleanTextForSpeech(text)
      if (!clean) return false

      const utterance = new SpeechSynthesisUtterance(clean)
      utterance.rate = Math.min(1.6, Math.max(0.6, rate))
      utterance.pitch = 1
      utterance.volume = 1

      const voice = voices.find((item) => item.name === selectedVoiceName)
      if (voice) utterance.voice = voice

      utteranceRef.current = utterance
      finishCallbackRef.current = onEnd ?? null
      window.speechSynthesis.cancel()

      utterance.onstart = () => {
        if (utteranceRef.current === utterance) setSpeaking(true)
      }
      utterance.onend = () => {
        if (utteranceRef.current !== utterance) return
        utteranceRef.current = null
        setSpeaking(false)
        const callback = finishCallbackRef.current
        finishCallbackRef.current = null
        callback?.()
      }
      utterance.onerror = (event) => {
        if (utteranceRef.current !== utterance) return
        utteranceRef.current = null
        setSpeaking(false)
        setError(
          event.error === 'not-allowed'
            ? 'Speech playback was blocked by the browser.'
            : 'Speech playback could not be completed.',
        )
      }

      setError('')
      setSpeaking(true)
      window.speechSynthesis.speak(utterance)
      return true
    },
    [selectedVoiceName, supported, voices],
  )

  return {
    supported,
    speaking,
    error,
    voices,
    selectedVoiceName,
    speak,
    stop,
  }
}
