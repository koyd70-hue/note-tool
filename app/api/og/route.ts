import { NextRequest, NextResponse } from 'next/server'
import ogs from 'open-graph-scraper'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 })
  }

  // 기본적인 URL 유효성 검사
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ error: 'Only http/https URLs are allowed' }, { status: 400 })
  }

  try {
    const { result } = await ogs({ url, timeout: 5000 })
    const ogImageRaw = result.ogImage
    const ogImage = Array.isArray(ogImageRaw)
      ? (ogImageRaw[0] as { url?: string } | undefined)?.url
      : typeof ogImageRaw === 'object' && ogImageRaw !== null
      ? (ogImageRaw as { url?: string }).url
      : undefined

    return NextResponse.json({
      url,
      title: result.ogTitle ?? result.dcTitle ?? '',
      description: result.ogDescription ?? '',
      image: ogImage ?? '',
    })
  } catch {
    // OG 파싱 실패 시 URL만 담은 카드 반환
    return NextResponse.json({
      url,
      title: '',
      description: '',
      image: '',
    })
  }
}
