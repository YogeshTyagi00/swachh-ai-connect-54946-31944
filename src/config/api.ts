// External API configuration
export const CIVIC_BOT_API_URL = "https://civic-bot-backend.onrender.com";

// API endpoints
export const API_ENDPOINTS = {
  chatbot: ${CIVIC_BOT_API_URL}/chat,
  predict: ${CIVIC_BOT_API_URL}/predict, // add this for image upload
};

// Helper function to make API calls
export async function callCivicBotAPI(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Civic Bot API Error:", error);
    throw error;
  }
}
