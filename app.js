// Cambia esta URL por la URL de tu Cloudflare Worker terminada en /chat.
const API_URL = "PEGA_AQUI_TU_URL_DE_WORKER/chat";

const messagesEl = document.getElementById("messages");
const promptEl = document.getElementById("prompt");
const sendBtn = document.getElementById("send");
const statusEl = document.getElementById("status");

const history = [];

function addMessage(role, text) {
  const article = document.createElement("article");
  article.className = `bubble ${role}`;
  if (role === "assistant") {
    const label = document.createElement("b");
    label.textContent = "EMMY AI";
    article.appendChild(label);
  }
  const p = document.createElement("p");
  p.textContent = text;
  article.appendChild(p);
  messagesEl.appendChild(article);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage() {
  const text = promptEl.value.trim();
  if (!text || sendBtn.disabled) return;
  if (API_URL.startsWith("PEGA_AQUI")) {
    statusEl.textContent = "Falta configurar la URL del Worker en app.js.";
    return;
  }
  addMessage("user", text);
  history.push({ role: "user", parts: [{ text }] });
  promptEl.value = "";
  sendBtn.disabled = true;
  statusEl.textContent = "EMMY AI está pensando…";
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
    const answer = data.text || "No recibí una respuesta. Inténtalo de nuevo.";
    history.push({ role: "model", parts: [{ text: answer }] });
    addMessage("assistant", answer);
    statusEl.textContent = "Respuesta recibida.";
  } catch (error) {
    history.pop();
    addMessage("assistant", `No pude conectar: ${error.message}. Revisa la URL del Worker y su configuración.`);
    statusEl.textContent = "Error de conexión.";
  } finally {
    sendBtn.disabled = false;
    promptEl.focus();
  }
}
sendBtn.addEventListener("click", sendMessage);
promptEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
