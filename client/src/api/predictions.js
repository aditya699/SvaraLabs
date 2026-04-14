import api from "./client";

const BASE = "/api/v1/predictions";

export async function predictCommand(audioBlob, filename = "command.wav") {
  const formData = new FormData();
  formData.append("file", audioBlob, filename);
  const { data } = await api.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
