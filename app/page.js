'use client'
import { useState, useEffect } from 'react'

// Character system with full protocols
const characters = {
  nova: {
    id: 'nova',
    displayName: 'Nova',
    tagline: 'Momentum Coach',
    emoji: '⚡',
    color: '#f59e0b',
    greeting: "Let's build some momentum. What happened?"
  },
  sol: {
    id: 'sol',
    displayName: 'Sol',
    tagline: 'Compassionate Listener',
    emoji: '🌅',
    color: '#8b5cf6',
    greeting: "I'm here to listen. What's weighing on your heart?"
  },
  atlas: {
    id: 'atlas',
    displayName: 'Atlas',
    tagline: 'Values Guide',
    emoji: '🏔️',
    color: '#059669',
    greeting: "Let's connect with what matters most to you."
  },
  wren: {
    id: 'wren',
    displayName: 'Wren',
    tagline: 'Evening Companion',
    emoji: '🌙',
    color: '#6366f1',
    greeting: "The day is winding down. Let's release what you're carrying."
  },
  sage: {
    id: 'sage',
    displayName: 'Sage',
    tagline: 'Pattern Spotter',
    emoji: '📊',
    color: '#a855f7',
    greeting: "I've noticed some patterns we could explore."
  }
}

// Protocol steps
const protocols = {
  cbt_thought_record: {
    name: 'Thought Record',
    duration: '2-3 min',
    steps: [
      { prompt: "What happened? (1-2 sentences)", type: 'text', key: 'situation' },
      { prompt: "What was the loudest thought?", type: 'text', key: 'thought' },
      { 
        prompt: "Which distortion fits best?", 
        type: 'chips', 
        key: 'distortion',
        options: ['All-or-nothing', 'Catastrophizing', 'Mind-reading', 'Should statements', 'Labeling']
      },
      { prompt: "Evidence for this thought? Evidence against?", type: 'text', key: 'evidence' },
      { prompt: "What's a more balanced thought?", type: 'text', key: 'balanced' },
      { prompt: "Pick one 5-minute action to support that new thought", type: 'text', key: 'action' }
    ]
  },
  reflective_listening: {
    name: 'Deep Listening',
    duration: '2-3 min',
    steps: [
      { prompt: "What's weighing on your heart right now?", type: 'text', key: 'feeling' },
      { prompt: "What felt heaviest in that moment?", type: 'text', key: 'heavy' },
      { 
        prompt: "Do you need comfort or clarity right now?", 
        type: 'choice', 
        key: 'need',
        options: ['Comfort', 'Clarity']
      }
    ]
  },
  values_check: {
    name: 'Values Alignment',
    duration: '2 min',
    steps: [
      { 
        prompt: "Which value feels most relevant here?", 
        type: 'chips', 
        key: 'value',
        options: ['Courage', 'Honesty', 'Learning', 'Kindness', 'Health', 'Growth']
      },
      { prompt: "One action aligned with this value you can do today?", type: 'text', key: 'action' }
    ]
  },
  grounding_54321: {
    name: '5-4-3-2-1 Grounding',
    duration: '3 min',
    steps: [
      { prompt: "5 things you can see right now", type: 'text', key: 'see' },
      { prompt: "4 things you can touch", type: 'text', key: 'touch' },
      { prompt: "3 things you can hear", type: 'text', key: 'hear' },
      { prompt: "2 things you can smell", type: 'text', key: 'smell' },
      { prompt: "1 thing you can taste", type: 'text', key: 'taste' }
    ]
  },
  worry_box: {
    name: 'Worry Box',
    duration: '2 min',
    steps: [
      { prompt: "What worries can we set aside for tomorrow?", type: 'text', key: 'worries' },
      { prompt: "Imagine placing each worry in a box. What goes in first?", type: 'text', key: 'first' },
      { prompt: "The box is sealed until tomorrow. How does that feel?", type: 'text', key: 'feeling' }
    ]
  },
  gratitude_practice: {
    name: 'Gratitude Practice',
    duration: '2 min',
    steps: [
      { prompt: "Three specific things you appreciated today", type: 'text', key: 'gratitude' },
      { prompt: "How did these make you feel?", type: 'text', key: 'feeling' }
    ]
  }
}

