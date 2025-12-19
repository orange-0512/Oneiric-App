import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

const extra = Constants.expoConfig?.extra ?? {};
const HUGGINGFACE_API_TOKEN = extra.HUGGINGFACE_API_TOKEN || '';

// Using Stable Diffusion XL via HuggingFace Inference API
const API_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';

export const generateDreamImage = async (prompt) => {
  try {
    console.log("Generating image with Hugging Face for prompt:", prompt);
    console.log("HF_TOKEN exists:", !!HUGGINGFACE_API_TOKEN);
    
    const enhancedPrompt = `A surreal, abstract, dreamlike illustration of: ${prompt}. Soft pastel colors, ethereal atmosphere, artistic style, non-photorealistic, high quality, whimsical, fantasy art.`;
    
    // IMPORTANT: HuggingFace uses Bearer token authentication
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          negative_prompt: "realistic, photographic, ugly, blurry, low quality",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API Error: ${response.status}`, errorText);
      
      // If model is loading (503), wait and retry once
      if (response.status === 503) {
        console.log('Model is loading, waiting 20 seconds...');
        await new Promise(resolve => setTimeout(resolve, 20000));
        return generateDreamImage(prompt); // Retry once
      }
      
      throw new Error(`Hugging Face API Failed: ${response.status} - ${errorText}`);
    }

    // Response is a blob (image data)
    const blob = await response.blob();
    
    // Convert blob to base64 for React Native
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64data = reader.result;
        console.log('Image generated successfully, size:', base64data.length);
        resolve(base64data);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });

  } catch (error) {
    console.error("Generate Image Error:", error);
    throw error;
  }
};
