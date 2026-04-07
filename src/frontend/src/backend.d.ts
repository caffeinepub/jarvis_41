import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Message {
    role: string;
    text: string;
}
export interface ChatResult {
    history: Array<Message>;
    reply: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    clearConversationHistory(): Promise<void>;
    getConversationHistory(): Promise<Array<Message>>;
    getUserName(): Promise<string>;
    hasApiKey(): Promise<boolean>;
    saveApiKey(apiKey: string): Promise<void>;
    saveUserName(name: string): Promise<void>;
    sendMessage(userMessage: string): Promise<ChatResult>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
