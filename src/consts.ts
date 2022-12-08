export const CHAT_GPT_HISTORY_KEY = "CHAT_GPT_HISTORY";
export const CHAT_GPT_SETTINGS_KEY = "CHAT_GPT_SETTINGS_KEY";
export enum ChatGptSettingsKey {
  ENABLE_CONTENT_SCRIPT = "ENABLE_CONTENT_SCRIPT",
  EAGER_SEARCH = "EAGER_SEARCH",
  IFRAME_POPUP = "IFRAME_POPUP",
}

export enum ChatGptMessageType {
  SEND_PROMPT_FROM_CS = "SEND_PROMPT_FROM_CS",
  ANSWER_TEXT_FROM_BG = "ANSWER_FROM_BG",
  ANSWER_DONE_FROM_BG = "ANSWER_DONE_FROM_BG",
  ANSWER_ERROR_FROM_BG = "ANSWER_ERROR_FROM_BG",
}
