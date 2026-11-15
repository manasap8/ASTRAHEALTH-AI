import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Bot,
  Ear,
  MessageSquare,
  Mic,
  MicOff,
  Navigation,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Stethoscope,
  UserRound,
  Volume2,
  VolumeX,
  WifiOff,
} from 'lucide-react'
import { useMission } from '../context/MissionContext'
import { getAssistantReply } from '../lib/assistant'
import {
  isEmergencyPhrase,
  isStopListeningCommand,
  isStopSpeakingCommand,
  matchVoiceOption,
  parseNavigationCommand,
} from '../lib/voiceCommands'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { SUGGESTED_QUESTIONS } from '../lib/assistant'
import { VoiceWaveform } from '../components/voice/VoiceWaveform'
import { MedicalInstructionsModal } from '../components/assistant/MedicalInstructionsModal'
import { StatusPill } from '../components/ui/StatusPill'
import { SectionHeader } from '../components/ui/SectionHeader'

const NAV_SHORTCUTS = [
  { page: 'dashboard', label: 'Dashboard', command: '"Open dashboard"' },
  { page: 'health-monitoring', label: 'Health Monitoring', command: '"Open health monitoring"' },
  { page: 'medical-history', label: 'Medical History', command: '"Open medical history"' },
  { page: 'radiation', label: 'Radiation Levels', command: '"Show radiation levels"' },
  { page: 'mental-wellness', label: 'Mental Wellness', command: '"Open mental wellness"' },
]

const TAG_TONES = {
  SYSTEM: 'text-cyan-300/70 border-cyan-300/20 bg-cyan-400/[0.06]',
  'DECISION SUPPORT': 'text-sky-300/80 border-sky-300/20 bg-sky-400/[0.06]',
  TRIAGE: 'text-amber-300/80 border-amber-300/20 bg-amber-400/[0.06]',
  'EMERGENCY PROTOCOL': 'text-rose-300 border-rose-400/25 bg-rose-500/10',
  'EMERGENCY VOICE': 'text-rose-300 border-rose-400/25 bg-rose-500/10',
}

function sessionLabel(mode) {
  if (mode === 'emergency') return 'Emergency voice mode'
  if (mode === 'standby') return 'Hands-free standby'
  if (mode === 'dictation') return 'Listening'
  return 'Voice idle'
}

