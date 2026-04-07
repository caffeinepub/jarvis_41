import Types "types/jarvis-assistant";
import JarvisApiMixin "mixins/jarvis-assistant-api";
import Map "mo:core/Map";
import List "mo:core/List";

actor {
  let conversations = Map.empty<Principal, List.List<Types.Message>>();
  let profiles = Map.empty<Principal, Types.UserProfile>();

  include JarvisApiMixin(conversations, profiles);
};