// Mood-based routing
function routeToGuide(mood, emotions, hour = new Date().getHours()) {
  const isEvening = hour >= 20 || hour <= 6
  
  // Crisis detection
  if (emotions.includes('hopeless') || mood <= 2) {
    return { character: 'atlas', protocol: 'values_check', priority: 'high' }
  }
  
  // Evening + anxious → Wren
  if (isEvening && emotions.some(e => ['anxious', 'overwhelmed', 'stressed'].includes(e))) {
    return { character: 'wren', protocol: 'grounding_54321' }
  }
  
  // Sad/lonely → Sol
  if (emotions.some(e => ['sad', 'lonely', 'hurt', 'grief'].includes(e))) {
    return { character: 'sol', protocol: 'reflective_listening' }
  }
  
  // Angry/frustrated → Nova
  if (emotions.some(e => ['angry', 'frustrated', 'irritated'].includes(e))) {
    return { character: 'nova', protocol: 'cbt_thought_record' }
  }
  
  // Low mood → Atlas
  if (mood <= 3) {
    return { character: 'atlas', protocol: 'values_check' }
  }
  
  // Positive/neutral → Sage
  if (mood >= 7) {
    return { character: 'sage', protocol: 'gratitude_practice' }
  }
  
  // Default
  return { character: 'sol', protocol: 'reflective_listening' }
}

