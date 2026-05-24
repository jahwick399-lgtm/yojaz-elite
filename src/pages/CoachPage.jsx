import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, RotateCcw, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

// ─── Knowledge base ──────────────────────────────────────────────────────────
const KB = {
  aim: [
    "For aim improvement, the single biggest lever is **crosshair placement before the edit** — not raw mouse speed. If your crosshair is already at head level when the edit opens, you only need a tiny micro-adjustment to connect. Practice this in box fights first.\n\nFor dedicated drills: Skaavok Aim Trainer (4080-0122-5935) is the best starting point. 15 minutes daily is enough — don't grind aim for 2 hours, you'll hit diminishing returns.",
    "Aim overcompensation is one of the most common problems I see. After a miss your brain overcorrects, which leads to a second miss in the opposite direction. Fix: slow your sensitivity down by 5–10% and practice micro-corrections rather than large snaps. Smoothness > speed in 90% of Fortnite scenarios.",
    "For tracking improvement specifically, Raider464's map (6531-4403-0726) gives you real moving targets at Fortnite speed. 10 minutes of deliberate tracking — actually thinking about staying on target, not just clicking — beats 45 minutes of mindless grinding.",
    "Flick aim vs tracking aim: in Fortnite you need both. Use Skaavok (4080-0122-5935) for tracking reps and mix in flick scenarios. The key metric to watch is your consistency percentage, not your peak performance. Consistent 70% beats occasional 90%.",
  ],
  editing: [
    "Edit speed comes from **rhythm**, not raw hand speed. The sequence is: edit → confirm → reset → repeat. If your reset timing is off, your edits will feel inconsistent regardless of how fast your hands move. Practice the rhythm slowly until it's automatic.\n\nBest map: The Edit Course by Cizzorz (5856-7619-3536). Run it at 80% of your max pace until you can do it clean, then push speed.",
    "Edit consistency under pressure is a completely different skill from edit consistency in calm practice. If you practice edits only in slow peaceful maps, you'll freeze in box fights. Add box fight pressure reps — Clix Box Fight (7620-0771-9529) — where edits matter in real time.",
    "The underrated edit skill is reading **which edit** your opponent is about to throw. Watch the tell — when they're about to edit, their build placement often pauses for a frame. Pre-aim that position. A slow read + fast aim beats a fast edit + slow aim.",
    "For advanced editors: practice triple-edit combos — cone edit, wall edit, floor edit in sequence. This is the mechanical gap between Champions and Unreal. Run it in JHIB's map (4531-3225-5670) until it's muscle memory.",
  ],
  mechanics: [
    "Mechanics plateau happens when you only practice your strengths. Audit your toolkit: which specific mechanic costs you the most games? Is it the defensive response to a ramp rush? The pyramid retake? Cone denial? Isolate that ONE mechanic and spend 30% of every session on it for two weeks.\n\nJHIB Mechanics Map (4531-3225-5670) has all of these covered in one place.",
    "The pyramid high-ground retake is the highest-ROI mechanic most players skip. It works 95% of the time against players below Unreal, and even pros use it. Learn it: build a box, place a cone, edit the cone, ramp, replace — repeat until automatic.",
    "Ramp rushes: the most common failure point is over-building. Three tiles up is usually enough before you should be pressuring. Players who over-extend without replacing walls create easy third-party opportunities. Practice controlled ramp rushes in Build Fight Simulator (4843-9999-0989).",
    "Your mechanics will never transfer to ranked games if you only practice in isolation. The Mongraal Classic map (6531-2735-0411) puts mechanics inside of real fight pressure — use it to close the gap between practice and games.",
  ],
  pieceControl: [
    "Piece control is the highest-skill form of fighting in Fortnite. The fundamentals: always have a ceiling, always have a floor, take walls from your opponent before they can use them. If you're in a box fight and not actively stealing his wall, you're giving him free real estate.\n\nBest starting map: ZTL Warmup Island (7562-1598-7425). Once comfortable, move to Clix Box Fight (7620-0771-9529).",
    "The biggest piece control mistake I see: resetting when you don't have to. If you have wall control, **stay in it**. The player who breaks the box and resets often loses their positional advantage. Learn when to push aggressively vs when to hold.",
    "Advanced piece control: learn to recognize when your opponent is about to reset. The tell is usually a cone placement or a quick build-then-break. If you see it coming, deny their exit route by placing a floor or cone before they can escape. Pro Box Fight Practice (6069-9263-9232) has scenarios specifically for this.",
  ],
  building: [
    "Building speed is the foundation everything else sits on. If your builds aren't instant, every other mechanic is slower — your edits cost more time, your retakes are delayed, your fights are less clean. Aim for zero hesitation on wall, ramp, floor, and cone.\n\nStart with Ultimate Build Course (4327-4965-7083) for the fundamentals.",
    "Height control is the most impactful building skill in ranked. The rule is simple: never fight someone who has pure height advantage in an open field. Either retake with the pyramid method or disengage, farm mats, and find another fight.\n\nHigh Ground Simulator (3580-6102-7795) has dedicated retake and height denial drills.",
    "Wall replacement is the skill that separates good builders from elite builders. If you can't replace walls under pressure, your box will be breached in every fight. Practice the muscle memory: build wall → opponent breaks → immediate replacement. Clix 1v1 map (8022-6842-4915) applies this in real fight scenarios.",
  ],
  fighting: [
    "Fight IQ is built by replaying your losses, not your wins. After every session, watch the replay of the fight that killed you and ask: (1) did I have enough mats? (2) did I take unnecessary exposure? (3) what was my opponent doing that I didn't predict?\n\nFor live practice: PK Unranked Duos (1793-3273-3517) gives the most realistic 1v1 feel.",
    "Third-partying efficiently is one of the highest-value ranked skills and the most misused. Only third-party when: you have more mats than both parties combined, the surviving player is below 100 HP, and you have a clear escape route. Otherwise you're gambling, not strategizing.",
    "Close-range fighting fundamentals: always be moving, use edits to create angles (not just to escape), and never take a straight gunfight when you can take an angled one. Elim Deathmatch (3691-8387-8927) gives you high-volume reps to build this instinct.",
  ],
  ranked: [
    "Ranked is won in the **mid-game transition** — the phase from 30 players down to 10. Your rotation decisions here determine whether you arrive at final circle with mats and position or scrambling. Focus one session per week purely on this zone: don't fight, just practice rotations and mat management.",
    "Stop counting kills. In ranked above Bronze/Silver, your goal is position and mats heading into the final circle. A player with 0 kills and 800 mats in zone is far more dangerous than someone with 5 kills and 200 mats out of zone. Reframe your metric.\n\nZone Wars (5276-4236-5465) for rotation practice.",
    "Height control in ranked is non-negotiable above Diamond. If someone has clean height on you in an open field, the correct play is: disengage or reset. The only time you fight upward is when forced. Learn the pyramid retake for reclaiming height efficiently.",
    "Final circle decision-making: build a box, get a floor under you, assess. Who's alive, where's zone, how many mats do I have? The players who win Unreal consistently make decisions in 2 seconds that other players need 10 seconds for. Zone Wars ranked maps (9145-8783-3737) build this speed.",
  ],
  settings: [
    "Sensitivity: there's no universal right answer, but the principle is to find the lowest sensitivity you can still make fast edits and aim on moving targets. Too high and you overcorrect; too low and you're slow on close-range edits. Start at your current setting, drop 10%, play 5 sessions, evaluate.\n\nFor controller: most top players use 40–50% look sensitivity with deadzone as low as your controller allows without drift.",
    "Resolution and graphics settings: for competitive play, prioritize frame rate above everything. Lower your resolution scale if needed. In settings, turn off shadows, set view distance to near/medium, and disable post-processing. Every frame you gain is a frame your eyes get to process an opponent's movement.",
    "Keybinds for PC: the most important keybind is your reset edit key. It should be on a finger you can reach without lifting your build hand. Most high-level players use middle mouse or a dedicated thumb key. Experiment with one change at a time so you can evaluate the impact.",
  ],
  fps: [
    "FPS drops and stuttering in Fortnite usually come from one of three sources: background CPU load, rendering settings inside the game, or thermal throttling on your hardware.\n\nTroubleshooting order:\n1. Close Discord, Chrome, streaming software while playing\n2. In Fortnite settings, set rendering mode to DirectX 11 (more stable than DX12 for most setups)\n3. Lower 3D resolution to 80–90% — biggest FPS gain with least visual impact\n4. Disable shadows and post-processing\n5. If you're on a laptop, make sure it's plugged in and not throttling\n\nIf you want deeper system-level optimization — power plan, CPU park settings, unnecessary services — YoJaz Tweaker is designed exactly for that and can make a meaningful difference for Fortnite.",
    "Input delay is a different problem from FPS. You can have 200fps but still feel delayed if your polling rate is low or your monitor response time is slow. Check: is your mouse running at 1000Hz polling rate? Is your monitor in game mode? Is your display set to your native refresh rate?\n\nFor system-level delay reduction — disabling Windows game mode conflicts, USB suspend, and background tasks — YoJaz Tweaker handles these automatically if you want a one-step solution.",
    "If you're on a lower-end PC and struggling to hit consistent frames: the biggest gains come from (1) lowering 3D resolution inside Fortnite to 75%, (2) setting texture quality to low, (3) disabling ray tracing and DLSS quality modes in favor of DLSS Performance or native low settings. This alone can double your frames on most mid-range hardware.",
    "Stuttering specifically (frames dropping momentarily then recovering) is almost always a RAM or CPU bottleneck under load. Check if you're running dual-channel RAM — single channel cuts memory bandwidth in half. If you have 2 sticks, make sure they're in the right slots (usually A2 + B2 on most motherboards, not A1 + B1).",
  ],
  warmup: [
    "A proper warm-up for Fortnite takes 15–20 minutes minimum before ranked play. The sequence I recommend:\n\n1. **5 min** — Skaavok Aim Trainer (4080-0122-5935), easy difficulty. Just wake your hands up, don't grind.\n2. **5 min** — Edit course at 70% speed. Perfect resets, don't rush.\n3. **5–10 min** — ZTL Warmup Island (7562-1598-7425) for box fights and piece control feel.\n\nThen go ranked. This primes your mechanical responses without fatiguing your hands before the real session.",
    "For shorter warm-ups (under 10 minutes): prioritize the edit course over aim training. Editing is a finer motor skill and takes longer to 'wake up' than aiming. 5 minutes of clean edit resets is worth more than 5 minutes of aim training when time is short.",
    "One thing most players get wrong: warming up too intensely. The warm-up goal is **activation**, not improvement. You should finish your warm-up feeling loose and ready — not tired. If you're grinding aim trainer scenarios to your max before ranked, you're burning energy you need for actual games.",
  ],
  improvement: [
    "The fastest improvement path is always: identify your single biggest loss condition → isolate it in practice → drill it until it's not the main reason you lose → repeat. Most players try to improve everything at once and improve nothing quickly.",
    "Plateaus happen because your practice isn't challenging you. If you're running the same edit course at the same speed and it feels comfortable, it's not building your skill anymore — it's just maintaining it. Every week, increase the difficulty: faster pace, harder scenarios, better opponents.",
    "Tracking your improvement matters. Keep a simple note after every session: what did I focus on, what worked, what still needs work. Players who self-review improve significantly faster than those who just play and hope. Even three sentences is enough.",
  ],
}

