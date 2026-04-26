import axiosClient from "../api/axiosClient";

export const sendAiChatMessage = async ({ message, history = [] }) => {
  const response = await axiosClient.post("/api/ai/chat", {
    message,
    history,
  });

  return response.data;
};
