import Types "../types/jarvis-assistant";
import JarvisLib "../lib/jarvis-assistant";
import Map "mo:core/Map";
import List "mo:core/List";
import OutCall "mo:caffeineai-http-outcalls/outcall";

mixin (
  conversations : Map.Map<Principal, List.List<Types.Message>>,
  profiles : Map.Map<Principal, Types.UserProfile>,
) {
  // Transform callback required by the IC for HTTP outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Send a message to the AI and get a reply; uses stored API key for the caller
  public shared ({ caller }) func sendMessage(userMessage : Text) : async Types.ChatResult {
    // Check for API key
    let apiKey = switch (JarvisLib.getProfile(profiles, caller)) {
      case (?p) {
        if (p.apiKey == "") {
          return {
            reply = "API key configure nahi hai. Settings mein jakar apni OpenAI API key enter karein.";
            history = JarvisLib.getHistory(conversations, caller);
          };
        };
        p.apiKey;
      };
      case null {
        return {
          reply = "API key configure nahi hai. Settings mein jakar apni OpenAI API key enter karein.";
          history = JarvisLib.getHistory(conversations, caller);
        };
      };
    };

    // Get current history before adding the new user message
    let currentHistory = JarvisLib.getHistory(conversations, caller);

    // Build OpenAI request body
    let requestBody = JarvisLib.buildOpenAiRequestBody(currentHistory, userMessage);

    // Make HTTP outcall to OpenAI
    let url = "https://api.openai.com/v1/chat/completions";
    let headers : [OutCall.Header] = [
      { name = "Content-Type"; value = "application/json" },
      { name = "Authorization"; value = "Bearer " # apiKey },
    ];

    let rawResponse = try {
      await OutCall.httpPostRequest(url, headers, requestBody, transform);
    } catch (_) {
      "ERROR";
    };

    let reply = if (rawResponse == "ERROR") {
      "Network problem ho gaya. Kripya dobara try karein.";
    } else {
      JarvisLib.parseOpenAiResponse(rawResponse);
    };

    // Store both user message and assistant reply in history
    JarvisLib.addMessage(conversations, caller, "user", userMessage);
    JarvisLib.addMessage(conversations, caller, "assistant", reply);

    {
      reply;
      history = JarvisLib.getHistory(conversations, caller);
    };
  };

  // Get the conversation history for the current caller
  public query ({ caller }) func getConversationHistory() : async [Types.Message] {
    JarvisLib.getHistory(conversations, caller);
  };

  // Clear the conversation history for the current caller
  public shared ({ caller }) func clearConversationHistory() : async () {
    JarvisLib.clearHistory(conversations, caller);
  };

  // Save the user's display name
  public shared ({ caller }) func saveUserName(name : Text) : async () {
    JarvisLib.saveName(profiles, caller, name);
  };

  // Get the user's display name (returns empty string if not set)
  public query ({ caller }) func getUserName() : async Text {
    switch (JarvisLib.getProfile(profiles, caller)) {
      case (?p) p.name;
      case null "";
    };
  };

  // Save the user's OpenAI API key (stored privately per principal)
  public shared ({ caller }) func saveApiKey(apiKey : Text) : async () {
    JarvisLib.saveApiKey(profiles, caller, apiKey);
  };

  // Check whether the caller has an API key configured
  public query ({ caller }) func hasApiKey() : async Bool {
    switch (JarvisLib.getProfile(profiles, caller)) {
      case (?p) p.apiKey != "";
      case null false;
    };
  };
};