// ─── Intent detection ─────────────────────────────────────────────────────────
const INTENTS = [
  { key: 'fps',          tokens: ['fps', 'frame', 'lag', 'stutter', 'delay', 'input', 'performance', 'optimization', 'optimize', 'tweak', 'ping', 'smooth', 'drop', 'throttle', 'overclock', 'ram', 'cpu', 'gpu'] },
  { key: 'settings',     tokens: ['sensitivity', 'sens', 'dpi', 'resolution', 'keybind', 'settings', 'config', 'controller', 'mouse', 'bind', 'polling'] },
  { key: 'pieceControl', tokens: ['piece control', 'box fight', 'box fighting', '1v1', 'steal wall', 'ceiling', 'wall control'] },
  { key: 'building',     tokens: ['build', '90s', 'ramp rush', 'wall replace', 'height', 'retake', 'high ground', 'cone'] },
  { key: 'mechanics',    tokens: ['mechanic', 'triple', 'pyramid', 'tunnel', 'ramp', 'cone edit'] },
  { key: 'editing',      tokens: ['edit', 'reset', 'edit course', 'editing', 'fast edit'] },
  { key: 'aim',          tokens: ['aim', 'shot', 'miss', 'tracking', 'flick', 'crosshair', 'accuracy'] },
  { key: 'fighting',     tokens: ['fight', 'combat', 'third party', 'kill', 'engagement', 'push', 'aggr'] },
  { key: 'ranked',       tokens: ['rank', 'ranked', 'unreal', 'diamond', 'champion', 'champ', 'placement', 'storm', 'zone', 'rotate', 'placement'] },
  { key: 'warmup',       tokens: ['warm up', 'warmup', 'warm-up', 'before ranked', 'routine', 'how long should i', 'pregame'] },
  { key: 'improvement',  tokens: ['improve', 'better', 'plateau', 'get good', 'how do i get', 'tips', 'progress', 'grind'] },
]

