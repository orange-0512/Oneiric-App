import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const GEMINI_API_KEY = extra.GEMINI_API_KEY || '';
export const HUGGINGFACE_API_TOKEN = extra.HUGGINGFACE_API_TOKEN || '';
