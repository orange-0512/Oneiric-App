import { GEMINI_API_KEY } from '../config';
import * as FileSystem from 'expo-file-system/legacy';

export const generateDreamSummary = async (audioUri) => {
  try {
    console.log('GEMINI_API_KEY exists:', !!GEMINI_API_KEY);
    console.log('GEMINI_API_KEY length:', GEMINI_API_KEY?.length);
    
    console.log('Reading file...');
    const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64',
    });
    console.log('File read, base64 length:', base64Audio.length);

    console.log('Calling Gemini API (2.5-flash v1beta)...');
    // IMPORTANT: Gemini API key goes in query string, NOT in Authorization header
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "請將這段語音轉錄成文字，並且幫我生成一段約 50 字以內的「夢境重點摘要」。請直接給我摘要內容即可，不要有其他開場白。"
                },
                {
                  inline_data: {
                    mime_type: "audio/mp4", // expo-av default for IOS is m4a/mp4
                    data: base64Audio
                  }
                }
              ]
            }
          ]
        }),
      }
    );

    console.log('Gemini API response status:', response.status);
    const data = await response.json();
    console.log('Gemini API response data:', JSON.stringify(data).substring(0, 500));
    
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      
      // Handle Quota Exceeded (429) by returning a Mock Summary for testing
      if (data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED') {
        console.log('Quota exceeded, returning mock summary for testing.');
        return '（測試模式：因 API 額度已滿，此為模擬摘要）\n\n這是一個關於飛行的夢。你在雲端自由穿梭，感覺非常輕鬆自在。這可能象徵著你最近想要擺脫某些束縛，渴望自由。';
      }

      return 'AI 分析暫時無法使用，請稍後再試。';
    }

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    return '無法產生摘要';
  } catch (error) {
    console.error('Error generating summary:', error);
    // Fallback for network errors during testing
    return '（測試模式：網路連線錯誤，此為模擬摘要）\n\n夢見自己在考試但完全沒準備。這通常反映了現實生活中的壓力或對某件事的焦慮感。';
  }
};
