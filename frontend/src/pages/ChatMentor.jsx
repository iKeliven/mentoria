import React, { useEffect, useState, useRef } from "react";
import LayoutWrapper from "../components/LayoutWrapper";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { LuChevronRight } from "react-icons/lu";
import { chatService } from "../services/chatService";
import { trilhaService } from "../services/trilhaService";
import Button from "../components/Button";
import ButtonBack from "../components/ButtonBack";
import ConfirmDialog from "../components/ConfirmDialog";

const acoesRapidas = [
  { texto: "Montar estudo de hoje", acao: "Monte minha sessão de estudo de hoje usando a próxima atividade da minha trilha. Informe a ordem, duração e o resultado esperado de cada etapa." },
  { texto: "Analisar meu progresso", acao: "Analise meu progresso nesta trilha, considerando minha avaliação e os módulos. Diga o que já domino, o que preciso revisar e qual é meu próximo passo." },
  { texto: "Explicar próximo conceito", acao: "Explique o próximo conceito da minha trilha de forma simples, com um exemplo prático e um exercício curto para eu tentar agora." },
];

function textoFormatado(texto) {
  return String(texto || "").split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((trecho, indice) => {
    if (trecho.startsWith("**") && trecho.endsWith("**")) {
      return <strong key={indice} className="font-poppins-bold">{trecho.slice(2, -2)}</strong>;
    }
    if (trecho.startsWith("`") && trecho.endsWith("`")) {
      return <code key={indice} className="rounded px-1.5 py-0.5 font-mono text-[12px]" style={{ backgroundColor: "#e9edf5" }}>{trecho.slice(1, -1)}</code>;
    }
    return trecho;
  });
}

function MensagemChat({ texto }) {
  const linhas = String(texto || "").split("\n");
  return (
    <div className="font-poppins text-sm leading-relaxed space-y-1.5">
      {linhas.map((linha, indice) => {
        if (!linha.trim()) return <div key={indice} className="h-2" />;
        if (linha.startsWith("- ")) return <div key={indice} className="flex gap-2"><span>•</span><span>{textoFormatado(linha.slice(2))}</span></div>;
        if (/^\d+\.\s/.test(linha)) return <div key={indice} className="pl-1">{textoFormatado(linha)}</div>;
        return <p key={indice}>{textoFormatado(linha)}</p>;
      })}
    </div>
  );
}