function detectIntent(message, history) {
  const lower = message.toLowerCase()

  // Multi-word tokens first
  for (const { key, tokens } of INTENTS) {
    for (const t of tokens) {
      if (t.includes(' ') && lower.includes(t)) return key
    }
  }

  // Single-word tokens
  for (const { key, tokens } of INTENTS) {
    for (const t of tokens) {
      if (!t.includes(' ') && lower.includes(t)) return key
    }
  }

  // Context fallback: if the last coach message was about a topic, stay on it
  if (history.length >= 2) {
    const lastCoach = [...history].reverse().find(m => m.role === 'coach')
    if (lastCoach?.topic) return lastCoach.topic
  }

  return 'improvement'
}

function getResponse(intent, history) {
  const pool = KB[intent] || KB.improvement
  // Avoid repeating the same response if possible
  const usedIndexes = history
    .filter(m => m.role === 'coach' && m.topic === intent)
    .map(m => m.responseIndex)
  const available = pool.map((_, i) => i).filter(i => !usedIndexes.includes(i))
  const idx = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : Math.floor(Math.random() * pool.length)
  return { text: pool[idx], index: idx }
}

// Render message text with basic **bold** markdown
function MessageText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
          : part.split('\n').map((line, j, arr) => (
              <span key={`${i}-${j}`}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))
      )}
    </span>
  )
}

