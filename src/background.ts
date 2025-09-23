/* eslint-disable @typescript-eslint/no-non-null-assertion */
"use strict";

// Background script for tweet classification using MLCEngine
// Provides messaging interface for receiving tweets to classify

import {
  MLCEngineInterface,
  InitProgressReport,
  CreateMLCEngine,
  ChatCompletionMessageParam,
} from "@mlc-ai/web-llm";

// Global variables for the ML engine
let engine: MLCEngineInterface;
let chatHistory: ChatCompletionMessageParam[] = [];
let isEngineReady = false;
let isInitializing = false;

// Queue for handling classification requests sequentially
let classificationQueue: Array<{
  tweetText: string;
  tweetId?: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];
let isProcessingQueue = false;

// Initially selected model
const selectedModel = "Qwen2-0.5B-Instruct-q4f16_1-MLC";

// Process the classification queue sequentially
async function processClassificationQueue(): Promise<void> {
  if (isProcessingQueue || classificationQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (classificationQueue.length > 0) {
    const request = classificationQueue.shift();
    if (!request) continue;

    try {
      const classification = await classifyTweet(request.tweetText);
      request.resolve({
        success: true,
        classification: classification,
        tweetId: request.tweetId
      });
    } catch (error) {
      request.reject({
        success: false,
        error: error instanceof Error ? error.message : 'Classification failed',
        tweetId: request.tweetId
      });
    }
  }

  isProcessingQueue = false;
}

// Initialize the ML engine
async function initializeEngine(): Promise<void> {
  if (isInitializing || isEngineReady) {
    return;
  }

  isInitializing = true;
  console.log("Initializing ML engine...");

  try {
    const initProgressCallback = (report: InitProgressReport) => {
      console.log(`ML Engine Progress: ${report.text} (${Math.round(report.progress * 100)}%)`);
    };

    engine = await CreateMLCEngine(selectedModel, {
      initProgressCallback: initProgressCallback,
    });

    isEngineReady = true;
    isInitializing = false;
    console.log("ML engine initialized successfully");
  } catch (error) {
    isInitializing = false;
    console.error("Failed to initialize ML engine:", error);
    throw error;
  }
}

// Classify a tweet using the ML engine
async function classifyTweet(tweetText: string): Promise<string> {
  if (!isEngineReady) {
    throw new Error("ML engine is not ready");
  }

  try {
    // Create classification prompt
    const classificationPrompt = `Classify the following tweet content as benign or problematic. 
    Respond with one of these categories: BENIGN, PROBLEMATIC.
    Tweet: "${tweetText}"
    Classification:`;

    // Add to chat history
    chatHistory.push({ role: "user", content: classificationPrompt });

    // Generate classification
    let classification = "";
    const completion = await engine.chat.completions.create({
      stream: true,
      messages: chatHistory,
    });

    for await (const chunk of completion) {
      const curDelta = chunk.choices[0].delta.content;
      if (curDelta) {
        classification += curDelta;
      }
    }

    // Get final response
    const response = await engine.getMessage();
    chatHistory.push({ role: "assistant", content: response });

    return response.trim();
  } catch (error) {
    console.error("Error classifying tweet:", error);
    throw error;
  }
}

// Handle messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log("Background received message:", message);

  // Handle tweet classification requests
  if (message.type === "CLASSIFY_TWEET") {
    const { tweetText, tweetId } = message;
    
    if (!tweetText) {
      sendResponse({ 
        success: false, 
        error: "No tweet text provided" 
      });
      return;
    }

    // Add request to queue
    const queueRequest = {
      tweetText,
      tweetId,
      resolve: (response: any) => {
        console.log(`Tweet ${tweetId} classified as: ${response.classification}`);
        sendResponse(response);
      },
      reject: (error: any) => {
        console.error("Classification failed:", error);
        sendResponse(error);
      }
    };

    classificationQueue.push(queueRequest);

    // Ensure engine is ready and process queue
    initializeEngine()
      .then(() => processClassificationQueue())
      .catch((error) => {
        queueRequest.reject({
          success: false,
          error: error.message,
          tweetId: tweetId
        });
      });

    // Return true to indicate we will send a response asynchronously
    return true;
  }

  // Handle engine status requests
  if (message.type === "GET_ENGINE_STATUS") {
    sendResponse({
      isReady: isEngineReady,
      isInitializing: isInitializing,
      model: selectedModel
    });
    return;
  }

  // Handle engine initialization requests
  if (message.type === "INITIALIZE_ENGINE") {
    initializeEngine()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Initialize the engine when the background script starts
console.log("Background script started, initializing ML engine...");
initializeEngine().catch((error) => {
  console.error("Failed to initialize ML engine on startup:", error);
});

// Export functions for potential use by other scripts
export { classifyTweet, initializeEngine };