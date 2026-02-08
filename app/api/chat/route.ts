import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { NextRequest } from "next/server";
import { systemPrompt as defaultSystemPrompt } from "@/components/dashboard/ai-manager/system-prompt";

export async function POST(req: NextRequest) {
  try {
    const {
      systemPrompt,
      previousResponseId,
      userMessage,
      model = "gpt-4o-mini",
      providerApiKey,
      providerName = "openai",
    } = await req.json();

    const effectiveSystemPrompt: string =
      typeof systemPrompt === "string" && systemPrompt.trim().length > 0
        ? systemPrompt
        : defaultSystemPrompt;

    console.log("🚀 ~ POST ~ userMessage:", userMessage);
    console.log("🚀 ~ POST ~ providerName:", providerName);
    console.log("🚀 ~ POST ~ model:", model);

    const trimmedKey =
      typeof providerApiKey === "string" ? providerApiKey.trim() : "";

    // Validate API key exists
    if (!trimmedKey || trimmedKey.length === 0) {
      throw new Error(`No API key provided for ${providerName}`);
    }

    let modelClient;
    const lowerProviderName = String(providerName).toLowerCase();

    // Route to the correct provider
    if (lowerProviderName.includes("gemini")) {
      // Gemini Provider with proper initialization
      const googleClient = createGoogleGenerativeAI({ apiKey: trimmedKey });
      modelClient = googleClient(model);
      console.log("✅ Using Google Generative AI (Gemini) provider");
    } else if (lowerProviderName.includes("openai")) {
      // OpenAI Provider
      const openAIClient = createOpenAI({ apiKey: trimmedKey });
      modelClient = openAIClient(model);
      console.log("✅ Using OpenAI provider");
    } else {
      throw new Error(`Unsupported provider: ${providerName}`);
    }

    // Stream the response
    const result = streamText({
      model: modelClient,
      system: effectiveSystemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const baseResponse = result.toUIMessageStreamResponse();

    const response = new Response(baseResponse.body, {
      status: baseResponse.status,
      statusText: baseResponse.statusText,
      headers: new Headers(baseResponse.headers),
    });

    // Copy headers
    baseResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    // Optional: Add response ID for OpenAI (for tracking)
    if (lowerProviderName.includes("openai")) {
      try {
        const providerMetadata = await result.providerMetadata;
        const responseId = providerMetadata?.openai?.responseId;
        if (responseId) {
          response.headers.set("x-response-id", responseId as string);
        }
      } catch (e) {
        console.warn("Could not extract OpenAI response ID");
      }
    }

    return response;
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";

    // Parse error and provide user-friendly message
    let userFriendlyMessage = "";

    if (errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      userFriendlyMessage = "⚠️ **Quota Exceeded**\n\nYou have exceeded your current API quota. Please recharge your balance or upgrade your plan to continue using this service.\n\n**Next Steps:**\n- Check your billing details\n- Add credits to your account\n- Wait for the quota to reset\n- Consider upgrading to a paid plan";
    } else if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
      userFriendlyMessage = "⚠️ **Rate Limit Exceeded**\n\nYou're sending requests too quickly. Please wait a moment and try again.\n\n**Tip:** Space out your requests to avoid hitting rate limits.";
    } else if (errorMessage.includes("invalid") && errorMessage.includes("api key")) {
      userFriendlyMessage = "🔑 **Invalid API Key**\n\nThe API key you provided is not valid. Please check your API key and try again.\n\n**Steps to fix:**\n1. Go to your provider's dashboard\n2. Generate a new API key\n3. Update the key in your settings";
    } else if (errorMessage.includes("Incorrect API key")) {
      userFriendlyMessage = "🔑 **Incorrect API Key**\n\nThe API key provided is incorrect or has been revoked. Please verify your API key.\n\n**Steps to fix:**\n1. Check for typos in your API key\n2. Ensure the key hasn't expired\n3. Generate a new key if needed";
    } else if (errorMessage.includes("model") && errorMessage.includes("not found")) {
      userFriendlyMessage = "🤖 **Model Not Found**\n\nThe AI model you selected is not available or doesn't exist.\n\n**Solution:** Please select a different model from the available options.";
    } else if (errorMessage.includes("insufficient_quota") || errorMessage.includes("billing")) {
      userFriendlyMessage = "💳 **Billing Issue**\n\nThere's an issue with your account billing. Please check your payment method and account balance.\n\n**Action required:**\n- Verify your payment method\n- Add funds to your account\n- Contact your provider's support if needed";
    } else if (errorMessage.includes("No API key provided")) {
      userFriendlyMessage = "🔑 **API Key Missing**\n\nNo API key was provided. Please add your API key in the settings to use this feature.";
    } else if (errorMessage.includes("authentication") || errorMessage.includes("unauthorized")) {
      userFriendlyMessage = "🔐 **Authentication Failed**\n\nFailed to authenticate with the AI provider. Please check your API credentials.\n\n**Common causes:**\n- Expired API key\n- Invalid permissions\n- Account access issues";
    } else {
      userFriendlyMessage = `❌ **An Error Occurred**\n\n${errorMessage}\n\nPlease try again. If the problem persists, contact support.`;
    }

    // Return error in the same format as AI responses
    return new Response(
      JSON.stringify({
        description: userFriendlyMessage,
        error: true,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200, // Return 200 so the client can display the error message properly
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}