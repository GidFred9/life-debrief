'use client'
import { useState, useEffect, useCallback } from 'react'

export default function Home() {
  const [entry, setEntry] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [aiMode, setAiMode] = useState('reflection')
  const [entries, setEntries] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showModeDropdown, setShowModeDropdown] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [moodValue, setMoodValue] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState([])
  const [savedIndicator, setSavedIndicator] = useState(false)

  // Templates for evidence-based approaches
  const templates = {
    cbt: {
      name: 'CBT Thought Record',
      prompt: 'Situation: \nAutomatic thought: \nEmotion (0-10): \nEvidence for: \nEvidence against: \nBalanced thought: ',
      icon: '🧠'
    },
    act: {
      name: 'ACT Values Check',
      prompt: 'What story is my mind telling me?\nWhat matters to me in this situation?\nOne small step aligned with my values: ',
      icon: '🎯'
    },
    gratitude: {
      name: 'Gratitude Practice',
      prompt: 'Three things I appreciated today:\n1. \n2. \n3. \nHow did these make me feel?',
      icon: '🙏'
    },
    grounding: {
      name: '5-4-3-2-1 Grounding',
      prompt: '5 things I can see:\n4 things I can touch:\n3 things I can hear:\n2 things I can smell:\n1 thing I can taste:',
      icon: '🌍'
    }
  }

  const emotions = [
    'anxious', 'calm', 'frustrated', 'hopeful', 'sad', 'content', 
    'angry', 'grateful', 'overwhelmed', 'focused', 'lonely', 'connected'
  ]

  useEffect(() => {
    // Load saved preferences
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    const savedEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]')
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true'
    
    setDarkMode(savedDarkMode)
    setEntries(savedEntries)
    setShowOnboarding(!hasSeenOnboarding)
  }, [])

  const saveEntry = (newEntry) => {
    const updatedEntries = [newEntry, ...entries].slice(0, 100) // Keep last 100
    setEntries(updatedEntries)
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries))
    setSavedIndicator(true)
    setTimeout(() => setSavedIndicator(false), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setShowAnalysis(false)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          entry: currentTemplate ? `${templates[currentTemplate].name}:\n${entry}` : entry,
          mode: aiMode,
          mood: moodValue,
          emotions: selectedEmotions
        }),
      })
      
      const data = await response.json()
      
      if (data.analysis) {
        setAnalysis(data.analysis)
        setShowAnalysis(true)
        
        const newEntry = {
          id: Date.now(),
          text: entry,
          response: data.analysis,
          mode: aiMode,
          template: currentTemplate,
          mood: moodValue,
          emotions: selectedEmotions,
          timestamp: new Date().toLocaleString()
        }
        saveEntry(newEntry)
        setEntry('')
        setCurrentTemplate(null)
        setSelectedEmotions([])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickReframe = async () => {
    if (!entry.trim()) return
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          entry: `Quick reframe needed: ${entry}`,
          mode: 'reframe'
        }),
      })
      
      const data = await response.json()
      if (data.analysis) {
        setAnalysis(data.analysis)
        setShowAnalysis(true)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `mindbloss-export-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const generateWeeklyRecap = async () => {
    if (entries.length === 0) return
    
    setIsLoading(true)
    const weekEntries = entries.slice(0, 20) // Last 20 entries
    const themes = weekEntries.map(e => `${e.timestamp}: ${e.text.substring(0, 100)}`).join('\n')
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          entry: `Weekly recap request. Analyze themes, patterns, wins, and suggest 3 actions:\n${themes}`,
          mode: 'summary'
        }),
      })
      
      const data = await response.json()
      if (data.analysis) {
        setAnalysis(data.analysis)
        setShowAnalysis(true)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getModeColor = (mode) => {
    switch(mode) {
      case 'reflection': return '#8b5cf6'
      case 'chat': return '#3b82f6'
      case 'resources': return '#10b981'
      default: return '#8b5cf6'
    }
  }

  const styles = {
    main: {
      minHeight: '100vh',
      background: darkMode 
        ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
        : 'linear-gradient(135deg, #fafaf9 0%, #f3f4f6 100%)',
      padding: '0',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background 0.3s'
    },
    container: {
      maxWidth: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    topNav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      background: darkMode ? '#1f1f1f' : 'white'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: darkMode ? '#f3f4f6' : '#111827',
      letterSpacing: '-0.025em'
    },
    modeSelector: {
      display: 'flex',
      gap: '0.5rem',
      padding: '0.25rem',
      background: darkMode ? '#374151' : '#f3f4f6',
      borderRadius: '0.5rem'
    },
    modeTab: (active) => ({
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      background: active ? (darkMode ? '#1f1f1f' : 'white') : 'transparent',
      color: active 
        ? getModeColor(aiMode)
        : (darkMode ? '#9ca3af' : '#6b7280'),
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: active ? '600' : '500',
      transition: 'all 0.2s',
      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
    }),
    mainContent: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden'
    },
    centerColumn: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem',
      gap: '1.5rem',
      maxWidth: '900px',
      margin: '0 auto',
      width: '100%'
    },
    heroSection: {
      textAlign: 'center',
      marginBottom: '1.5rem',
      opacity: showOnboarding ? 1 : 0,
      transition: 'opacity 0.5s',
      display: showOnboarding ? 'block' : 'none'
    },
    heroTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: darkMode ? '#f3f4f6' : '#111827',
      marginBottom: '0.5rem',
      lineHeight: '1.2'
    },
    heroSubtitle: {
      fontSize: '1.125rem',
      color: darkMode ? '#9ca3af' : '#6b7280',
      marginBottom: '1.5rem'
    },
    templateGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '0.75rem',
      marginBottom: '1.5rem'
    },
    templateCard: (active) => ({
      padding: '0.875rem',
      background: active 
        ? getModeColor(aiMode) 
        : (darkMode ? '#374151' : 'white'),
      color: active ? 'white' : (darkMode ? '#d1d5db' : '#4b5563'),
      border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '0.875rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: active ? '0 4px 12px rgba(139, 92, 246, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)'
    }),
    journalCard: {
      background: darkMode ? '#262626' : 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
    },
    moodSection: {
      marginBottom: '1rem',
      padding: '1rem',
      background: darkMode ? '#1f1f1f' : '#f9fafb',
      borderRadius: '0.5rem'
    },
    moodSlider: {
      width: '100%',
      marginTop: '0.5rem'
    },
    emotionChips: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    emotionChip: (selected) => ({
      padding: '0.375rem 0.75rem',
      background: selected 
        ? getModeColor(aiMode)
        : (darkMode ? '#374151' : '#f3f4f6'),
      color: selected ? 'white' : (darkMode ? '#d1d5db' : '#6b7280'),
      borderRadius: '9999px',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none'
    }),
    textarea: {
      width: '100%',
      minHeight: '300px',
      padding: '1rem',
      backgroundColor: darkMode ? '#1f1f1f' : '#fafaf9',
      color: darkMode ? '#f3f4f6' : '#111827',
      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      borderRadius: '0.5rem',
      fontSize: '1rem',
      lineHeight: '1.75',
      resize: 'vertical',
      outline: 'none',
      transition: 'border-color 0.2s',
      fontFamily: 'inherit'
    },
    buttonRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1rem',
      gap: '1rem'
    },
    primaryButton: {
      padding: '0.75rem 2rem',
      background: getModeColor(aiMode),
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: isLoading || !entry.trim() ? 'not-allowed' : 'pointer',
      opacity: isLoading || !entry.trim() ? 0.5 : 1,
      transition: 'all 0.2s',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    secondaryButton: {
      padding: '0.75rem 1.5rem',
      background: 'transparent',
      color: getModeColor(aiMode),
      border: `2px solid ${getModeColor(aiMode)}`,
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    responseCard: {
      background: darkMode ? '#262626' : 'white',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      minHeight: '200px',
      maxHeight: '500px',
      overflowY: 'auto',
      border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
    },
    responseTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: getModeColor(aiMode),
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    responseText: {
      color: darkMode ? '#d1d5db' : '#374151',
      lineHeight: '1.75',
      fontSize: '1rem',
      whiteSpace: 'pre-wrap'
    },
    sidebar: {
      width: sidebarOpen ? '320px' : '0',
      background: darkMode ? '#1f1f1f' : '#fafaf9',
      borderLeft: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      padding: sidebarOpen ? '1.5rem' : '0',
      overflowY: 'auto',
      transition: 'all 0.3s',
      position: 'relative'
    },
    sidebarToggle: {
      position: 'absolute',
      left: '-40px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '40px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      background: darkMode ? '#262626' : 'white',
      borderRadius: '0.5rem 0 0 0.5rem',
      border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      borderRight: 'none',
      transition: 'all 0.2s'
    },
    entryCard: {
      padding: '0.75rem',
      background: darkMode ? '#374151' : 'white',
      borderRadius: '0.5rem',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      color: darkMode ? '#d1d5db' : '#4b5563',
      borderLeft: `3px solid ${getModeColor(aiMode)}`,
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    disclaimer: {
      padding: '0.75rem',
      textAlign: 'center',
      borderTop: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      background: darkMode ? 'rgba(31,31,31,0.8)' : 'rgba(255,255,255,0.8)',
      fontSize: '0.75rem',
      color: darkMode ? '#9ca3af' : '#6b7280',
      lineHeight: '1.5'
    },
    wordCount: {
      fontSize: '0.875rem',
      color: darkMode ? '#9ca3af' : '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    savedIndicator: {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      padding: '0.75rem 1.5rem',
      background: '#10b981',
      color: 'white',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      opacity: savedIndicator ? 1 : 0,
      transition: 'opacity 0.3s',
      pointerEvents: 'none',
      zIndex: 1000
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem'
    },
    iconButton: {
      padding: '0.5rem',
      background: 'transparent',
      color: darkMode ? '#9ca3af' : '#6b7280',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.25rem',
      transition: 'all 0.2s',
      borderRadius: '0.375rem'
    }
  }

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow: hidden; }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .journal-textarea:focus {
          border-color: ${getModeColor(aiMode)} !important;
          box-shadow: 0 0 0 3px ${getModeColor(aiMode)}22 !important;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${darkMode ? '#374151' : '#f3f4f6'};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4b5563' : '#d1d5db'};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6b7280' : '#9ca3af'};
        }
      `}</style>
      
      <main style={styles.main}>
        <div style={styles.container}>
          {/* Top Navigation */}
          <nav style={styles.topNav}>
            <h1 style={styles.logo}>Mindbloss</h1>
            
            <div style={styles.modeSelector}>
              <button
                style={styles.modeTab(aiMode === 'reflection')}
                onClick={() => setAiMode('reflection')}
              >
                Reflection
              </button>
              <button
                style={styles.modeTab(aiMode === 'chat')}
                onClick={() => setAiMode('chat')}
              >
                Chat
              </button>
              <button
                style={styles.modeTab(aiMode === 'resources')}
                onClick={() => setAiMode('resources')}
              >
                Resources
              </button>
            </div>
            
            <div style={styles.actionButtons}>
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                style={styles.iconButton}
                title="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button 
                onClick={exportData} 
                style={styles.iconButton}
                title="Export data"
              >
                💾
              </button>
            </div>
          </nav>
          
          <div style={styles.mainContent}>
            {/* Center Column */}
            <div style={styles.centerColumn}>
              {/* Hero Section - Only shows first time */}
              {showOnboarding && (
                <div style={styles.heroSection}>
                  <h2 style={styles.heroTitle}>
                    Turn tangled thoughts into calm next steps
                  </h2>
                  <p style={styles.heroSubtitle}>
                    Evidence-based journaling that actually helps
                  </p>
                  <button
                    onClick={() => {
                      setShowOnboarding(false)
                      localStorage.setItem('hasSeenOnboarding', 'true')
                    }}
                    style={{...styles.primaryButton, margin: '0 auto'}}
                  >
                    Start Your First Entry
                  </button>
                </div>
              )}
              
              {/* Template Selection */}
              {!showOnboarding && (
                <div style={styles.templateGrid}>
                  {Object.entries(templates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setCurrentTemplate(key)
                        setEntry(template.prompt)
                      }}
                      style={styles.templateCard(currentTemplate === key)}
                      className="hover-lift"
                    >
                      <span>{template.icon}</span>
                      <span>{template.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Journal Card */}
              <div style={styles.journalCard}>
                {/* Mood Tracker */}
                <div style={styles.moodSection}>
                  <label style={{fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#4b5563'}}>
                    Current mood: {moodValue}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodValue}
                    onChange={(e) => setMoodValue(e.target.value)}
                    style={styles.moodSlider}
                  />
                  
                  <div style={{marginTop: '1rem'}}>
                    <label style={{fontSize: '0.875rem', fontWeight: '600', color: darkMode ? '#d1d5db' : '#4b5563'}}>
                      Feeling:
                    </label>
                    <div style={styles.emotionChips}>
                      {emotions.map(emotion => (
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
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    style={styles.textarea}
                    className="journal-textarea"
                    placeholder={
                      aiMode === 'reflection' 
                        ? "What happened? How did it make you feel? What do you need?"
                        : aiMode === 'chat'
                        ? "What's on your mind?"
                        : "What challenge can I help with?"
                    }
                    required
                  />
                  
                  <div style={styles.buttonRow}>
                    <span style={styles.wordCount}>
                      {savedIndicator && '✓ Saved'} {entry.length} characters
                    </span>
                    <div style={{display: 'flex', gap: '0.75rem'}}>
                      <button
                        type="button"
                        onClick={handleQuickReframe}
                        style={styles.secondaryButton}
                        disabled={!entry.trim()}
                      >
                        Quick Reframe
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !entry.trim()}
                        style={styles.primaryButton}
                      >
                        {isLoading ? 'Processing...' : 'Reflect with me'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Response */}
              {showAnalysis && (
                <div style={styles.responseCard}>
                  <h3 style={styles.responseTitle}>
                    <span style={{animation: 'pulse 2s infinite'}}>✨</span>
                    {aiMode === 'reflection' ? 'Your Reflection' : 'Response'}
                  </h3>
                  <div style={styles.responseText}>{analysis}</div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div style={styles.sidebar}>
              <div style={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? '→' : '←'}
              </div>
              
              {sidebarOpen && (
                <>
                  <button
                    onClick={generateWeeklyRecap}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      marginBottom: '1.5rem',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: entries.length === 0 ? 'not-allowed' : 'pointer',
                      opacity: entries.length === 0 ? 0.5 : 1
                    }}
                    disabled={entries.length === 0}
                  >
                    📊 Weekly Recap
                  </button>
                  
                  <h3 style={{fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: darkMode ? '#d1d5db' : '#4b5563'}}>
                    Recent Entries
                  </h3>
                  
                  {entries.length > 0 ? (
                    entries.slice(0, 10).map((entry) => (
                      <div key={entry.id} style={styles.entryCard} className="hover-lift">
                        <div style={{fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem'}}>
                          {entry.timestamp} • Mood: {entry.mood}/10
                        </div>
                        <div>{entry.text.substring(0, 80)}...</div>
                        {entry.emotions.length > 0 && (
                          <div style={{fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7}}>
                            {entry.emotions.join(', ')}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{textAlign: 'center', opacity: 0.5, fontSize: '0.875rem'}}>
                      Your entries will appear here
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div style={styles.disclaimer}>
            Not a substitute for professional therapy • 
            Crisis support: <a href="tel:988" style={{color: '#8b5cf6'}}> 988</a> (US) | 
            <a href="https://www.crisistextline.org" style={{color: '#8b5cf6'}}> Text HOME to 741741</a>
          </div>
        </div>
        
        <div style={styles.savedIndicator}>
          ✓ Entry saved
        </div>
      </main>
    </>
  )
}