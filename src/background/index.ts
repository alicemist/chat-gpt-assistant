import { IChatGptPostMessage } from "../interfaces/settings";
import {
  ChatGptMessageType,
  CHAT_GPT_HISTORY_KEY,
  KEY_ACCESS_TOKEN,
} from "../consts";
import { cache, getAnswer } from "../utils/chatgpt";
import { sendMessage } from "../utils/messaging";

console.log("Initialized background", Date.now());

chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(() => console.log("Port disconnected"));

  port.onMessage.addListener(async (msg: IChatGptPostMessage) => {
    console.debug("Received question:", msg.data.question.slice(0, 20));
    try {
      await getAnswer(
        msg.data.question,
        ({ done, answer }: { done: boolean; answer?: string }) => {
          if (done) {
            sendMessage(port, ChatGptMessageType.ANSWER_DONE_FROM_BG);
            port.disconnect();
          } else {
            sendMessage(port, ChatGptMessageType.ANSWER_TEXT_FROM_BG, {
              answer,
            });
          }
        }
      );
    } catch (e) {
      //   console.error(e);
      sendMessage(port, ChatGptMessageType.ANSWER_ERROR_FROM_BG, {
        error: e.message,
      });
      port.disconnect();
      cache.delete(KEY_ACCESS_TOKEN);
    }
  });
});

chrome.runtime.onInstalled.addListener((details) => {
  try {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      // @ts-ignore
      const url = chrome.runtime.getManifest().options_ui.page;

      chrome.tabs.create({
        url: chrome.runtime.getURL(`${url}#/how-to-use`),
      });
    }
  } catch (e) {
    console.error(e);
  }
});

chrome.omnibox.onInputEntered.addListener((text: string) => {
  // @ts-ignore
  const url = chrome.runtime.getManifest().options_ui.page;

  chrome.tabs.create({
    url: chrome.runtime.getURL(`${url}?q=${text}`),
  });
});

chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const normalizedText = text.trim().toLowerCase();

  const history = await chrome.storage.local.get(CHAT_GPT_HISTORY_KEY);

  if (history[CHAT_GPT_HISTORY_KEY]) {
    suggest(
      history[CHAT_GPT_HISTORY_KEY].filter((historyItem: string) =>
        historyItem.trim().toLowerCase().includes(normalizedText)
      ).map((historyItem: string) => {
        let title = historyItem;

        const titleStartIdx = title.toLowerCase().indexOf(normalizedText);
        if (titleStartIdx >= 0) {
          const titleEndIdx = titleStartIdx + normalizedText.length;
          title =
            title.slice(0, titleStartIdx) +
            "<match>" +
            title.slice(titleStartIdx, titleEndIdx) +
            "</match>" +
            title.slice(titleEndIdx);
        }

        return {
          content: historyItem,
          description: `${title}`,
        };
      })
    );
  }
});

chrome.contextMenus.create({
  id: "gpt-search",
  title: "Use selected text as ChatGPT prompt",
  contexts: ["selection"],
});

chrome.contextMenus.create({
  id: "gpt-settings",
  title: "ChatGPT Assistant settings",
  contexts: ["audio", "editable", "frame", "image", "link", "page", "video"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "gpt-settings") {
    // @ts-ignore
    const url = chrome.runtime.getManifest().options_ui.page;

    chrome.tabs.create({
      url: chrome.runtime.getURL(`${url}#/settings`),
    });
  }

  if (info.menuItemId === "gpt-search") {
    info.selectionText;

    // @ts-ignore
    const url = chrome.runtime.getManifest().options_ui.page;

    chrome.tabs.create({
      url: chrome.runtime.getURL(`${url}?q=${info.selectionText}`),
    });
  }
});
