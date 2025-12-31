import api from './api';

// endpoints:
// POST /Message/AddMessage
// PUT /Message/UpdateMessage/{id}
// DELETE /Message/DeleteMessage/{MessageId}
// GET /Message/GetUserMessage/{UserId}

const handleResponse = (resp) => {
  return resp?.data;
};

export async function getUserMessages(userId) {
  const resp = await api.get(`/api/messages/users/${userId}`);
  console.log("getUserMessages response:", resp);
  return handleResponse(resp);
}

export async function addMessage(payload) {
  console.log("payload = ", payload);
  try {
    const resp = await api.post(`/api/messages`, payload);
    return handleResponse(resp);
  } catch (err) {
    // improved error logging to see server validation message
    console.error('addMessage error:', err?.response?.status, err?.response?.data ?? err.message);
    // rethrow so caller can handle/display it
    throw err;
  }
}

export async function updateMessage(id, payload) {
  const resp = await api.put(`/api/Message/UpdateMessage/${id}`, payload);
  return handleResponse(resp);
}

export async function deleteMessage(id) {
  const resp = await api.delete(`/api/Message/DeleteMessage/${id}`);
  return handleResponse(resp);
}