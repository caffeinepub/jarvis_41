import Types "../types/jarvis-assistant";
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";

module {
  // Maximum number of messages to keep in conversation history per user
  public let MAX_HISTORY : Nat = 10;

  // Get the conversation history for a principal
  public func getHistory(
    conversations : Map.Map<Principal, List.List<Types.Message>>,
    caller : Principal,
  ) : [Types.Message] {
    switch (conversations.get(caller)) {
      case (?list) list.toArray();
      case null [];
    };
  };

  // Add a message to the conversation history, trimming oldest when over MAX_HISTORY
  public func addMessage(
    conversations : Map.Map<Principal, List.List<Types.Message>>,
    caller : Principal,
    role : Text,
    text : Text,
  ) {
    let msg : Types.Message = { role; text };
    let list = switch (conversations.get(caller)) {
      case (?existing) existing;
      case null {
        let newList = List.empty<Types.Message>();
        conversations.add(caller, newList);
        newList;
      };
    };
    list.add(msg);
    // Trim oldest messages when over limit: remove from front by reversing,
    // removing last, then reversing back
    while (list.size() > MAX_HISTORY) {
      list.reverseInPlace();
      ignore list.removeLast();
      list.reverseInPlace();
    };
  };

  // Clear the conversation history for a principal
  public func clearHistory(
    conversations : Map.Map<Principal, List.List<Types.Message>>,
    caller : Principal,
  ) {
    switch (conversations.get(caller)) {
      case (?list) list.clear();
      case null {};
    };
  };

  // Get the user profile for a principal
  public func getProfile(
    profiles : Map.Map<Principal, Types.UserProfile>,
    caller : Principal,
  ) : ?Types.UserProfile {
    profiles.get(caller);
  };

  // Save user name for a principal
  public func saveName(
    profiles : Map.Map<Principal, Types.UserProfile>,
    caller : Principal,
    name : Text,
  ) {
    let current = switch (profiles.get(caller)) {
      case (?p) p;
      case null { { name = ""; apiKey = "" } };
    };
    profiles.add(caller, { current with name });
  };

  // Save OpenAI API key for a principal
  public func saveApiKey(
    profiles : Map.Map<Principal, Types.UserProfile>,
    caller : Principal,
    apiKey : Text,
  ) {
    let current = switch (profiles.get(caller)) {
      case (?p) p;
      case null { { name = ""; apiKey = "" } };
    };
    profiles.add(caller, { current with apiKey });
  };

  // Build the OpenAI request body JSON string from conversation history and a new user message
  public func buildOpenAiRequestBody(
    history : [Types.Message],
    userMessage : Text,
  ) : Text {
    let systemMsg = "{\"role\":\"system\",\"content\":\"Aap Jarvis hain, ek AI assistant. Aap sirf Hindi mein jawab dete hain. Short, helpful aur smart answers dete hain.\"}";

    // Build history messages
    var messagesJson = systemMsg;
    for (msg in history.values()) {
      let escaped = escapeJson(msg.text);
      messagesJson #= ",{\"role\":\"" # msg.role # "\",\"content\":\"" # escaped # "\"}";
    };

    // Add the new user message
    let escapedUser = escapeJson(userMessage);
    messagesJson #= ",{\"role\":\"user\",\"content\":\"" # escapedUser # "\"}";

    "{\"model\":\"gpt-4o-mini\",\"messages\":[" # messagesJson # "]}";
  };

  // Extract the assistant reply text from the raw OpenAI JSON response
  // Parses: {"choices":[{"message":{"content":"..."}}]}
  public func parseOpenAiResponse(rawJson : Text) : Text {
    // Look for "content":"<value>" pattern - skip past "role":"assistant","content":"
    let contentKey = "\"content\":\"";
    switch (findAfter(rawJson, contentKey)) {
      case (?rest) {
        // Skip the system message's content — find a second occurrence
        switch (findAfter(rest, contentKey)) {
          case (?rest2) extractJsonString(rest2);
          case null extractJsonString(rest);
        };
      };
      case null "Maafi chahta hoon, jawab parse nahi ho saka.";
    };
  };

  // Helper: find text after a substring, returns ?rest
  private func findAfter(text : Text, sub : Text) : ?Text {
    let textChars = text.toArray();
    let subChars = sub.toArray();
    let tLen = textChars.size();
    let sLen = subChars.size();
    if (sLen == 0 or tLen < sLen) return null;
    var i = 0;
    label search while (i + sLen <= tLen) {
      var matched = true;
      var j = 0;
      while (j < sLen) {
        if (textChars[i + j] != subChars[j]) {
          matched := false;
        };
        j += 1;
      };
      if (matched) {
        let rest = Array.tabulate(tLen - i - sLen, func(k) { textChars[i + sLen + k] });
        return ?Text.fromArray(rest);
      };
      i += 1;
    };
    null;
  };

  // Helper: extract a JSON string value up to the closing unescaped quote
  private func extractJsonString(text : Text) : Text {
    let chars = text.toArray();
    let buf = List.empty<Char>();
    var i = 0;
    var escaped = false;
    while (i < chars.size()) {
      let c = chars[i];
      if (escaped) {
        if (c == 'n') {
          buf.add('\n');
        } else if (c == 't') {
          buf.add('\t');
        } else if (c == 'r') {
          buf.add('\r');
        } else {
          buf.add(c);
        };
        escaped := false;
      } else if (c == '\\') {
        escaped := true;
      } else if (c == '\"') {
        return Text.fromIter(buf.values());
      } else {
        buf.add(c);
      };
      i += 1;
    };
    Text.fromIter(buf.values());
  };

  // Helper: escape special characters for JSON string embedding
  private func escapeJson(text : Text) : Text {
    var result = "";
    for (c in text.toIter()) {
      if (c == '\"') {
        result #= "\\\"";
      } else if (c == '\\') {
        result #= "\\\\";
      } else if (c == '\n') {
        result #= "\\n";
      } else if (c == '\r') {
        result #= "\\r";
      } else if (c == '\t') {
        result #= "\\t";
      } else {
        result #= Text.fromChar(c);
      };
    };
    result;
  };
};
