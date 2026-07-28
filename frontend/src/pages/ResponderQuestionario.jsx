import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";
import { trilhaService } from "../services/trilhaService";
import ButtonBack from "../components/ButtonBack";
import Button from "../components/Button";

export default function ResponderQuestionario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [questoes, setQuestoes] = useState([]);
  const [respostas, setRespostas] = useState({});
  const [atual, setAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    const carregar = async () => {
      const res = await trilhaService.gerarQuestionario(id);
      if (res.status === "SUCESSO" && res.questoes?.length) setQuestoes(res.questoes);
      else setErro(res.mensagem || "Não foi possível gerar a avaliação.");
      setLoading(false);
    };
    carregar();
  }, [id]);

  const selecionar = (indice) => setRespostas((prev) => ({ ...prev, [atual]: indice }));
  const voltar = () => atual > 0 ? setAtual(atual - 1) : navigate("/adicionar-trilha");

  const avancar = async () => {
    if (respostas[atual] === undefined) return;
    if (atual < questoes.length - 1) return setAtual(atual + 1);

    setEnviando(true);
    const respostasArray = questoes.map((q, indice) => ({
      enunciado: q.enunciado,
      resposta: q.opcoes[respostas[indice]] || "",
      correta: respostas[indice] === q.resposta_correta,
    }));
    const res = await trilhaService.responderQuestionario(id, respostasArray);
    if (res.status === "SUCESSO") setResultado(res);
    else { setErro(res.mensagem || "Não foi possível criar seu plano de estudos."); setEnviando(false); }
  };

  const questao = questoes[atual];
  const progresso = questoes.length ? ((atual + 1) / questoes.length) * 100 : 0;

  return <LayoutWrapper>
    <div className="w-full">
      <section className="mentor-card p-8 min-h-[650px]">
        <div className="border-b border-[#c7c9cf] pb-5"><ButtonBack label="Avaliação de Nível" fallback="/adicionar-trilha" /></div>
        <p className="font-poppins text-sm mt-5" style={{ color: colors.blue }}>Responda às questões para personalizarmos sua trilha de estudos.</p>
        {loading ? <p className="font-poppins mt-16" style={{ color: colors.grey }}>Preparando sua avaliação...</p> : erro ? <p className="font-poppins mt-8 text-red-500">{erro}</p> : resultado ? <div className="mt-12 max-w-2xl rounded-[20px] border border-[#c7c9cf] bg-white p-9 text-center">
          <p className="font-poppins text-lg" style={{ color: colors.blue }}>Avaliação concluída</p>
          <p className="font-poppins-bold text-6xl mt-4" style={{ color: colors.blue }}>{resultado.nota?.toFixed(1)}</p>
          <p className="font-poppins text-base mt-2" style={{ color: colors.grey }}>de 10 pontos - {resultado.acertos}/{resultado.total} acertos</p>
          <p className="font-poppins-bold text-lg mt-3 capitalize" style={{ color: colors.blue }}>Nível definido: {resultado.nivel}</p>
          <Button className="mt-8" onClick={() => navigate("/minhas-trilhas", { state: { trilhaId: Number(id), planoCriado: true } })}>Ver meu plano de estudos</Button>
        </div> : <>
          <div className="flex items-center gap-3 mt-8">
            <div className="h-2 flex-1 bg-[#d9d9d9] overflow-hidden"><div className="h-full bg-[#143e78] transition-all" style={{ width: `${progresso}%` }} /></div>
            <span className="font-poppins-bold text-sm" style={{ color: colors.blue }}>{atual + 1}/{questoes.length}</span>
          </div>
          <div className="bg-white border border-[#c7c9cf] rounded-[20px] p-7 mt-10">
            <div className="flex items-start justify-between gap-5 pb-4 border-b border-[#c7c9cf]">
              <h2 className="font-poppins-bold text-2xl" style={{ color: colors.blue }}>{questao?.enunciado}</h2>
              <span className="shrink-0 rounded-full px-5 py-2 text-xs font-poppins-bold text-white" style={{ backgroundColor: colors.blue }}>Nível {questao?.nivel_dificuldade || "iniciante"}</span>
            </div>
            <div className="space-y-3 py-6">
              {(questao?.opcoes || []).map((opcao, indice) => <label key={indice} className="flex items-center gap-3 cursor-pointer font-poppins text-base" style={{ color: colors.blue }}>
                <input type="radio" name={`questao-${atual}`} checked={respostas[atual] === indice} onChange={() => selecionar(indice)} className="w-5 h-5 accent-[#143e78]" />
                {opcao}
              </label>)}
            </div>
            <div className="pt-6 border-t border-[#c7c9cf] flex justify-end gap-4">
              <button className="mentor-secondary cursor-pointer" onClick={voltar}>Voltar</button>
              <button className="mentor-primary cursor-pointer disabled:opacity-50" disabled={respostas[atual] === undefined || enviando} onClick={avancar}>{enviando ? "Criando trilha..." : atual === questoes.length - 1 ? "Criar trilha" : "Próximo"}</button>
            </div>
          </div>
        </>}
      </section>
    </div>
  </LayoutWrapper>;
}
