module {
  // A single chat message with role and text content
  public type Message = {
    role : Text; // "user" or "assistant"
    text : Text;
  };

  // User profile data stored per principal
  public type UserProfile = {
    name : Text;
    apiKey : Text; // OpenAI API key, stored privately per principal
  };

  // Result returned when sending a message to the AI
  public type ChatResult = {
    reply : Text;
    history : [Message];
  };
};
