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
      backgroundColor: '#111827',
      color: 'white',
      padding: '2rem'
    },
    container: {
      maxWidth: '1024px',
      margin: '0 auto'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#9CA3AF',
      marginBottom: '2rem',
      fontSize: '1.125rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.5rem'
    },
    textarea: {
      width: '100%',
      height: '160px',
      padding: '1rem',
      backgroundColor: '#1F2937',
      color: 'white',
      border: '1px solid #374151',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      resize: 'none'
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: isLoading || !entry.trim() ? '#4B5563' : '#2563EB',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: isLoading || !entry.trim() ? 'not-allowed' : 'pointer',
      marginTop: '1rem'
    },
    analysisBox: {
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: '#1F2937',
      borderRadius: '0.5rem',
      border: '1px solid #10B981',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.6'
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>Life Debrief</h1>
        <p style={styles.subtitle}>
          Dump your thoughts. Get real insights.
        </p>

        <form onSubmit={handleSubmit}>
          <div>
            <label style={styles.label}>
              What&apos;s on your mind?
            </label>
            <textarea
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              style={styles.textarea}
              placeholder="Just start typing. Be honest. Nobody else will see this..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !entry.trim()}
            style={styles.button}
          >
            {isLoading ? 'Analyzing...' : 'Analyze My Thoughts'}
          </button>
        </form>

        {showAnalysis && (
          <div style={styles.analysisBox}>
            <h2 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#10B981'}}>
              AI Analysis:
            </h2>
            <div>{analysis}</div>
          </div>
        )}
      </div>
    </main>
  )
}