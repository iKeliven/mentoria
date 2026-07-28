import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";
import MentoriaIA from "../components/MentoriaIA";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";
import { trilhaService } from "../services/trilhaService";

function atividadesDoPlano(trilhas) {
  return trilhas.flatMap((trilha) => (trilha.ConteudoTrilhas || []).flatMap((conteudo) => {
    const itens = Array.from(conteudo.conteudo_html?.matchAll(/<li[^>]*>(.*?)<\/li>/gi) || []);
    return itens.map(([, texto], indice) => {
      const limpo = texto.replace(/<[^>]+>/g, "").trim();
      const duracao = limpo.match(/(?:—|-)\s*(\d{1,3})\s*min/i);
      return ({
      id: `${conteudo.id}-${indice}`,
      titulo: limpo.replace(/\s*(?:—|-)\s*\d{1,3}\s*min/i, ""),
      duracao: duracao ? `${duracao[1]} min` : "30 min",
      trilha: trilha.nome,
      modulo: conteudo.titulo_aba,
      });
    });
  }));
}

export default function Inicio() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusAtividades, setStatusAtividades] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mentorIaStatusAtividades") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const carregar = async () => {
      const res = await trilhaService.listar();
      if (res.status === "SUCESSO") {
        setAtividades(atividadesDoPlano(res.trilhas || []));
      }
      setLoading(false);
    };
    carregar();
  }, []);

  const iniciarAtividade = (atividade) => {
    const proximo = { ...statusAtividades, [atividade.id]: "em_andamento" };
    setStatusAtividades(proximo);
    localStorage.setItem("mentorIaStatusAtividades", JSON.stringify(proximo));
    navigate("/minhas-trilhas");
  };

  const proximasAtividades = atividades
    .filter((atividade) => (statusAtividades[atividade.id] || "nao_iniciado") !== "finalizado")
    .sort((a, b) => {
      const peso = (atividade) => statusAtividades[atividade.id] === "em_andamento" ? 0 : 1;
      return peso(a) - peso(b);
    })
    .slice(0, 3);

  return (
    <LayoutWrapper>
      <div className="flex w-full gap-8 items-start">
        <div className="mentor-card p-8 flex-1 min-w-0">
          <h2
            className="mentor-title font-poppins-bold pb-5"
          >
            O que estudar hoje
          </h2>

          {loading ? (
            <p className="font-poppins text-sm mt-4" style={{ color: colors.grey }}>
              Carregando...
            </p>
          ) : proximasAtividades.length === 0 ? (
            <div className="py-6 text-center">
              <p className="font-poppins text-sm" style={{ color: colors.grey }}>
                Nenhuma atividade pendente no plano. Va em{" "}
                <button
                  className="font-poppins-bold underline bg-transparent border-none cursor-pointer"
                  style={{ color: colors.blue }}
                  onClick={() => navigate("/minhas-trilhas")}
                >
                  Minhas trilhas
                </button>{" "}
                para criar uma trilha ou concluir a avaliação de nível.
              </p>
            </div>
          ) : (
            proximasAtividades.map((atividade, i) => {
              const status = statusAtividades[atividade.id] || "nao_iniciado";
              const emAndamento = status === "em_andamento";
              return <div key={atividade.id}>
                <div className="flex items-center justify-between gap-5 py-5">
                  <div className="flex-1">
                    <p
                      className="font-poppins-bold text-sm"
                      style={{ color: colors.blue }}
                    >
                      {atividade.titulo}
                    </p>
                    <p className="font-poppins text-xs mt-1" style={{ color: colors.blue }}>
                      {atividade.trilha} · {atividade.modulo} · {atividade.duracao}
                    </p>
                  </div>
                  <button
                    className="mentor-primary shrink-0 min-h-0 py-2 px-6 text-xs cursor-pointer"
                    style={{ backgroundColor: emAndamento ? colors.blue : colors.orange, color: "white" }}
                    onClick={() => iniciarAtividade(atividade)}
                  >
                    {emAndamento ? "Continuar" : "Iniciar"}
                  </button>
                </div>
                <span className="inline-flex mb-2 rounded-full px-3 py-1 font-poppins-bold text-[11px] text-white" style={{ backgroundColor: emAndamento ? colors.blue : "#7b8494" }}>
                  {emAndamento ? "Em andamento" : "Não iniciado"}
                </span>
                {i < proximasAtividades.length - 1 && <div style={{ borderBottom: `1px solid ${colors.border}` }} />}
              </div>;
            })
          )}
        </div>

        <div className="w-[32%] min-w-[320px] shrink-0">
          <MentoriaIA />
        </div>
      </div>
    </LayoutWrapper>
  );
}