// ─── Starter prompts ──────────────────────────────────────────────────────────
const STARTERS = [
  "How do I improve my aim consistency?",
  "My FPS keeps dropping in ranked — how do I fix it?",
  "How do I get faster edits under pressure?",
  "What's the best warm-up for 2 hours a day?",
  "How do I rank up from Diamond to Champs?",
  "What mechanics should I focus on first?",
]

const INITIAL_MSG = {
  id: 1,
  role: 'coach',
  text: "What's up — I'm your YoJaz Elite AI Coach. Ask me anything: aim, edits, mechanics, ranked, settings, FPS issues, build fights, piece control, warm-ups — whatever you're working on. What do you want to improve?",
  topic: null,
  responseIndex: -1,
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CoachPage() {
  const { addXP } = useAuth()
  const [messages, setMessages] = useState([INITIAL_MSG])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [xpAwarded, setXpAwarded] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || thinking) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', text: msg, topic: null, responseIndex: -1 }
    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    setThinking(true)

    // Simulate response time
    await new Promise(r => setTimeout(r, 900 + Math.random() * 700))

    const intent = detectIntent(msg, updatedHistory)
    const { text: responseText, index } = getResponse(intent, updatedHistory)

    setMessages(prev => [
      ...prev,
      { id: Date.now() + 1, role: 'coach', text: responseText, topic: intent, responseIndex: index },
    ])
    setThinking(false)

    if (!xpAwarded) {
      addXP(150)
      setXpAwarded(true)
      toast.success('+150 XP — first coaching session!', { icon: '🤖' })
    }
  }

  const reset = () => {
    setMessages([INITIAL_MSG])
    setXpAwarded(false)
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white">AI Coach</h1>
          <p className="text-slate-400 text-sm">Ask about aim, mechanics, ranked, settings, FPS, building, and more.</p>
        </div>
        <button
          onClick={reset}
          className="btn-secondary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
        >
          <RotateCcw size={12} />
          New Chat
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 self-start mt-0.5 ${
              msg.role === 'coach'
                ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/30'
                : 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30'
            }`}>
              {msg.role === 'coach'
                ? <Bot size={16} className="text-cyan-400" />
                : <User size={16} className="text-purple-400" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'coach'
                ? 'bg-[#0d1526] border border-cyan-500/10 text-slate-200 rounded-tl-sm'
                : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 text-white rounded-tr-sm'
            }`}>
              <MessageText text={msg.text} />
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {thinking && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/30 flex items-center justify-center">
              <Bot size={16} className="text-cyan-400" />
            </div>
            <div className="bg-[#0d1526] border border-cyan-500/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  className="w-2 h-2 rounded-full bg-cyan-400"
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter suggestions — only show at start */}
      {messages.length === 1 && !thinking && (
        <div className="flex flex-wrap gap-2 mb-3">
          {STARTERS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs text-slate-400 hover:text-cyan-400 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 px-3 py-1.5 rounded-lg transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask your coach anything..."
          className="input-dark flex-1 rounded-xl px-4 py-3 text-sm"
          disabled={thinking}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || thinking}
          className="btn-primary px-4 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