export default function Home() {
  // Core states
  const [stage, setStage] = useState('welcome') // welcome, protocol, complete
  const [mood, setMood] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState([])
  const [activeGuide, setActiveGuide] = useState(null)
  const [activeProtocol, setActiveProtocol] = useState(null)
  const [protocolStep, setProtocolStep] = useState(0)
  const [protocolResponses, setProtocolResponses] = useState({})
  const [currentResponse, setCurrentResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [entries, setEntries] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [showCrisisResources, setShowCrisisResources] = useState(false)

  const emotionOptions = [
    'anxious', 'overwhelmed', 'stressed', 'worried',
    'sad', 'lonely', 'hurt', 'grief',
    'angry', 'frustrated', 'irritated', 'annoyed',
    'happy', 'grateful', 'content', 'peaceful',
    'confused', 'lost', 'stuck', 'numb',
    'hopeless', 'exhausted', 'disconnected'
  ]

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    const savedEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]')
    setDarkMode(savedDarkMode)
    setEntries(savedEntries)
  }, [])

  const startProtocol = () => {
    if (selectedEmotions.length === 0) return
    
    // Check for crisis keywords
    if (selectedEmotions.includes('hopeless') || mood <= 2) {
      setShowCrisisResources(true)
    }
    
    const route = routeToGuide(mood, selectedEmotions)
    setActiveGuide(characters[route.character])
    setActiveProtocol(protocols[route.protocol])
    setProtocolStep(0)
    setProtocolResponses({})
    setStage('protocol')
  }

  const handleProtocolNext = async () => {
    const currentStep = activeProtocol.steps[protocolStep]
    const newResponses = { ...protocolResponses, [currentStep.key]: currentResponse }
    setProtocolResponses(newResponses)
    
    if (protocolStep < activeProtocol.steps.length - 1) {
      setProtocolStep(protocolStep + 1)
      setCurrentResponse('')
    } else {
      // Protocol complete - get AI response
      await completeProtocol(newResponses)
    }
  }

  const completeProtocol = async (responses) => {
    setIsLoading(true)
    
    const protocolSummary = Object.entries(responses)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: protocolSummary,
          characterId: activeGuide.id,
          protocol: activeProtocol.name,
          mood,
          emotions: selectedEmotions
        })
      })
      
      const data = await response.json()
      if (data.analysis) {
        setAnalysis(data.analysis)
        
        // Save entry
        const newEntry = {
          id: Date.now(),
          guide: activeGuide.displayName,
          protocol: activeProtocol.name,
          responses: responses,
          analysis: data.analysis,
          mood,
          emotions: selectedEmotions,
          timestamp: new Date().toLocaleString()
        }
        
        const updatedEntries = [newEntry, ...entries].slice(0, 100)
        setEntries(updatedEntries)
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries))
        
        setStage('complete')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setStage('welcome')
    setMood(5)
    setSelectedEmotions([])
    setActiveGuide(null)
    setActiveProtocol(null)
    setProtocolStep(0)
    setProtocolResponses({})
    setCurrentResponse('')
    setAnalysis('')
  }

  const styles = {
    main: {
      minHeight: '100vh',
      background: darkMode 
        ? 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
      transition: 'background 0.3s'
    },
    container: {
      maxWidth: '600px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: darkMode ? '#fff' : '#111',
      marginBottom: '0.5rem'
    },
    card: {
      background: darkMode ? '#1f1f1f' : 'white',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem'
    },
    moodSection: {
      marginBottom: '2rem'
    },
    moodLabel: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: darkMode ? '#fff' : '#111'
    },
    moodSlider: {
      width: '100%',
      marginBottom: '0.5rem'
    },
    moodValue: {
      textAlign: 'center',
      fontSize: '2rem',
      fontWeight: '700',
      color: mood <= 3 ? '#ef4444' : mood <= 6 ? '#f59e0b' : '#10b981',
      marginBottom: '1rem'
    },
    emotionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    emotionChip: (selected) => ({
      padding: '0.5rem 1rem',
      background: selected 
        ? (darkMode ? '#6366f1' : '#818cf8')
        : (darkMode ? '#2a2a2a' : '#f3f4f6'),
      color: selected ? 'white' : (darkMode ? '#ccc' : '#4b5563'),
      border: 'none',
      borderRadius: '2rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }),
    primaryButton: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '1.5rem'
    },
    guideCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      background: darkMode ? '#2a2a2a' : '#f9fafb',
      borderRadius: '0.75rem',
      marginBottom: '1.5rem'
    },
    guideEmoji: {
      fontSize: '2rem'
    },
    guideInfo: {
      flex: 1
    },
    guideName: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: darkMode ? '#fff' : '#111'
    },
    guideTagline: {
      fontSize: '0.875rem',
      color: darkMode ? '#9ca3af' : '#6b7280'
    },
    protocolStep: {
      marginBottom: '1.5rem'
    },
    stepProgress: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    stepDot: (active) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: active ? '#6366f1' : '#d1d5db'
    }),
    promptText: {
      fontSize: '1.125rem',
      fontWeight: '500',
      marginBottom: '1rem',
      color: darkMode ? '#fff' : '#111'
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '0.75rem',
      background: darkMode ? '#2a2a2a' : '#f9fafb',
      color: darkMode ? '#fff' : '#111',
      border: `1px solid ${darkMode ? '#404040' : '#e5e7eb'}`,
      borderRadius: '0.5rem',
      fontSize: '1rem',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    optionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '0.5rem'
    },
    optionButton: (selected) => ({
      padding: '0.75rem',
      background: selected ? '#6366f1' : (darkMode ? '#2a2a2a' : 'white'),
      color: selected ? 'white' : (darkMode ? '#fff' : '#111'),
      border: `1px solid ${darkMode ? '#404040' : '#e5e7eb'}`,
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }),
    analysisCard: {
      background: darkMode ? '#2a2a2a' : '#f9fafb',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      marginTop: '1.5rem'
    },
    analysisText: {
      lineHeight: '1.6',
      color: darkMode ? '#d1d5db' : '#374151'
    },
    crisisBanner: {
      background: '#fee2e2',
      border: '1px solid #fecaca',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1rem'
    },
    crisisText: {
      color: '#991b1b',
      fontWeight: '500',
      marginBottom: '0.5rem'
    },
    crisisLinks: {
      display: 'flex',
      gap: '1rem',
      fontSize: '0.875rem'
    },
    crisisLink: {
      color: '#1e40af',
      textDecoration: 'none'
    },
    disclaimer: {
      textAlign: 'center',
      fontSize: '0.75rem',
      color: darkMode ? '#6b7280' : '#9ca3af',
      marginTop: '2rem'
    }
  }

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
      
      <main style={styles.main}>
        <div style={styles.container}>
          <header style={styles.header}>
            <h1 style={styles.logo}>Mindbloss</h1>
            <button
              onClick={() => {
                setDarkMode(!darkMode)
                localStorage.setItem('darkMode', !darkMode)
              }}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                position: 'absolute',
                top: '2rem',
                right: '2rem'
              }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </header>

          {showCrisisResources && (
            <div style={styles.crisisBanner}>
              <p style={styles.crisisText}>
                You don't have to go through this alone. Help is available:
              </p>
              <div style={styles.crisisLinks}>
                <a href="tel:988" style={styles.crisisLink}>📞 Call 988</a>
                <a href="sms:741741" style={styles.crisisLink}>💬 Text HOME to 741741</a>
              </div>
            </div>
          )}

          {stage === 'welcome' && (
            <>
              <div style={styles.card}>
                <div style={styles.moodSection}>
                  <label style={styles.moodLabel}>
                    How are you feeling right now?
                  </label>
                  <div style={styles.moodValue}>{mood}/10</div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={mood}
                    onChange={(e) => setMood(Number(e.target.value))}
                    style={styles.moodSlider}
                  />
                </div>

                <label style={styles.moodLabel}>
                  Which emotions are strongest?
                </label>
                <div style={styles.emotionGrid}>
                  {emotionOptions.map(emotion => (
                    <button
                      key={emotion}
                      onClick={() => {
                        if (selectedEmotions.includes(emotion)) {
                          setSelectedEmotions(selectedEmotions.filter(e => e !== emotion))
                        } else {
                          setSelectedEmotions([...selectedEmotions, emotion])
                        }
                      }}
                      style={styles.emotionChip(selectedEmotions.includes(emotion))}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>

                <button
                  onClick={startProtocol}
                  style={styles.primaryButton}
                  disabled={selectedEmotions.length === 0}
                >
                  Start Guided Check-In (2-3 min)
                </button>
              </div>
            </>
          )}

          {stage === 'protocol' && activeGuide && activeProtocol && (
            <>
              <div style={styles.guideCard}>
                <span style={styles.guideEmoji}>{activeGuide.emoji}</span>
                <div style={styles.guideInfo}>
                  <div style={styles.guideName}>{activeGuide.displayName}</div>
                  <div style={styles.guideTagline}>
                    {activeProtocol.name} • {activeProtocol.duration}
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <div style={styles.stepProgress}>
                  {activeProtocol.steps.map((_, index) => (
                    <div
                      key={index}
                      style={styles.stepDot(index <= protocolStep)}
                    />
                  ))}
                </div>

                <div style={styles.protocolStep}>
                  <p style={styles.promptText}>
                    {activeProtocol.steps[protocolStep].prompt}
                  </p>
                  
                  {activeProtocol.steps[protocolStep].type === 'text' && (
                    <textarea
                      value={currentResponse}
                      onChange={(e) => setCurrentResponse(e.target.value)}
                      style={styles.textarea}
                      placeholder="Take your time..."
                      autoFocus
                    />
                  )}
                  
                  {activeProtocol.steps[protocolStep].type === 'chips' && (
                    <div style={styles.optionGrid}>
                      {activeProtocol.steps[protocolStep].options.map(option => (
                        <button
                          key={option}
                          onClick={() => setCurrentResponse(option)}
                          style={styles.optionButton(currentResponse === option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {activeProtocol.steps[protocolStep].type === 'choice' && (
                    <div style={styles.optionGrid}>
                      {activeProtocol.steps[protocolStep].options.map(option => (
                        <button
                          key={option}
                          onClick={() => setCurrentResponse(option)}
                          style={styles.optionButton(currentResponse === option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleProtocolNext}
                  style={styles.primaryButton}
                  disabled={!currentResponse || isLoading}
                >
                  {isLoading ? 'Processing...' : 
                   protocolStep < activeProtocol.steps.length - 1 ? 'Next' : 'Complete'}
                </button>
              </div>
            </>
          )}

          {stage === 'complete' && (
            <>
              <div style={styles.guideCard}>
                <span style={styles.guideEmoji}>{activeGuide.emoji}</span>
                <div style={styles.guideInfo}>
                  <div style={styles.guideName}>{activeGuide.displayName}</div>
                  <div style={styles.guideTagline}>Protocol complete</div>
                </div>
              </div>

              <div style={styles.card}>
                <h2 style={{marginBottom: '1rem', color: darkMode ? '#fff' : '#111'}}>
                  Your Reflection
                </h2>
                <div style={styles.analysisCard}>
                  <p style={styles.analysisText}>{analysis}</p>
                </div>
                
                <button onClick={reset} style={styles.primaryButton}>
                  Start New Check-In
                </button>
              </div>
            </>
          )}

          <p style={styles.disclaimer}>
            Not a substitute for professional therapy • Self-help tool only
          </p>
        </div>
      </main>
    </>
  )
}