'use client'
import { useState } from 'react'

export default function Home() {
  const [entry, setEntry] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [aiMode, setAiMode] = useState('reflection')
  const [entries, setEntries] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showModeDropdown, setShowModeDropdown] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setShowAnalysis(false)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          entry,
          mode: aiMode
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
          timestamp: new Date().toLocaleString()
        }
        setEntries([newEntry, ...entries])
        setEntry('')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to analyze. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateWeeklyRecap = async () => {
    if (entries.length === 0) {
      alert('No entries to summarize yet. Start journaling first!')
      return
    }
    
    setIsLoading(true)
    try {
      const allEntries = entries.map(e => `${e.timestamp}: ${e.text}`).join('\n\n')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          entry: `Create a weekly recap with: key themes, emotional patterns, wins, helpful reframes, and 3 specific action steps based on these entries:\n\n${allEntries}`,
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
      case 'reflection': return '#9f7aea'
      case 'chat': return '#4299e1'
      case 'resources': return '#48bb78'
      default: return '#9f7aea'
    }
  }

  const styles = {
    main: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    },
    container: {
      maxWidth: '100%',
      margin: '0 auto',
      display: 'flex',
      height: '100vh',
      position: 'relative',
      zIndex: 1,
      flexDirection: 'column'
    },
    mainContent: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden'
    },
    journalSection: {
      flex: sidebarOpen ? '0 0 75%' : '1',
      padding: '2rem 3rem',
      paddingRight: sidebarOpen ? '3rem' : '4rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    header: {
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    logo: {
      fontSize: '2.5rem',
      fontWeight: '600',
      letterSpacing: '-1px',
      color: '#1a202c',
      marginBottom: '0.5rem'
    },
    tagline: {
      fontSize: '1.25rem',
      color: '#2d3748',
      marginBottom: '0.25rem',
      fontWeight: '400'
    },
    subtagline: {
      fontSize: '0.9rem',
      color: '#718096'
    },
    journalCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.75rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #e2e8f0'
    },
    modeIndicator: {
      fontSize: '0.85rem',
      color: '#4a5568',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '8px',
      transition: 'background 0.2s',
      position: 'relative',
      width: 'fit-content',
      fontWeight: '500'
    },
    modeDropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '0.5rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      zIndex: 100,
      minWidth: '200px',
      marginTop: '0.5rem'
    },
    dropdownItem: {
      padding: '0.75rem',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#4a5568'
    },
    modeDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: getModeColor(aiMode),
      animation: 'pulse 2s infinite'
    },
    textarea: {
      width: '100%',
      minHeight: '350px',
      flex: 1,
      padding: '1.25rem',
      backgroundColor: '#fafaf9',
      color: '#2d3748',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      lineHeight: '1.7',
      resize: 'none',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      outline: 'none',
      transition: 'border-color 0.3s'
    },
    submitSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1rem'
    },
    button: {
      padding: '0.875rem 2rem',
      background: getModeColor(aiMode),
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: isLoading || !entry.trim() ? 'not-allowed' : 'pointer',
      opacity: isLoading || !entry.trim() ? 0.6 : 1,
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    responseCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.75rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
      maxHeight: '400px',
      overflowY: 'auto',
      border: '1px solid #e2e8f0'
    },
    responseTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: getModeColor(aiMode),
      marginBottom: '1rem'
    },
    responseText: {
      color: '#4a5568',
      lineHeight: '1.7',
      fontSize: '0.95rem',
      whiteSpace: 'pre-wrap'
    },
    sidebar: {
      flex: sidebarOpen ? '0 0 25%' : '0',
      width: sidebarOpen ? 'auto' : '0',
      backgroundColor: '#f8f6f3',
      borderLeft: sidebarOpen ? '1px solid #e2e8f0' : 'none',
      padding: sidebarOpen ? '2rem' : '0',
      overflowY: 'auto',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    sidebarToggleArea: {
      position: 'absolute',
      left: sidebarOpen ? '-20px' : '0',
      top: 0,
      bottom: 0,
      width: '20px',
      cursor: 'col-resize',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      zIndex: 20
    },
    toggleLine: {
      width: '2px',
      height: '100%',
      background: '#e2e8f0',
      transition: 'all 0.2s'
    },
    toggleButton: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      opacity: 0,
      transition: 'opacity 0.2s'
    },
    disclaimer: {
      padding: '1.5rem',
      textAlign: 'center',
      borderTop: '1px solid #e2e8f0',
      background: 'rgba(255,255,255,0.8)',
      fontSize: '0.85rem',
      color: '#718096',
      lineHeight: '1.6'
    },
    wordCount: {
      fontSize: '0.85rem',
      color: '#a0aec0'
    }
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          overflow: hidden;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .journal-textarea:focus {
          border-color: ${getModeColor(aiMode)};
          box-shadow: 0 0 0 3px ${getModeColor(aiMode)}22;
        }
        
        .toggle-area:hover .toggle-line {
          width: 4px !important;
          background: #cbd5e0 !important;
        }
        
        .toggle-area:hover .toggle-button {
          opacity: 1 !important;
        }
        
        .mode-indicator:hover {
          background: rgba(0,0,0,0.03);
        }
        
        .dropdown-item:hover {
          background: rgba(0,0,0,0.05);
        }
      `}</style>
      
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.mainContent}>
            {/* Main Journal Area */}
            <div style={styles.journalSection}>
              <div style={styles.header}>
                <h1 style={styles.logo}>Mindbloss</h1>
                <p style={styles.tagline}>Turn tangled thoughts into calm next steps — in 3 minutes</p>
                <p style={styles.subtagline}>Private, AI-guided journaling with evidence-based prompts</p>
              </div>
              
              <div style={styles.journalCard}>
                <div 
                  style={styles.modeIndicator}
                  className="mode-indicator"
                  onMouseEnter={() => setShowModeDropdown(true)}
                  onMouseLeave={() => setShowModeDropdown(false)}
                >
                  <span style={styles.modeDot}></span>
                  {aiMode === 'reflection' ? 'Reflection Mode' : aiMode === 'chat' ? 'Chat Mode' : 'Resources Mode'} ▼
                  
                  {showModeDropdown && (
                    <div style={styles.modeDropdown}>
                      <div 
                        style={{...styles.dropdownItem, background: aiMode === 'reflection' ? 'rgba(159, 122, 234, 0.1)' : 'transparent'}}
                        className="dropdown-item"
                        onClick={() => {setAiMode('reflection'); setShowModeDropdown(false)}}
                      >
                        <span style={{...styles.modeDot, backgroundColor: '#9f7aea'}}></span>
                        Reflection Mode
                      </div>
                      <div 
                        style={{...styles.dropdownItem, background: aiMode === 'chat' ? 'rgba(66, 153, 225, 0.1)' : 'transparent'}}
                        className="dropdown-item"
                        onClick={() => {setAiMode('chat'); setShowModeDropdown(false)}}
                      >
                        <span style={{...styles.modeDot, backgroundColor: '#4299e1'}}></span>
                        Chat Mode
                      </div>
                      <div 
                        style={{...styles.dropdownItem, background: aiMode === 'resources' ? 'rgba(72, 187, 120, 0.1)' : 'transparent'}}
                        className="dropdown-item"
                        onClick={() => {setAiMode('resources'); setShowModeDropdown(false)}}
                      >
                        <span style={{...styles.modeDot, backgroundColor: '#48bb78'}}></span>
                        Resources Mode
                      </div>
                    </div>
                  )}
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
                        ? "Ask me anything or just have a conversation..."
                        : "What challenge would you like help with today?"
                    }
                    required
                  />
                  
                  <div style={styles.submitSection}>
                    <span style={styles.wordCount}>{entry.length} characters</span>
                    <button
                      type="submit"
                      disabled={isLoading || !entry.trim()}
                      style={styles.button}
                    >
                      {isLoading ? 'Processing...' : 'Reflect with me'}
                    </button>
                  </div>
                </form>
              </div>
              
              {showAnalysis && (
                <div style={styles.responseCard}>
                  <h3 style={styles.responseTitle}>
                    {aiMode === 'reflection' ? 'Your Reflection' : aiMode === 'chat' ? 'Response' : 'Resources & Tools'}
                  </h3>
                  <div style={styles.responseText}>{analysis}</div>
                </div>
              )}
            </div>
            
            {/* Sidebar Toggle Area */}
            {!sidebarOpen && (
              <div 
                style={styles.sidebarToggleArea}
                className="toggle-area"
                onClick={() => setSidebarOpen(true)}
              >
                <div style={styles.toggleLine} className="toggle-line"></div>
                <div style={styles.toggleButton} className="toggle-button">←</div>
              </div>
            )}
            
            {/* Sidebar */}
            <div style={styles.sidebar}>
              {sidebarOpen && (
                <>
                  <div 
                    style={styles.sidebarToggleArea}
                    className="toggle-area"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div style={styles.toggleLine} className="toggle-line"></div>
                    <div style={styles.toggleButton} className="toggle-button">→</div>
                  </div>
                  
                  <div style={{marginBottom: '2rem'}}>
                    <h2 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4a5568'}}>
                      Quick Actions
                    </h2>
                    
                    <button
                      onClick={generateWeeklyRecap}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        marginBottom: '0.75rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        cursor: entries.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: entries.length === 0 ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}
                      disabled={entries.length === 0}
                    >
                      📊 Weekly Recap
                    </button>
                  </div>
                  
                  <div>
                    <h2 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#4a5568'}}>
                      Recent Entries
                    </h2>
                    {entries.length > 0 ? (
                      entries.slice(0, 5).map((entry) => (
                        <div key={entry.id} style={{
                          padding: '0.75rem',
                          background: 'white',
                          borderRadius: '6px',
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem',
                          color: '#4a5568',
                          borderLeft: `3px solid ${getModeColor(entry.mode)}`
                        }}>
                          <div style={{fontSize: '0.7rem', color: '#a0aec0', marginBottom: '0.25rem'}}>
                            {entry.timestamp}
                          </div>
                          <div>{entry.text.substring(0, 50)}...</div>
                        </div>
                      ))
                    ) : (
                      <div style={{color: '#a0aec0', fontSize: '0.875rem', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem'}}>
                        Your entries will appear here
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div style={styles.disclaimer}>
            <p>Not a substitute for professional therapy or medical advice.</p>
            <p style={{marginTop: '0.5rem'}}>
              If you're in crisis: <a href="tel:988" style={{color: '#667eea', textDecoration: 'none'}}>988 Lifeline</a> (US) | 
              {' '}<a href="https://www.crisistextline.org" style={{color: '#667eea', textDecoration: 'none'}}>Crisis Text Line</a>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}