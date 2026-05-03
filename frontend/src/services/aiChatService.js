import axiosClient from "../api/axiosClient";

export const sendAiChatMessage = async ({
  message,
  history = [],
  conversationId = null,
  sessionId = null,
}) => {
  const response = await axiosClient.post("/api/ai/chat", {
    conversationId,
    sessionId,
    message,
    history,
  });

  return response.data;
};