export function AIAssistantPage({ onNavigate }) {
  const {
    messages,
    askAssistant,
    sendAssistantExchange,
    startSymptomTriage,
    selectAssistantOption,
    selectedAstronaut,
    readings,
    activeScenario,
    triggerEmergency,
    preferences,
    updatePreferences,
  } = useMission()

  const [input, setInput] = useState('')
  const [hint, setHint] = useState('')
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [lastTranscript, setLastTranscript] = useState('')
  const [voiceNote, setVoiceNote] = useState('Voice is idle. Use the microphone or start an emergency voice session.')
  const [voiceSession, setVoiceSession] = useState('idle')
  const voiceSessionRef = useRef('idle')
  const chatRef = useRef(null)
  const inputRef = useRef(null)

  const setSession = (mode) => {
    voiceSessionRef.current = mode
    setVoiceSession(mode)
  }

  const speech = useSpeechSynthesis()
  const recognition = useSpeechRecognition({ onFinal: handleSpeechFinal })

  const latestMessage = messages[messages.length - 1]
  const activeOptions = latestMessage?.role === 'assistant' ? latestMessage.options : null
  const lastAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant')
  const emergencyMode = voiceSession === 'emergency'
  const handsFree = voiceSession === 'standby'
  const voiceEnabled = preferences.voice.enabled

  useEffect(() => {
    const chat = chatRef.current
    if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' })
  }, [messages, recognition.interim])

  function startVoiceSession({ continuous = false, mode = 'dictation' } = {}) {
    if (!recognition.supported) {
      setVoiceNote('Voice input is not supported in this browser. Text chat remains fully available.')
      return false
    }
    if (speech.speaking) speech.stop()
    setSession(mode)
    const started = recognition.start({ continuous })
    if (!started) {
      setSession('idle')
      return false
    }
    setVoiceNote(
      mode === 'emergency'
        ? 'Emergency listening active. Describe what you are experiencing.'
        : mode === 'standby'
          ? 'Hands-free standby active. Say “AstroGuardian, emergency help” at any time.'
          : 'Listening… speak your health question.',
    )
    return true
  }

  function stopVoiceSession(note = 'Voice input stopped. Text chat remains available.') {
    setSession('idle')
    recognition.stop()
    setVoiceNote(note)
  }

  function speakResponse(text, { force = false, resumeAfter = true } = {}) {
    const shouldResume = resumeAfter && voiceSessionRef.current === 'emergency'
    if (recognition.listening) recognition.stop()

    if ((!voiceEnabled && !force) || !text) {
      if (shouldResume) {
        setTimeout(() => {
          if (voiceSessionRef.current === 'emergency') {
            startVoiceSession({ continuous: true, mode: 'emergency' })
          }
        }, 350)
      }
      return false
    }

    if (!speech.supported) {
      if (shouldResume) {
        setTimeout(() => {
          if (voiceSessionRef.current === 'emergency') {
            startVoiceSession({ continuous: true, mode: 'emergency' })
          }
        }, 350)
      }
      return false
    }

    const started = speech.speak(text, {
      rate: preferences.voice.rate,
      onEnd: () => {
        if (voiceSessionRef.current === 'emergency') {
          setTimeout(() => {
            if (voiceSessionRef.current === 'emergency') {
              startVoiceSession({ continuous: true, mode: 'emergency' })
            }
          }, 320)
        }
      },
    })

    if (!started && shouldResume) {
      startVoiceSession({ continuous: true, mode: 'emergency' })
    }
    return started
  }

  function askFromText(text, { fromVoice = false } = {}) {
    const value = text.trim()
    if (!value) {
      setHint('Describe a symptom or ask a health question first.')
      inputRef.current?.focus()
      return
    }
    const reply = askAssistant(value)
    setInput('')
    setHint('')
    setLastTranscript(value)
    if (fromVoice || (voiceEnabled && preferences.voice.autoSpeak)) {
      speakResponse(reply, { force: fromVoice, resumeAfter: false })
    }
  }

  function handleOption(option) {
    const reply = selectAssistantOption(option)
    setHint('')
    if (voiceEnabled && preferences.voice.autoSpeak) {
      speakResponse(reply, { resumeAfter: voiceSessionRef.current === 'emergency' })
    } else if (voiceSessionRef.current === 'emergency') {
      setTimeout(() => startVoiceSession({ continuous: true, mode: 'emergency' }), 350)
    }
  }

  function activateEmergencyMode() {
    if (!activeScenario) triggerEmergency()
    setSession('emergency')
    if (speech.supported) {
      updatePreferences('voice', { enabled: true })
    }
    const activation =
      'Emergency assistance activated. Please tell me what you are experiencing.'
    sendAssistantExchange('', activation, {
      tag: 'EMERGENCY VOICE',
      severity: 'critical',
      emergency: true,
    })
    setVoiceNote('Emergency voice mode active. Describe what you are experiencing.')
    setLastTranscript('')
    speakResponse(activation, { force: true })
    if (!speech.supported) {
      if (recognition.supported) startVoiceSession({ continuous: true, mode: 'emergency' })
    }
  }

  function handleEmergencySymptom(transcript) {
    const reply = getAssistantReply(transcript, readings)
    const fullReply = `I have recorded your reported symptom. Please follow your approved onboard emergency medical protocol. I will guide you through the available assessment steps.\n\n${reply}`
    sendAssistantExchange(transcript, fullReply, {
      tag: 'EMERGENCY PROTOCOL',
      severity: 'critical',
      emergency: true,
    })
    setVoiceNote('Symptom recorded. Follow the spoken instructions or the text protocol.')
    speakResponse(fullReply, { force: true })
  }

  function handleSpeechFinal(transcript) {
    const value = transcript.trim()
    if (!value) return
    setLastTranscript(value)

    if (isStopSpeakingCommand(value)) {
      speech.stop()
      setVoiceNote('Speech output stopped.')
      return
    }

    if (isStopListeningCommand(value)) {
      stopVoiceSession()
      return
    }

    if (isEmergencyPhrase(value)) {
      activateEmergencyMode()
      return
    }

    const navigation = parseNavigationCommand(value)
    if (navigation) {
      setVoiceNote(`Voice command recognised: opening ${navigation.label}.`)
      recognition.stop()
      setTimeout(() => onNavigate(navigation.page), 300)
      return
    }

    if (activeOptions) {
      const option = matchVoiceOption(value, activeOptions)
      if (option) {
        handleOption(option)
        return
      }
      const retry = 'I did not catch a matching body location. Please choose Head, Chest, Stomach, Arms or legs, or Other.'
      sendAssistantExchange(value, retry, {
        tag: 'TRIAGE',
        options: activeOptions,
        optionPrompt: true,
      })
      speakResponse(retry, { resumeAfter: emergencyMode })
      return
    }

    if (voiceSessionRef.current === 'emergency') {
      handleEmergencySymptom(value)
      return
    }

    if (voiceSessionRef.current === 'standby') {
      setVoiceNote(
        'Wake phrase not detected. Say “AstroGuardian, emergency help”, or press the microphone to ask a question.',
      )
      return
    }

    askFromText(value, { fromVoice: true })
    setSession('idle')
  }

  const submit = (event) => {
    event.preventDefault()
    askFromText(input)
  }

  const reportSymptoms = () => {
    const { prompt } = startSymptomTriage()
    setHint('Choose a location below or say the location aloud when voice is active.')
    if (voiceEnabled && preferences.voice.autoSpeak) speakResponse(prompt, { resumeAfter: false })
  }

  const speakLastAnswer = () => {
    if (!lastAssistantMessage) return
    speakResponse(lastAssistantMessage.content, { force: true, resumeAfter: false })
  }

  const toggleVoiceOutput = () => {
    const next = !voiceEnabled
    updatePreferences('voice', { enabled: next })
    if (!next) {
      speech.stop()
      setVoiceNote('Voice output muted. Manual “Speak answer” still works.')
    } else {
      setVoiceNote('Voice output enabled.')
    }
  }

  const toggleDictation = () => {
    if (recognition.listening && voiceSessionRef.current === 'dictation') {
      stopVoiceSession()
    } else {
      startVoiceSession({ continuous: false, mode: 'dictation' })
    }
  }

  const toggleHandsFree = () => {
    if (handsFree && recognition.listening) {
      stopVoiceSession('Hands-free standby stopped.')
    } else {
      startVoiceSession({ continuous: true, mode: 'standby' })
    }
  }

  const waveformActive = recognition.listening || speech.speaking
  const waveformTone = emergencyMode ? 'rose' : speech.speaking ? 'amber' : 'cyan'

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4">
      <div className="fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">Autonomous decision support</span>
            <span className="flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/[0.05] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-emerald-300/80">
              <WifiOff size={8} />
              Offline-ready rules
            </span>
            {activeScenario && <StatusPill level={activeScenario.severity} label="Emergency context active" pulse />}
          </div>
          <h1 className="panel-title mt-1 text-xl font-semibold text-slate-50">AI Medical Assistant</h1>
          <p className="mt-1 max-w-[710px] text-[11px] leading-relaxed text-slate-400">
            Text and voice decision support for {selectedAstronaut.name}. This assistant does not
            diagnose disease and never replaces approved medical protocols or flight-surgeon guidance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[7.5px] uppercase tracking-[0.08em] ${
              recognition.supported
                ? 'border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-300/75'
                : 'border-amber-400/20 bg-amber-400/[0.05] text-amber-200/80'
            }`}
          >
            {recognition.supported ? <Mic size={11} /> : <MicOff size={11} />}
            {recognition.supported ? 'Voice input available' : 'Voice input unsupported'}
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[7.5px] uppercase tracking-[0.08em] ${
              speech.supported
                ? 'border-cyan-300/15 bg-cyan-400/[0.04] text-cyan-200/75'
                : 'border-amber-400/20 bg-amber-400/[0.05] text-amber-200/80'
            }`}
          >
            <Volume2 size={11} />
            {speech.supported ? 'Speech output available' : 'Speech output unsupported'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="glass-panel flex min-h-[680px] flex-col overflow-hidden">
          <div className="border-b border-white/[0.06] p-4">
            <SectionHeader
              icon={Bot}
              eyebrow="Medical AI · text & voice"
              title={`Conversation · ${selectedAstronaut.name}`}
              description="Ask a question, report symptoms, or choose a location when prompted."
              actions={
                <span className="flex items-center gap-1.5 font-mono text-[7px] uppercase tracking-[0.08em] text-slate-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${voiceSession === 'idle' ? 'bg-slate-500' : 'animate-pulse bg-cyan-300'}`} />
                  {sessionLabel(voiceSession)}
                </span>
              }
            />
          </div>

          <div className="flex items-start gap-2 border-b border-sky-300/[0.08] bg-sky-400/[0.03] px-4 py-2">
            <ShieldCheck size={12} className="mt-0.5 shrink-0 text-sky-300/80" />
            <p className="text-[9px] leading-relaxed text-sky-100/60">
              Decision support only — not a diagnosis. In an emergency follow the onboard protocol
              and contact the flight surgeon.
            </p>
          </div>

          <div
            ref={chatRef}
            className="scroll-slim min-h-[360px] flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => {
              const isUser = message.role === 'user'
              const tone = TAG_TONES[message.tag] ?? 'text-slate-400 border-white/10 bg-white/[0.03]'
              const isLatest = message.id === latestMessage?.id
              return (
                <div key={message.id} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                      isUser
                        ? 'border-cyan-300/20 bg-cyan-400/10 text-cyan-200'
                        : message.emergency
                          ? 'border-rose-400/25 bg-rose-500/10 text-rose-300'
                          : 'border-blue-300/20 bg-blue-400/[0.08] text-blue-200'
                    }`}
                  >
                    {isUser ? <UserRound size={13} /> : <Bot size={13} />}
                  </span>
                  <div
                    className={`max-w-[88%] rounded-xl border px-3.5 py-2.5 ${
                      isUser
                        ? 'rounded-tr-sm border-cyan-300/20 bg-cyan-400/[0.09]'
                        : message.emergency
                          ? 'rounded-tl-sm border-rose-400/25 bg-rose-500/[0.07]'
                          : 'rounded-tl-sm border-white/[0.07] bg-white/[0.03]'
                    }`}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded border px-1 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.1em] ${tone}`}>
                        {message.tag ?? (isUser ? 'CREW INPUT' : 'AI')}
                      </span>
                      <span className="font-mono text-[7px] text-slate-600">{message.time}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() =>
                            speakResponse(message.content, { force: true, resumeAfter: false })
                          }
                          className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.06em] text-cyan-300/60 transition hover:bg-cyan-400/[0.08] hover:text-cyan-200"
                          aria-label="Speak this answer"
                          title="Speak answer"
                        >
                          <Volume2 size={9} />
                          Speak
                        </button>
                      )}
                    </div>
                    <p
                      className={`whitespace-pre-line text-[10.5px] leading-[1.65] ${
                        message.emergency ? 'text-rose-50/85' : 'text-slate-300'
                      }`}
                    >
                      {message.content}
                    </p>
                    {isLatest && activeOptions && (
                      <div className="mt-2.5 border-t border-white/[0.08] pt-2.5">
                        <div className="mb-1.5 font-mono text-[6.5px] uppercase tracking-[0.1em] text-amber-200/60">
                          Select or speak a location
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                          {activeOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleOption(option)}
                              className="rounded-md border border-amber-300/20 bg-amber-400/[0.06] px-2 py-1.5 text-[9px] text-amber-100/90 transition hover:border-amber-300/40 hover:bg-amber-400/[0.12]"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {recognition.interim && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-lg border border-dashed border-cyan-300/25 bg-cyan-400/[0.04] px-3 py-2">
                  <div className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-cyan-300/50">
                    Hearing…
                  </div>
                  <p className="mt-0.5 text-[10px] italic text-cyan-100/60">{recognition.interim}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.05] px-4 pb-4 pt-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-[7px] uppercase tracking-[0.16em] text-slate-600">Try</span>
              <div className="scroll-slim flex gap-1.5 overflow-x-auto pb-0.5">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => {
                      const reply = askAssistant(question)
                      setLastTranscript(question)
                      if (voiceEnabled && preferences.voice.autoSpeak) {
                        speakResponse(reply, { resumeAfter: false })
                      }
                    }}
                    className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.025] px-2 py-1 text-[8.5px] text-slate-400 transition hover:border-cyan-300/25 hover:bg-cyan-400/[0.05] hover:text-cyan-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submit}>
              <div className="field-wrap">
                <span className="pl-3 text-slate-500">
                  <MessageSquare size={14} />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value)
                    if (hint) setHint('')
                  }}
                  placeholder="Ask about a symptom or health concern…"
                  className="field-input py-2.5! text-[11px]!"
                  aria-label="Ask a health question"
                />
                <button
                  type="button"
                  onClick={toggleDictation}
                  disabled={!recognition.supported}
                  aria-label={recognition.listening && voiceSession === 'dictation' ? 'Stop listening' : 'Start voice input'}
                  className={`m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    recognition.listening && voiceSession === 'dictation'
                      ? 'animate-pulse border-rose-400/40 bg-rose-500/15 text-rose-300'
                      : 'border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-300 hover:bg-cyan-400/[0.16]'
                  }`}
                  title={recognition.supported ? 'Use your microphone' : 'Voice input is not supported in this browser'}
                >
                  {recognition.listening && voiceSession === 'dictation' ? <MicOff size={13} /> : <Mic size={13} />}
                </button>
                <button
                  type="submit"
                  aria-label="Send health question"
                  className="m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-400/15 text-cyan-200 transition hover:bg-cyan-400/25"
                >
                  <Send size={13} />
                </button>
              </div>
              {hint && <p className="mt-1.5 text-[8.5px] text-amber-300/80">{hint}</p>}
              {recognition.error && <p className="mt-1.5 text-[8.5px] text-rose-300/80">{recognition.error}</p>}

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={reportSymptoms} className="btn-ghost h-9 px-2 text-[9.5px]">
                  <Stethoscope size={12} className="text-cyan-300/80" />
                  Report symptoms
                </button>
                <button
                  type="button"
                  onClick={() => setInstructionsOpen(true)}
                  className="btn-ghost h-9 px-2 text-[9.5px]"
                >
                  <BookOpen size={12} className="text-cyan-300/80" />
                  View medical instructions
                </button>
                <button type="submit" className="btn-primary col-span-2 h-10 text-[10.5px]">
                  <Sparkles size={13} />
                  Ask health question
                </button>
              </div>
            </form>

            <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-white/[0.05] pt-2.5 text-[8px] text-slate-500 sm:grid-cols-4">
              <button
                type="button"
                onClick={toggleVoiceOutput}
                className="flex items-center justify-center gap-1.5 rounded-md border border-white/[0.06] px-1.5 py-1.5 transition hover:border-cyan-300/25 hover:text-cyan-200"
              >
                {voiceEnabled ? <Volume2 size={11} /> : <VolumeX size={11} />}
                {voiceEnabled ? 'Voice on' : 'Voice off'}
              </button>
              <button
                type="button"
                onClick={speakLastAnswer}
                disabled={!speech.supported || !lastAssistantMessage}
                className="flex items-center justify-center gap-1.5 rounded-md border border-white/[0.06] px-1.5 py-1.5 transition hover:border-cyan-300/25 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Volume2 size={11} />
                Speak answer
              </button>
              <button
                type="button"
                onClick={speakLastAnswer}
                disabled={!speech.supported || !lastAssistantMessage}
                className="flex items-center justify-center gap-1.5 rounded-md border border-white/[0.06] px-1.5 py-1.5 transition hover:border-cyan-300/25 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={11} />
                Repeat answer
              </button>
              <button
                type="button"
                onClick={() => {
                  speech.stop()
                  setVoiceNote('Speech output stopped.')
                }}
                disabled={!speech.supported || !speech.speaking}
                className="flex items-center justify-center gap-1.5 rounded-md border border-white/[0.06] px-1.5 py-1.5 transition hover:border-rose-300/25 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Square size={10} />
                Stop speaking
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-3">
          <section
            className={`glass-panel overflow-hidden border ${
              emergencyMode || activeScenario ? 'border-rose-400/30' : 'border-white/[0.06]'
            }`}
          >
            <div
              className={`border-b px-4 py-3 ${
                emergencyMode || activeScenario
                  ? 'border-rose-400/20 bg-gradient-to-r from-rose-500/[0.12] to-transparent'
                  : 'border-white/[0.06] bg-gradient-to-r from-cyan-400/[0.05] to-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert
                    size={15}
                    className={emergencyMode || activeScenario ? 'text-rose-300' : 'text-cyan-300'}
                  />
                  <span className="panel-title text-[12px] font-semibold text-slate-100">
                    Emergency Voice Mode
                  </span>
                </div>
                {(emergencyMode || activeScenario) && (
                  <span className="flex items-center gap-1.5 rounded-full border border-rose-400/25 bg-rose-500/10 px-2 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-rose-300">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-rose-400" />
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-[9px] leading-relaxed text-slate-500">
                Hands-free escalation for astronauts who cannot type or click during a critical event.
              </p>
            </div>

            <div className="p-4">
              <div className="rounded-lg border border-cyan-300/15 bg-cyan-400/[0.04] px-3 py-2 text-center">
                <div className="font-mono text-[6.5px] uppercase tracking-[0.14em] text-cyan-300/55">
                  Voice activation phrase
                </div>
                <div className="mt-1 font-display text-[11px] font-medium text-cyan-100">
                  “AstroGuardian, emergency help.”
                </div>
              </div>

              <button
                type="button"
                onClick={emergencyMode ? () => stopVoiceSession('Emergency voice listening stopped. Alert remains active.') : activateEmergencyMode}
                className={`group relative mt-3 flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-4 transition ${
                  emergencyMode
                    ? 'border-rose-400/40 bg-rose-500/[0.12] text-rose-100'
                    : 'border-rose-400/30 bg-gradient-to-b from-rose-500/[0.12] to-rose-600/[0.04] text-rose-100 hover:border-rose-300/50 hover:from-rose-500/[0.2]'
                }`}
              >
                <span className="relative flex h-11 w-11 items-center justify-center">
                  {recognition.listening && emergencyMode && (
                    <>
                      <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/20" />
                      <span className="absolute -inset-2 rounded-full border border-rose-400/20" />
                    </>
                  )}
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-rose-300/40 bg-rose-500/20">
                    {emergencyMode ? <MicOff size={19} /> : <Mic size={19} />}
                  </span>
                </span>
                <span className="text-[11px] font-semibold">
                  {emergencyMode ? 'Stop emergency listening' : 'Activate Emergency Voice Mode'}
                </span>
                <span className="font-mono text-[7px] uppercase tracking-[0.08em] text-rose-200/50">
                  Triggers dashboard alert · spoken guidance
                </span>
              </button>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={toggleHandsFree}
                  disabled={!recognition.supported}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[9px] transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    handsFree
                      ? 'border-cyan-300/35 bg-cyan-400/[0.1] text-cyan-100'
                      : 'border-white/[0.08] bg-white/[0.025] text-slate-400 hover:border-cyan-300/25 hover:text-cyan-200'
                  }`}
                >
                  <Ear size={12} />
                  {handsFree ? 'Hands-free standby on' : 'Hands-free standby'}
                </button>
                <button
                  type="button"
                  onClick={() => stopVoiceSession()}
                  disabled={voiceSession === 'idle'}
                  className="rounded-lg border border-white/[0.08] px-2.5 py-2 text-[9px] text-slate-500 transition hover:border-rose-300/25 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Stop mic
                </button>
              </div>

              <div
                className={`mt-3 rounded-lg border px-2.5 py-2 ${
                  emergencyMode
                    ? 'border-rose-400/20 bg-rose-500/[0.06]'
                    : 'border-white/[0.06] bg-black/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-500">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        recognition.listening
                          ? emergencyMode
                            ? 'animate-pulse bg-rose-400'
                            : 'animate-pulse bg-cyan-300'
                          : speech.speaking
                            ? 'animate-pulse bg-amber-300'
                            : 'bg-slate-600'
                      }`}
                    />
                    {recognition.listening
                      ? emergencyMode
                        ? 'Listening · emergency'
                        : 'Listening'
                      : speech.speaking
                        ? 'Assistant speaking'
                        : 'Microphone idle'}
                  </span>
                  <span className="font-mono text-[6.5px] uppercase tracking-[0.06em] text-slate-600">
                    {sessionLabel(voiceSession)}
                  </span>
                </div>
                <VoiceWaveform active={waveformActive} tone={waveformTone} bars={28} className="mt-1" />
                <p className="mt-1 text-[8.5px] leading-relaxed text-slate-400">{voiceNote}</p>
              </div>

              <div className="mt-2 rounded-lg border border-white/[0.06] bg-black/15 px-2.5 py-2">
                <div className="font-mono text-[6.5px] uppercase tracking-[0.1em] text-slate-600">
                  Recognized speech
                </div>
                <p className="mt-1 min-h-[28px] text-[9.5px] leading-relaxed text-slate-300">
                  {recognition.interim || lastTranscript || 'No speech recognized yet.'}
                </p>
              </div>

              {!recognition.supported && (
                <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-2.5 py-2">
                  <AlertTriangle size={11} className="mt-0.5 shrink-0 text-amber-300" />
                  <p className="text-[8px] leading-relaxed text-amber-100/65">
                    This browser does not expose the Web Speech recognition API. Text chat and
                    emergency alert activation still work; use a Chromium-based browser for voice.
                  </p>
                </div>
              )}
              {recognition.error && (
                <p className="mt-2 rounded border border-rose-400/20 bg-rose-500/[0.06] px-2.5 py-2 text-[8px] text-rose-200/80">
                  {recognition.error}
                </p>
              )}
              {!speech.supported && (
                <p className="mt-2 font-mono text-[7px] uppercase tracking-[0.06em] text-amber-200/55">
                  Speech synthesis is unavailable in this browser.
                </p>
              )}
              {speech.speaking && (
                <button
                  type="button"
                  onClick={() => speech.stop()}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-amber-300/25 bg-amber-400/[0.06] py-1.5 text-[8.5px] text-amber-100/80"
                >
                  <Square size={9} />
                  Stop speaking
                </button>
              )}
            </div>
          </section>

          <section className="glass-panel p-4">
            <div className="flex items-center gap-2">
              <Navigation size={13} className="text-cyan-300" />
              <span className="panel-title text-[11px] font-semibold text-slate-200">
                Voice navigation
              </span>
            </div>
            <p className="mt-1 text-[8.5px] leading-relaxed text-slate-500">
              Say a command while the microphone is listening, or use a shortcut.
            </p>
            <div className="mt-2 space-y-1.5">
              {NAV_SHORTCUTS.map((item) => (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => onNavigate(item.page)}
                  className="group flex w-full items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-left transition hover:border-cyan-300/25 hover:bg-cyan-400/[0.04]"
                >
                  <span className="text-[9px] text-slate-300">{item.label}</span>
                  <span className="flex items-center gap-1 font-mono text-[6.5px] text-slate-600 group-hover:text-cyan-300/60">
                    {item.command}
                    <ArrowUpRight size={9} />
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-panel p-4">
            <div className="flex items-center gap-2">
              <VolumeX size={13} className="text-slate-400" />
              <span className="panel-title text-[11px] font-semibold text-slate-200">Voice settings</span>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] text-slate-400">Voice output</span>
                <button
                  type="button"
                  onClick={toggleVoiceOutput}
                  className={`rounded-full border px-2 py-1 font-mono text-[7px] uppercase tracking-[0.08em] transition ${
                    voiceEnabled
                      ? 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300'
                      : 'border-white/10 bg-white/[0.03] text-slate-500'
                  }`}
                >
                  {voiceEnabled ? 'On' : 'Off'}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] text-slate-400">Auto-speak responses</span>
                <button
                  type="button"
                  onClick={() =>
                    updatePreferences('voice', { autoSpeak: !preferences.voice.autoSpeak })
                  }
                  className={`rounded-full border px-2 py-1 font-mono text-[7px] uppercase tracking-[0.08em] transition ${
                    preferences.voice.autoSpeak
                      ? 'border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-300'
                      : 'border-white/10 bg-white/[0.03] text-slate-500'
                  }`}
                >
                  {preferences.voice.autoSpeak ? 'On' : 'Off'}
                </button>
              </div>
              <p className="border-t border-white/[0.05] pt-2 font-mono text-[6.5px] uppercase leading-relaxed tracking-[0.06em] text-slate-600">
                Browsers may stop continuous listening. Use the microphone or emergency button to
                resume. Microphone permission is required.
              </p>
            </div>
          </section>
        </aside>
      </div>

      <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3 font-mono text-[7px] uppercase leading-relaxed tracking-[0.08em] text-slate-600">
        Simulated voice interface · speech recognition and synthesis depend on browser support,
        microphone permission and network services · not for real clinical use
      </div>

      <MedicalInstructionsModal open={instructionsOpen} onClose={() => setInstructionsOpen(false)} />
    </div>
  )
}
