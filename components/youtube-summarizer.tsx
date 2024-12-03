'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

export default function YouTubeSummarizer() {
  const [url, setUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSummary('')
    setError('')
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      setSummary(data.summary)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="url"
          placeholder="Enter YouTube video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Summarizing...' : 'Summarize'}
        </Button>
      </form>
      {error && (
        <div className="text-red-500 bg-red-100 p-4 rounded-md mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          {error.includes("Invalid YouTube URL") && (
            <p className="mt-2">Please make sure you've entered a valid YouTube video URL.</p>
          )}
          {error.includes("Unable to fetch video information") && (
            <p className="mt-2">There was an issue accessing the video. Please check if the video is public and try again.</p>
          )}
          {error.includes("Video is too long") && (
            <p className="mt-2">Please choose a video that is less than 1 hour in duration.</p>
          )}
        </div>
      )}
      {summary && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Summary:</h2>
          <Textarea value={summary} readOnly className="w-full h-64" />
        </div>
      )}
    </div>
  )
}

