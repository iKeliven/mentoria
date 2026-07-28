import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";
import MentoriaIA from "../components/MentoriaIA";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";
import { trilhaService } from "../services/trilhaService";
import ButtonBack from "../components/ButtonBack";
import { LuChevronDown, LuChevronUp, LuCircleCheck, LuClock3 } from "react-icons/lu";
import ConfirmDialog from "../components/ConfirmDialog";

export default function MinhasTrilhas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [trilhas, setTrilhas] = useState([]);
  const [trilhaId, setTrilhaId] = useState("");
  const [trilhaSelecionada, setTrilhaSelecionada] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [planoAberto, setPlanoAberto] = useState(true);
  const [loading, setLoading] = useState(true);
  const [statusModulos, setStatusModulos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mentorIaStatusAtividades") || "{}");
    } catch {
      return {};
    }
  });
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  useEffect(() => {
    localStorage.setItem("mentorIaStatusAtividades", JSON.stringify(statusModulos));
  }, [statusModulos]);

  const carregarTrilhas = async () => {
    const res = await trilhaService.listar();
    if (res.status === "SUCESSO") {
      setTrilhas(res.trilhas);
      const trilhaRecemCriada = res.trilhas.find((trilha) => trilha.id === location.state?.trilhaId);
      if (trilhaRecemCriada) {
        setTrilhaId(String(trilhaRecemCriada.id));
        setTrilhaSelecionada(trilhaRecemCriada);
      } else if (res.trilhas.length > 0 && !trilhaId) {
        setTrilhaId(String(res.trilhas[0].id));
        setTrilhaSelecionada(res.trilhas[0]);
      } else if (res.trilhas.length > 0) {
        const atualizada = res.trilhas.find((t) => String(t.id) === trilhaId);
        if (atualizada) {
          setTrilhaSelecionada(atualizada);
        } else {
          setTrilhaId(String(res.trilhas[0].id));
          setTrilhaSelecionada(res.trilhas[0]);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarTrilhas();
  }, []);

  useEffect(() => {
    const t = trilhas.find((tr) => String(tr.id) === trilhaId);
    setTrilhaSelecionada(t || null);
    setAbaAtiva(0);
  }, [trilhaId, trilhas]);

  const excluirTrilha = async () => {
    if (!trilhaSelecionada) return;
    const res = await trilhaService.excluir(trilhaSelecionada.id);
    if (res.status === "SUCESSO") {
      setTrilhas((prev) => prev.filter((t) => t.id !== trilhaSelecionada.id));
      setTrilhaId("");
      setTrilhaSelecionada(null);
    }
    setConfirmarExclusao(false);
  };

  const proximoStatus = (id) => {
    setStatusModulos((atual) => {
      const status = atual[id] || "nao_iniciado";
      const proximo = status === "nao_iniciado" ? "em_andamento" : status === "em_andamento" ? "finalizado" : "nao_iniciado";
      return { ...atual, [id]: proximo };
    });
  };

  const dadosStatus = (id) => {
    const status = statusModulos[id] || "nao_iniciado";
    return status === "finalizado"
      ? { texto: "Finalizado", acao: "Reiniciar", cor: "#50b5a3" }
      : status === "em_andamento"
        ? { texto: "Em andamento", acao: "Finalizar", cor: colors.blue }
        : { texto: "Não iniciado", acao: "Iniciar", cor: "#7b8494" };
  };

  const aulasDoModulo = (conteudo) => {
    const atividadesDaIA = Array.from(
      conteudo.conteudo_html?.matchAll(/<li[^>]*>\s*(.*?)\s*(?:—|-)\s*(\d{1,3})\s*min\s*<\/li>/gi) || []
    ).map(([, titulo, minutos]) => ({ titulo: titulo.replace(/<[^>]+>/g, '').trim(), duracao: `${minutos} min` }));
    if (atividadesDaIA.length) return atividadesDaIA;
    const titulo = conteudo.titulo_aba.toLowerCase();
    const tema = `${trilhaSelecionada?.nome || ''} ${trilhaSelecionada?.area || ''}`.toLowerCase();
    const bancoDeDados = tema.includes("banco") || tema.includes("dados");
    if (bancoDeDados && titulo.includes("fundamento")) return [{ titulo: "Modelagem de dados", duracao: "45 min" }, { titulo: "Tabelas, colunas e tipos de dados", duracao: "35 min" }, { titulo: "Chaves primárias e estrangeiras", duracao: "40 min" }];
    if (bancoDeDados && (titulo.includes("prática") || titulo.includes("pratica"))) return [{ titulo: "Consultas SQL com SELECT e WHERE", duracao: "45 min" }, { titulo: "Relacionamentos e JOIN", duracao: "60 min" }, { titulo: "Inserir e atualizar registros", duracao: "50 min" }];
    if (bancoDeDados && titulo.includes("projeto")) return [{ titulo: "Modelar um banco de dados", duracao: "60 min" }, { titulo: "Criar tabelas no PostgreSQL", duracao: "75 min" }, { titulo: "Gerar consultas de relatório", duracao: "60 min" }];
    if (titulo.includes("fundamento")) return [
      { titulo: "Tags HTML e estrutura da página", duracao: "30 min" },
      { titulo: "O que é linguagem semântica", duracao: "45 min" },
      { titulo: "Textos, links e listas", duracao: "35 min" },
    ];
    if (titulo.includes("prática") || titulo.includes("pratica")) return [
      { titulo: "Criar uma página de apresentação", duracao: "60 min" },
      { titulo: "Aplicar estilos básicos com CSS", duracao: "50 min" },
      { titulo: "Revisar e corrigir erros do exercício", duracao: "40 min" },
    ];
    if (titulo.includes("projeto")) return [
      { titulo: "Planejar o projeto final", duracao: "45 min" },
      { titulo: "Construir a primeira versão", duracao: "90 min" },
      { titulo: "Revisar e publicar o projeto", duracao: "45 min" },
    ];
    return [
      { titulo: `Introdução a ${conteudo.titulo_aba}`, duracao: "30 min" },
      { titulo: `Prática guiada de ${conteudo.titulo_aba}`, duracao: "50 min" },
      { titulo: `Revisão de ${conteudo.titulo_aba}`, duracao: "35 min" },
    ];
  };

  const conteudos = trilhaSelecionada?.ConteudoTrilhas || [];
  const abaAtual = conteudos[abaAtiva] || null;

  return (
    <LayoutWrapper>
      <div className="flex gap-8 items-start">
        <div className="mentor-card p-8 flex-1 min-w-0">
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <div className="flex-1"><ButtonBack label="Minha trilha" /></div>
            <div className="flex gap-2">
              {trilhaSelecionada && (
                <button
                  className="py-1 px-3 rounded-lg font-poppins-bold text-xs cursor-pointer border-none"
                  style={{ backgroundColor: "#dc2626", color: "white" }}
                  onClick={() => setConfirmarExclusao(true)}
                >
                  Excluir
                </button>
              )}
              <button
                className="py-1 px-3 rounded-lg font-poppins-bold text-xs cursor-pointer border-none"
                style={{ backgroundColor: colors.orange, color: "white" }}
                onClick={() => navigate("/adicionar-trilha")}
              >
                Adicionar Nova
              </button>
            </div>
          </div>

          {loading ? (
            <p className="font-poppins text-sm mt-4" style={{ color: colors.grey }}>
              Carregando...
            </p>
          ) : trilhas.length === 0 ? (
            <p className="font-poppins text-sm mt-4" style={{ color: colors.grey }}>
              Nenhuma trilha disponivel. Clique em "Adicionar Nova" para criar.
            </p>
          ) : (
            <>
              <div className="py-4">
                <p className="font-poppins-bold text-sm mb-2" style={{ color: colors.blue }}>
                  Selecione sua trilha
                </p>
                <select
                  className="w-full rounded-xl px-4 py-2 font-poppins text-sm outline-none"
                  style={{ border: `1px solid ${colors["light-grey"]}`, color: colors.grey, backgroundColor: colors.card }}
                  value={trilhaId}
                  onChange={(e) => setTrilhaId(e.target.value)}
                >
                  {trilhas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} — {t.nvl}
                    </option>
                  ))}
                </select>
              </div>

              {conteudos.length > 0 && (
                <>
                  <div className="mt-5 pt-7" style={{ borderTop: "1px solid #c7c9cf" }}>
                    <h3 className="font-poppins-bold text-2xl" style={{ color: colors.blue }}>Meus planos de estudos</h3>
                  </div>

                  <div className="mt-5 rounded-[20px] p-6" style={{ backgroundColor: "#eef0f5", border: "1px solid #c7c9cf" }}>
                    <button className="w-full flex items-center justify-between gap-4 pb-5 text-left bg-transparent border-0 cursor-pointer" style={{ borderBottom: "1px solid #c7c9cf" }} onClick={() => setPlanoAberto((aberto) => !aberto)}>
                      <div className="flex items-center gap-3">
                        {planoAberto ? <LuChevronUp size={28} color={colors.blue} /> : <LuChevronDown size={28} color={colors.blue} />}
                        <div><h4 className="font-poppins-bold text-xl" style={{ color: colors.blue }}>{trilhaSelecionada.nome}</h4>
                        <p className="font-poppins text-sm mt-2" style={{ color: colors.blue }}>{trilhaSelecionada.descricao}</p>
                        </div>
                      </div>
                      <span className="rounded-full px-5 py-2 font-poppins-bold text-xs text-white capitalize" style={{ backgroundColor: colors.blue }}>Nível {trilhaSelecionada.nvl}</span>
                    </button>
                    {planoAberto && trilhaSelecionada.nota_avaliacao !== null && trilhaSelecionada.nota_avaliacao !== undefined && (
                      <div className="mt-5 rounded-xl bg-white p-4 flex items-center justify-between" style={{ border: "1px solid #c7c9cf" }}>
                        <span className="font-poppins-bold" style={{ color: colors.blue }}>Resultado da avaliação</span>
                        <span className="font-poppins-bold text-xl" style={{ color: colors.blue }}>{Number(trilhaSelecionada.nota_avaliacao).toFixed(1)}/10 <small className="font-poppins text-sm">({trilhaSelecionada.acertos_avaliacao}/{trilhaSelecionada.total_avaliacao} acertos)</small></span>
                      </div>
                    )}
                    {planoAberto && <div className="mt-5 space-y-5">
                      {conteudos.map((conteudo, index) => {
                        const aberto = abaAtiva === index;
                        const aulas = aulasDoModulo(conteudo);
                        return <section key={conteudo.id} className="rounded-[18px] bg-white" style={{ border: "1px solid #c7c9cf" }}>
                          <button className="w-full flex items-center gap-3 p-5 text-left bg-transparent border-0 cursor-pointer" onClick={() => setAbaAtiva(aberto ? -1 : index)}>
                            {aberto ? <LuChevronUp size={25} color={colors.blue} /> : <LuChevronDown size={25} color={colors.blue} />}
                            <span className="font-poppins-bold text-lg" style={{ color: colors.blue }}>{index + 1}: <span className="font-poppins font-normal">{conteudo.titulo_aba}</span></span>
                          </button>
                          {aberto && <div className="px-5 pb-5">
                            <div className="py-4 font-poppins text-sm leading-relaxed" style={{ color: colors.blue }} dangerouslySetInnerHTML={{ __html: conteudo.conteudo_html }} />
                            <div className="border-t border-[#d3d3d3]">
                              {aulas.map((aula, indice) => {
                                const idAula = `${conteudo.id}-${indice}`;
                                const status = dadosStatus(idAula);
                                return <div key={idAula} className="flex items-center gap-3 py-4 border-b border-[#d3d3d3]">
                                  <LuCircleCheck size={26} color={status.cor} />
                                  <p className="flex-1 font-poppins-bold text-sm" style={{ color: colors.blue }}>{aula.titulo}</p>
                                  <span className="hidden sm:flex items-center gap-2 font-poppins text-xs whitespace-nowrap" style={{ color: colors.blue }}><LuClock3 /> {aula.duracao}</span>
                                  <button className="min-h-0 py-2 px-4 rounded-xl font-poppins-bold text-xs text-white border-0 cursor-pointer" style={{ backgroundColor: status.cor }} onClick={() => proximoStatus(idAula)}>{status.acao}</button>
                                </div>;
                              })}
                            </div>
                          </div>}
                        </section>;
                      })}
                      <div className="pt-3 flex justify-end">
                        <button className="mentor-primary" onClick={() => navigate(`/avaliacao-nivel?trilha=${trilhaSelecionada.id}&tipo=progresso`)}>
                          Concluir plano de estudos
                        </button>
                      </div>
                    </div>}
                  </div>
                </>
              )}

              {conteudos.length === 0 && trilhaSelecionada && (
                <p className="font-poppins text-sm mt-4" style={{ color: colors.grey }}>
                  Esta trilha ainda nao possui conteudo. Responda ao questionario para gerar o plano de aprendizado.
                </p>
              )}

              <div style={{ borderBottom: `1px solid ${colors.border}` }} />

              <div className="flex justify-end gap-4 pt-6">
                <button
                  className="py-2 px-6 rounded-lg font-poppins-bold text-sm cursor-pointer"
                  style={{
                    border: `1px solid ${colors.blue}`,
                    color: colors.blue,
                    backgroundColor: "transparent",
                  }}
                  onClick={() => navigate("/inicio")}
                >
                  Voltar
                </button>
              </div>
            </>
          )}
        </div>

        <div className="w-[32%] min-w-[320px] shrink-0">
          <MentoriaIA />
        </div>
      </div>
      <ConfirmDialog
        aberto={confirmarExclusao}
        titulo="Excluir trilha"
        mensagem={`A trilha “${trilhaSelecionada?.nome || ""}” e todo o plano associado serão removidos. Esta ação não pode ser desfeita.`}
        confirmarTexto="Excluir trilha"
        onCancelar={() => setConfirmarExclusao(false)}
        onConfirmar={excluirTrilha}
      />
    </LayoutWrapper>
  );
}
