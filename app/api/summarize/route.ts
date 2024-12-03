import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''

async function getVideoInfo(videoId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch video information from YouTube API')
  }
  const data = await response.json()
  if (data.items.length === 0) {
    throw new Error('Video not found')
  }
  return data.items[0]
}

function parseYouTubeUrl(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  const hours = (parseInt(match[1]) || 0)
  const minutes = (parseInt(match[2]) || 0)
  const seconds = (parseInt(match[3]) || 0)
  return hours * 3600 + minutes * 60 + seconds
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Processing video URL:', url)

    const videoId = parseYouTubeUrl(url)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    console.log('Fetching video info for ID:', videoId)

    let videoInfo
    try {
      videoInfo = await getVideoInfo(videoId)
    } catch (error) {
      console.error('Error fetching video info:', error)
      return NextResponse.json({ error: 'Unable to fetch video information. Please check if the video is public and try again.' }, { status: 400 })
    }

    console.log('Video info fetched successfully')

    const videoDurationInSeconds = parseDuration(videoInfo.contentDetails.duration)
    if (videoDurationInSeconds > 3600) { // More than 1 hour
      return NextResponse.json({ error: 'Video is too long. Please use videos under 1 hour in duration.' }, { status: 400 })
    }

    const videoTitle = videoInfo.snippet.title
    const videoDescription = videoInfo.snippet.description

    console.log('Generating summary for video:', videoTitle)

    // Generate summary using Google Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `Please provide a comprehensive summary of the following YouTube video:

Title: ${videoTitle}

Description: ${videoDescription}

Please structure the summary with an introduction, main points, and a conclusion.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text()

    console.log('Summary generated successfully')

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred while processing the request.' }, { status: 500 })
  }
}

