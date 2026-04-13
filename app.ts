type ChatMessage = {
  role: "system" | "user";
  content: string;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const apiKeyInput = document.querySelector<HTMLInputElement>("#apiKey");
const questionInput = document.querySelector<HTMLTextAreaElement>("#question");
const askBtn = document.querySelector<HTMLButtonElement>("#askBtn");
const answerEl = document.querySelector<HTMLElement>("#answer");

if (!apiKeyInput || !questionInput || !askBtn || !answerEl) {
  throw new Error("Elementos do app não encontrados no DOM.");
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const FREE_MODEL = "meta-llama/llama-3.3-8b-instruct:free";

async function askAI(apiKey: string, question: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "Você é um assistente útil e responde em português do Brasil.",
    },
    { role: "user", content: question },
  ];

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "App IA Grátis Exemplo",
    },
    body: JSON.stringify({
      model: FREE_MODEL,
      messages,
      temperature: 0.7,
    }),
  });

  const data = (await response.json()) as OpenRouterResponse;

  if (!response.ok) {
    const errorMessage = data.error?.message ?? "Falha ao chamar a API.";
    throw new Error(errorMessage);
  }

  return data.choices?.[0]?.message?.content?.trim() ?? "Sem resposta da IA.";
}

askBtn.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();
  const question = questionInput.value.trim();

  if (!apiKey) {
    answerEl.textContent = "Informe sua API key do OpenRouter.";
    return;
  }

  if (!question) {
    answerEl.textContent = "Digite uma pergunta antes de enviar.";
    return;
  }

  askBtn.disabled = true;
  askBtn.textContent = "Perguntando...";
  answerEl.textContent = "Carregando resposta...";

  try {
    const result = await askAI(apiKey, question);
    answerEl.textContent = result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    answerEl.textContent = `Erro: ${message}`;
  } finally {
    askBtn.disabled = false;
    askBtn.textContent = "Perguntar";
  }
});
