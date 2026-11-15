import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  MessageSquare,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  WifiOff,
} from 'lucide-react'
import { useMission } from '../../context/MissionContext'
import { MEDICAL_DISCLAIMER, MEDICAL_INSTRUCTIONS } from '../../data/missionData'
import { SUGGESTED_QUESTIONS } from '../../lib/assistant'
import { SectionHeader } from '../ui/SectionHeader'
import { Modal } from '../ui/Modal'

const tagTone = {
  SYSTEM: 'text-cyan-300/70 border-cyan-300/20 bg-cyan-400/[0.06]',
  'DECISION SUPPORT': 'text-sky-300/80 border-sky-300/20 bg-sky-400/[0.06]',
  'EMERGENCY PROTOCOL': 'text-rose-300 border-rose-400/25 bg-rose-500/10',
  TRIAGE: 'text-amber-300/80 border-amber-300/20 bg-amber-400/[0.06]',
  'EMERGENCY VOICE': 'text-rose-300 border-rose-400/25 bg-rose-500/10',
}

export function AIAssistant({ onOpenAssistant }) {
  const {
    messages,
    askAssistant,
    activeScenario,
    selectedAstronaut,
    startSymptomTriage,
    selectAssistantOption,
  } = useMission()
  const [input, setInput] = useState('')
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [hint, setHint] = useState('')
  const chatRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const chat = chatRef.current
    if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const closeInstructions = useCallback(() => setInstructionsOpen(false), [])

  const submit = (event) => {
    event?.preventDefault()
    const text = input.trim()
    if (!text) {
      setHint('Describe a symptom first, then ask the assistant.')
      inputRef.current?.focus()
      return
    }
    askAssistant(text)
    setInput('')
    setHint('')
  }

  const askSuggestion = (question) => {
    askAssistant(question)
    setHint('')
    inputRef.current?.focus()
  }

  const reportSymptoms = () => {
    startSymptomTriage()
    setHint('Choose a location with a button, or say the location in the full voice assistant.')
  }

  const latestMessage = messages[messages.length - 1]
  const activeOptions = latestMessage?.options ?? null

  return (
    <section id="ai-assistant-panel" className="glass-panel flex h-full flex-col overflow-hidden">
      <div className="border-b border-white/[0.06] p-4 pb-3.5">
        <SectionHeader
          icon={Bot}
          eyebrow="Autonomous care · on-device"
          title="AI Medical Assistant"
          description={`Rule-based clinical decision support for ${selectedAstronaut.name}.`}
          actions={
            <>
              <span
                className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2 py-1"
                title="The rule engine runs locally and needs no network connection"
              >
                <WifiOff size={9} className="text-emerald-400" />
                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-emerald-300">
                  Offline ready
                </span>
              </span>
              {onOpenAssistant && (
                <button
                  type="button"
                  onClick={onOpenAssistant}
                  className="flex items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-400/[0.06] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-cyan-200/80 transition hover:border-cyan-300/40 hover:text-cyan-100"
                  title="Open the full voice-enabled assistant"
                >
                  <Mic size={9} />
                  Voice
                  <ArrowUpRight size={9} />
                </button>
              )}
            </>
          }
        />
      </div>

      <div className="flex items-start gap-2 border-b border-sky-300/[0.08] bg-sky-400/[0.035] px-4 py-2">
        <ShieldCheck size={12} className="mt-0.5 shrink-0 text-sky-300/80" />
        <p className="text-[9px] leading-relaxed text-sky-100/60">
          Decision support only — not a diagnosis. Escalate unstable symptoms to the flight surgeon.
        </p>
      </div>

      <div ref={chatRef} className="scroll-slim min-h-[210px] flex-1 space-y-3 overflow-y-auto px-4 py-3.5">
        {messages.map((message) => {
          const isUser = message.role === 'user'
          const tone = tagTone[message.tag] ?? 'text-slate-400 border-white/10 bg-white/[0.03]'
          const emergency = message.emergency
          return (
            <div key={message.id} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                  isUser
                    ? 'border-cyan-300/20 bg-cyan-400/10 text-cyan-200'
                    : emergency
                      ? 'border-rose-400/25 bg-rose-500/10 text-rose-300'
                      : 'border-blue-300/20 bg-blue-400/[0.08] text-blue-200'
                }`}
              >
                {isUser ? <UserRound size={12} /> : <Bot size={12} />}
              </span>
              <div
                className={`max-w-[86%] rounded-xl border px-3 py-2.5 ${
                  isUser
                    ? 'rounded-tr-sm border-cyan-300/20 bg-cyan-400/[0.09]'
                    : emergency
                      ? 'rounded-tl-sm border-rose-400/25 bg-rose-500/[0.07]'
                      : 'rounded-tl-sm border-white/[0.07] bg-white/[0.03]'
                }`}
              >
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded border px-1 py-0.5 font-mono text-[6.5px] uppercase tracking-[0.1em] ${tone}`}>
                    {message.tag ?? (isUser ? 'CREW INPUT' : 'AI')}
                  </span>
                  <span className="font-mono text-[7px] text-slate-600">{message.time}</span>
                </div>
                <p
                  className={`whitespace-pre-line text-[10px] leading-[1.6] ${
                    emergency ? 'text-rose-50/85' : 'text-slate-300'
                  }`}
                >
                  {message.content}
                </p>
                {message.id === latestMessage?.id && activeOptions && (
                  <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-white/[0.07] pt-2">
                    {activeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          selectAssistantOption(option)
                          setHint('')
                        }}
                        className="rounded-md border border-amber-300/20 bg-amber-400/[0.06] px-2 py-1.5 text-[9px] text-amber-100/90 transition hover:border-amber-300/40 hover:bg-amber-400/[0.12]"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-white/[0.05] px-4 pb-4 pt-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[7px] uppercase tracking-[0.16em] text-slate-600">Try</span>
          <div className="scroll-slim flex gap-1.5 overflow-x-auto pb-0.5">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => askSuggestion(question)}
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
              type="submit"
              aria-label="Send health question"
              className="m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-400/15 text-cyan-200 transition hover:bg-cyan-400/25"
            >
              <Send size={13} />
            </button>
          </div>
          {hint && <p className="mt-1.5 text-[8.5px] text-amber-300/80">{hint}</p>}

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" onClick={reportSymptoms} className="btn-ghost h-8 px-2 text-[9.5px]">
              <Stethoscope size={12} className="text-cyan-300/80" />
              Report symptoms
            </button>
            <button
              type="button"
              onClick={() => setInstructionsOpen(true)}
              className="btn-ghost h-8 px-2 text-[9.5px]"
            >
              <BookOpen size={12} className="text-cyan-300/80" />
              View medical instructions
            </button>
            <button type="submit" className="btn-primary col-span-2 h-9 text-[10.5px]">
              <Sparkles size={13} />
              Ask health question
            </button>
          </div>
        </form>

        <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[7px] uppercase tracking-[0.1em] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            Local rule engine · no cloud
          </span>
          <span>{activeScenario ? 'Emergency context synced' : 'Awaiting input'}</span>
        </div>
      </div>

      <Modal
        open={instructionsOpen}
        onClose={closeInstructions}
        title="Medical instructions"
        eyebrow="Crew emergency protocols"
        icon={BookOpen}
        maxWidth="max-w-xl"
        footer={
          <button type="button" onClick={closeInstructions} className="btn-primary h-9 px-4 text-[11px]">
            Close
          </button>
        }
      >
        <p className="text-[11px] text-slate-400">{MEDICAL_DISCLAIMER}</p>
        <div className="mt-3 space-y-2">
          {MEDICAL_INSTRUCTIONS.map((item, index) => (
            <div key={item.title} className="rounded-lg border border-white/[0.07] bg-black/20 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded border border-cyan-300/20 bg-cyan-400/[0.06] font-mono text-[8px] text-cyan-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h4 className="panel-title text-[11px] font-semibold text-slate-200">{item.title}</h4>
              </div>
              <p className="mt-1.5 pl-7 text-[10px] leading-relaxed text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-lg border border-amber-300/15 bg-amber-400/[0.05] px-3 py-2 font-mono text-[8px] uppercase tracking-[0.08em] text-amber-200/70">
          Simulation reference only · follow flight-surgeon standing orders
        </p>
      </Modal>
    </section>
  )
}