export default function ChatMentor() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [mensagem, setMensagem] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carregandoHistorico, setCarregandoHistorico] = useState(true);
  const [trilhas, setTrilhas] = useState([]);
  const [trilhaId, setTrilhaId] = useState("");
  const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const carregar = async () => {
      const [resChat, resTrilhas] = await Promise.all([
        chatService.historico(),
        trilhaService.listar(),
      ]);

      if (resTrilhas.status === "SUCESSO") {
        setTrilhas(resTrilhas.trilhas);
        if (resTrilhas.trilhas.length > 0) setTrilhaId((atual) => atual || String(resTrilhas.trilhas[0].id));
      }

      if (resChat.status === "SUCESSO") {
        const msgs = (resChat.interacoes || []).flatMap((i) => [
          { id: `p-${i.id}`, tipo: "user", texto: i.pergunta },
          { id: `r-${i.id}`, tipo: "assistant", texto: i.resposta },
        ]);
        setChat(msgs);
      }

      setCarregandoHistorico(false);
    };
    carregar();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const enviarMensagem = async (texto) => {
    if (!texto.trim() || loading) return;

    const novaMsg = { id: Date.now(), tipo: "user", texto };
    setChat((prev) => [...prev, novaMsg]);
    setMensagem("");
    setLoading(true);

    try {
      const res = await chatService.perguntar(texto, trilhaId ? Number(trilhaId) : null);

      setChat((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          tipo: "assistant",
          texto: res.resposta || res.mensagem || "Desculpe, nao consegui responder agora.",
        },
      ]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          tipo: "assistant",
          texto: "Nao foi possivel processar sua mensagem agora. Tente novamente em instantes.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const dados = JSON.parse(localStorage.getItem("dadosDeSessao") || "{}");
  const inicial = dados.nome ? dados.nome.charAt(0).toUpperCase() : "U";

  const limparChat = async () => {
    const res = await chatService.limparHistorico();
    if (res.status === "SUCESSO") {
      setChat([]);
    }
    setConfirmarLimpeza(false);
  };

  return (
    <LayoutWrapper>
      <div className="w-full">
        <div className="mentor-card p-8">
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <div className="flex-1"><ButtonBack label="MentorIA" /></div>
            {chat.length > 0 && (
              <Button variant="danger" className="min-h-0 py-2 px-3 text-xs" onClick={() => setConfirmarLimpeza(true)}>Limpar conversa</Button>
            )}
          </div>

          <div className="py-3">
            <select
              className="mentor-select w-full px-5 font-poppins text-sm outline-none"
              value={trilhaId}
              onChange={(e) => setTrilhaId(e.target.value)}
            >
              <option value="">Conversa geral (sem trilha)</option>
              {trilhas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} — {t.nvl}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 p-6 space-y-5 max-h-[520px] overflow-y-auto rounded-[20px]" style={{ backgroundColor: "#f1f2f6", border: "1px solid #c7c9cf" }}>
            {carregandoHistorico ? (
              <p className="font-poppins text-sm text-center" style={{ color: colors.grey }}>
                Carregando...
              </p>
            ) : chat.length === 0 ? (
              <div className="text-center space-y-2">
                <p className="font-poppins text-sm" style={{ color: colors.grey }}>
                  Escolha uma trilha ou use um dos atalhos abaixo para receber uma orientação prática.
                </p>
                <p className="font-poppins text-xs" style={{ color: colors.grey }}>
                  O Mentor IA vai usar o contexto da trilha e do seu historico para responder com mais relevancia.
                </p>
              </div>
            ) : (
              chat.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.tipo === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {msg.tipo === "assistant" && (
                    <div className="flex-shrink-0">
                      <IoChatbubbleEllipses size={32} color={colors.blue} />
                    </div>
                  )}
                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 ${
                      msg.tipo === "user"
                        ? "rounded-br-none"
                        : "rounded-bl-none"
                    }`}
                    style={{
                      backgroundColor: msg.tipo === "user" ? colors.blue : "#fff",
                      color: msg.tipo === "user" ? "white" : colors.blue,
                      border: msg.tipo === "user" ? "none" : "1px solid #c7c9cf",
                    }}
                  >
                    <MensagemChat texto={msg.texto} />
                  </div>
                  {msg.tipo === "user" && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-poppins-bold text-sm"
                      style={{
                        backgroundColor: colors["light-grey"],
                        color: colors.grey,
                      }}
                    >
                      {inicial}
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <p className="font-poppins text-sm text-center" style={{ color: colors.grey }}>
                Mentor IA esta pensando...
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-3 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
            <input
              className="mentor-input flex-1 px-5 py-3 font-poppins text-sm outline-none"
              style={{ border: `1px solid ${colors["light-grey"]}`, backgroundColor: colors.card, color: colors.grey }}
              placeholder="Digite aqui..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarMensagem(mensagem)}
              disabled={loading}
            />
            <Button
              className="text-sm"
              onClick={() => enviarMensagem(mensagem)}
              disabled={loading || !mensagem.trim()}
            >Enviar</Button>
          </div>
        </div>

        <ConfirmDialog
          aberto={confirmarLimpeza}
          titulo="Limpar conversa"
          mensagem="Todo o histórico do chat será apagado e não poderá ser recuperado."
          confirmarTexto="Limpar conversa"
          onCancelar={() => setConfirmarLimpeza(false)}
          onConfirmar={limparChat}
        />

        <div className="flex gap-4 mt-6">
          {acoesRapidas.map((acao, i) => (
            <Button
              key={i}
              variant="navy"
              className="flex-1 py-3 px-4 text-base flex items-center justify-center gap-2"
              onClick={() => enviarMensagem(acao.acao)}
              disabled={loading}
            >{acao.texto} <LuChevronRight size={20} strokeWidth={3} /></Button>
          ))}
        </div>
      </div>
    </LayoutWrapper>
  );
}
