
/**
 * Generates content using the Gemini API.
 * Uses gemini-2.5-flash for speed to simulate the router response.
 * 
 * NOTE: This is a mock implementation for the UI demo.
 */
export const generateGeminiResponse = async (prompt: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const responses = [
    "Gemini 3 Pro is designed for multimodal reasoning, capable of processing text, code, and images with high efficiency.",
    "The routing layer automatically selects the best model for your query based on cost, latency, and capability requirements.",
    "I've processed your request using the optimal path. This demonstrates how intelligent routing can reduce latency while maintaining quality.",
    "This response was generated with low latency, simulating a real-time interaction with a high-performance model."
  ];

  // Return a random response or a specific one based on prompt
  if (prompt.toLowerCase().includes("hello") || prompt.toLowerCase().includes("hi")) {
    return "Hello! I am Gemini 3 Pro Preview, routed through the Nebula Lab network. How can I assist you today?";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
};

