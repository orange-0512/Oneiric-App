import { REPLICATE_API_TOKEN } from '../config';

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
// Using Flux Schnell for fast generation
const MODEL_VERSION = "black-forest-labs/flux-schnell"; 

export const generateDreamImage = async (prompt) => {
  try {
    console.log("Generating image for prompt:", prompt);
    
    // 1. Start the prediction
    // Using Flux Schnell
    const response = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL
        input: {
          prompt: "Contemporary character illustration inspired by " + prompt + ", simple rounded forms, soft gradient lighting, grainy airbrush texture, dreamy and calm atmosphere, minimal facial features, playful and warm mood, modern editorial illustration style, flat yet dimensional, no realism, no oil painting, no anime",
          negative_prompt: "oil painting, impasto, brushstrokes, canvas texture, ukiyo-e, Japanese woodblock, traditional art, realistic lighting, photorealism, anime, manga, comic style",
          width: 1024,
          height: 1024,
          refine: "expert_ensemble_refiner",
          scheduler: "K_EULER",
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Replicate API Error: ${response.status}`, errorBody);
      throw new Error(`Replicate API Failed: ${response.status} - ${errorBody}`);
    }

    let prediction = await response.json();
    console.log("Prediction started:", prediction.id);

    // Poll for results
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pollResponse = await fetch(`${REPLICATE_API_URL}/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        }
      });
      prediction = await pollResponse.json();
      console.log("Polling status:", prediction.status);
    }

    if (prediction.status === 'failed') {
      console.error("Image generation failed:", prediction.error);
      throw new Error("Image generation failed");
    }

    return prediction.output[0];

  } catch (error) {
    console.error("Generate Image Error:", error);
    // Return null to indicate failure instead of a mock image, so the UI can handle it or show an error state
    // Or if we MUST return a string, let's return a specific error placeholder or re-throw
    // For now, let's re-throw so the caller knows it failed, OR return a placeholder but log heavily.
    // The user specifically complained about "fake" images. So let's NOT return a fake image.
    throw error;
  }
};
