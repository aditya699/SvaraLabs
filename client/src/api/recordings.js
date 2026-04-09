import api from "./client";

const BASE = "/api/v1/recordings";

export async function uploadRecording(audioBlob, filename = "recording.wav") {
  const formData = new FormData();
  formData.append("file", audioBlob, filename);
  const { data } = await api.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function listRecordings(skip = 0, limit = 20) {
  const { data } = await api.get(BASE, { params: { skip, limit } });
  return data;
}

export async function getRecording(id) {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
}

export async function deleteRecording(id) {
  const { data } = await api.delete(`${BASE}/${id}`);
  return data;
}
