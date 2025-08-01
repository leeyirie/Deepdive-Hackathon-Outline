import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { content, title } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: '요약할 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ OpenAI API 키가 설정되지 않음 - 더미 요약 반환')
      // OpenAI API 키가 없을 때 더미 요약 반환
      return NextResponse.json({
        summary: `${title ? title + '에 대한 ' : ''}이슈에 대해 분석한 결과, 주요 상황과 영향을 파악했습니다. 현재 상태와 대응 방안에 대한 정보를 종합했습니다.`
      })
    }

    console.log('🤖 OpenAI API로 요약 생성 중...')
    
    // 런타임에 OpenAI 클라이언트 생성
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `당신은 뉴스나 이슈를 간결하게 요약하는 AI입니다. 
다음 조건을 반드시 지켜주세요:
- 2-3문장으로 핵심만 요약
- 객관적이고 정확한 정보만 포함
- 감정적이거나 추측성 표현 금지
- 한국어로 자연스럽게 작성
- 존댓말 사용하지 말고 평어체로 작성`
        },
        {
          role: "user",
          content: `다음 내용을 2-3문장으로 간결하게 요약해주세요:\n\n제목: ${title || ''}\n내용: ${content}`
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    })

    const summary = completion.choices[0]?.message?.content?.trim()

    if (!summary) {
      throw new Error('요약 생성 실패')
    }

    console.log('✅ AI 요약 생성 완료:', summary)

    return NextResponse.json({ summary })

  } catch (error) {
    console.error('❌ AI 요약 생성 오류:', error)
    
    // 에러 시 폴백 요약
    const fallbackSummary = '해당 이슈에 대한 상황을 분석하고 있습니다. 현재 상태와 관련 정보를 종합하여 대응 방안을 검토 중입니다.'
    
    return NextResponse.json({ 
      summary: fallbackSummary,
      warning: 'AI 요약 생성 중 문제가 발생하여 기본 요약을 표시합니다.'
    })
  }
}