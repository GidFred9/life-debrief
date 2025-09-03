'use client'
import { useState } from 'react'

export default function Home() {
  const [entry, setEntry] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [showAnalysis, setShowAnalysis] = useState(false)

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
          category: 'general'
        }),
      })
      
      const data = await response.json()
      
      if (data.analysis) {
        setAnalysis(data.analysis)
        setShowAnalysis(true)
        setEntry('')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to analyze. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const styles = {
    main: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    container: {
      maxWidth: '800px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '300',
      color: 'white',
      marginBottom: '0.5rem',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '1rem',
      fontWeight: '300'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#4a5568',
      marginBottom: '0.75rem',
      letterSpacing: '0.25px'
    },
    textarea: {
      width: '100%',
      minHeight: '150px',
      padding: '1rem',
      backgroundColor: '#f7fafc',
      color: '#2d3748',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '1rem',
      lineHeight: '1.6',
      outline: 'none',
      resize: 'vertical',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      fontFamily: 'inherit'
    },
    textareaFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    },
    button: {
      padding: '0.875rem 2rem',
      background: isLoading || !entry.trim() 
        ? '#cbd5e0' 
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '0.95rem',
      fontWeight: '500',
      cursor: isLoading || !entry.trim() ? 'not-allowed' : 'pointer',
      marginTop: '1.25rem',
      transition: 'transform 0.2s, box-shadow 0.2s',
      width: '100%',
      letterSpacing: '0.5px'
    },
    buttonHover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
    },
    analysisCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      animation: 'fadeIn 0.5s ease-in'
    },
    analysisTitle: {
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#667eea',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    analysisContent: {
      color: '#4a5568',
      lineHeight: '1.8',
      fontSize: '0.95rem',
      whiteSpace: 'pre-wrap'
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#48bb78',
      display: 'inline-block',
      animation: 'pulse 2s infinite'
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        textarea:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
      `}</style>
      
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Life Debrief</h1>
            <p style={styles.subtitle}>
              A safe space for your thoughts and reflections
            </p>
          </div>

          <div style={styles.card}>
            <form onSubmit={handleSubmit}>
              <div>
                <label style={styles.label}>
                  What&apos;s on your mind today?
                </label>
                <textarea
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  style={styles.textarea}
                  placeholder="Take a moment to express yourself freely. This is your private space to explore your thoughts..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !entry.trim()}
                style={styles.button}
              >
                {isLoading ? (
                  <>Processing your thoughts...</>
                ) : (
                  'Get Insights'
                )}
              </button>
            </form>
          </div>

          {showAnalysis && (
            <div style={styles.analysisCard}>
              <h2 style={styles.analysisTitle}>
                <span style={styles.dot}></span>
                Your Personal Insights
              </h2>
              <div style={styles.analysisContent}>{analysis}</div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}