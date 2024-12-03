import YouTubeSummarizer from '../components/youtube-summarizer'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Video Summarizer (Powered by Google Gemini)</h1>
      <YouTubeSummarizer />
    </main>
  )
}

