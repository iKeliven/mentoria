import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";
import { avaliacaoService } from "../services/avaliacaoService";
import { trilhaService } from "../services/trilhaService";
import ButtonBack from "../components/ButtonBack";

export default function AvaliacaoNivel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [questoes, setQuestoes] = useState([]);
  const [idAvaliacao, setIdAvaliacao] = useState(null);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const iniciar = async () => {
      const resTrilhas = await trilhaService.listar();
      if (resTrilhas.status !== "SUCESSO" || resTrilhas.trilhas.length === 0) {
        setErro("Nenhuma trilha encontrada. Crie uma primeiro.");
        setLoading(false);
        return;
      }

      const trilhaDaAvaliacao = Number(searchParams.get("trilha"));
      const idTrilha = resTrilhas.trilhas.find((trilha) => trilha.id === trilhaDaAvaliacao)?.id || resTrilhas.trilhas[0].id;
      const tipo = searchParams.get("tipo") === "progresso" ? "progresso" : "diagnostica";
      const res = await avaliacaoService.gerar(idTrilha, tipo);

      if (res.status === "SUCESSO") {
        setQuestoes(res.questoes);
        setIdAvaliacao(res.id_avaliacao);
        setErro("");
      } else {
        setErro(res.mensagem || "Não foi possível gerar a avaliação agora. Tente novamente.");
      }
      setLoading(false);
    };
    iniciar();
  }, [searchParams]);

  const total = questoes.length;
  const questao = questoes[perguntaAtual];
  const progressoPercent = total > 0 ? ((perguntaAtual + 1) / total) * 100 : 0;

  const selecionar = (idx) => {
    setRespostas({ ...respostas, [perguntaAtual]: idx });
  };

  const proxima = async () => {
    if (respostas[perguntaAtual] === undefined) return;

    if (perguntaAtual < total - 1) {
      setPerguntaAtual(perguntaAtual + 1);
    } else {
      setEnviando(true);
      const respostasArray = Object.entries(respostas).map(([idx, resposta]) => ({
        id_questao: questoes[Number(idx)].id,
        resposta,
      }));

      const res = await avaliacaoService.responder(
        idAvaliacao,
        respostasArray
      );

      if (res.status === "SUCESSO") {
        setResultado(res);
      } else {
        setErro("Erro ao enviar respostas");
      }
      setEnviando(false);
    }
  };

  const voltar = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(perguntaAtual - 1);
    } else {
      navigate("/minhas-trilhas");
    }
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="w-full text-center py-20">
          <p className="font-poppins text-lg" style={{ color: colors.grey }}>
            Gerando avaliacao com IA...
          </p>
        </div>
      </LayoutWrapper>
    );
  }

  if (erro) {
    return (
      <LayoutWrapper>
        <div className="w-full text-center py-20">
          <p className="font-poppins text-sm text-red-500">{erro}</p>
          <button
            className="mt-4 py-2 px-6 rounded-lg font-poppins-bold text-sm cursor-pointer"
            style={{ border: `1px solid ${colors.blue}`, color: colors.blue, backgroundColor: "transparent" }}
            onClick={() => navigate("/minhas-trilhas")}
          >
            Voltar
          </button>
        </div>
      </LayoutWrapper>
    );
  }

  if (resultado) {
    return (
      <LayoutWrapper>
        <div className="w-full">
          <div className="rounded-2xl shadow-sm p-6 text-center" style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}>
            <h2
              className="font-poppins-bold text-lg pb-4"
              style={{ color: colors.blue }}
            >
              {searchParams.get("tipo") === "progresso" ? "Resultado da Avaliação de Progresso" : "Resultado da Avaliação"}
            </h2>

            <div className="py-8">
              <p
                className="font-poppins-bold text-5xl"
                style={{ color: colors.blue }}
              >
                {resultado.nota?.toFixed(1) || "0.0"}
              </p>
              <p className="font-poppins text-sm mt-2" style={{ color: colors.grey }}>
                de 10.0
              </p>
            </div>

            <p className="font-poppins text-base mb-2" style={{ color: colors.blue }}>
              Acertos: {resultado.acertos}/{resultado.total}
            </p>
            <p className="font-poppins text-base mb-6" style={{ color: colors.blue }}>
              Nivel: <span className="font-poppins-bold capitalize">{resultado.nivel}</span>
            </p>

            <button
              className="py-2 px-6 rounded-lg font-poppins-bold text-sm cursor-pointer border-none"
              style={{ backgroundColor: colors.orange, color: "white" }}
              onClick={() => navigate("/minhas-trilhas")}
            >
              Ver meus planos de estudos
            </button>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="w-full">
        <section className="mentor-card p-8 min-h-[650px]">
          <div className="border-b border-[#c7c9cf] pb-5"><ButtonBack label="Avaliação de Nível" fallback="/minhas-trilhas" /></div>

          <p className="font-poppins text-sm mt-5" style={{ color: colors.blue }}>
            {searchParams.get("tipo") === "progresso"
              ? "Responda às questões para verificarmos sua evolução na trilha."
              : "Responda às questões para entendermos seu nível atual e personalizarmos sua jornada."}
          </p>

          <div className="flex items-center gap-3 mt-8">
            <div className="h-2 flex-1 bg-[#d9d9d9] overflow-hidden">
              <div
                className="h-full bg-[#143e78] transition-all"
                style={{ width: `${progressoPercent}%`, backgroundColor: colors.blue }}
              />
            </div>
            <span className="font-poppins-bold text-sm" style={{ color: colors.blue }}>
              {perguntaAtual + 1}/{total}
            </span>
          </div>

          <div className="bg-white border border-[#c7c9cf] rounded-[20px] p-7 mt-10">
            <div className="flex items-start justify-between gap-5 pb-4 border-b border-[#c7c9cf]">
              <h2 className="font-poppins-bold text-2xl" style={{ color: colors.blue }}>
                {questao?.enunciado}
              </h2>
              <span
                className="shrink-0 rounded-full px-5 py-2 text-xs font-poppins-bold text-white"
                style={{ backgroundColor: colors.blue }}
              >
                Nível {questao?.nivel || "iniciante"}
              </span>
            </div>

            <div className="space-y-3 py-6">
              {(questao?.opcoes || []).map((opcao, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 cursor-pointer font-poppins text-base"
                  style={{
                    color: colors.blue,
                  }}
                >
                  <input
                    type="radio"
                    name={`questao-${perguntaAtual}`}
                    checked={respostas[perguntaAtual] === idx}
                    onChange={() => selecionar(idx)}
                    className="w-5 h-5 accent-[#143e78]"
                  />
                  {opcao}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-[#c7c9cf]">
            <button
              className="mentor-secondary cursor-pointer"
              onClick={voltar}
            >
              Voltar
            </button>
            <button
              className="mentor-primary cursor-pointer disabled:opacity-50"
              onClick={proxima}
              disabled={respostas[perguntaAtual] === undefined || enviando}
            >
              {enviando
                ? "Enviando..."
                : perguntaAtual < total - 1
                  ? "Proximo"
                  : "Finalizar"}
            </button>
          </div>
        </section>
      </div>
    </LayoutWrapper>
  );
}
