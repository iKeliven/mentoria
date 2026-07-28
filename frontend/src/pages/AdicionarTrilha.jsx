import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";
import { trilhaService } from "../services/trilhaService";
import ButtonBack from "../components/ButtonBack";

export default function AdicionarTrilha() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const nvl = "iniciante";
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const trilhasPredefinidas = [
    { nome: "Lógica de Programação", area: "Fundamentos de programação", descricao: "Aprenda lógica, algoritmos, variáveis, condições e estruturas de repetição." },
    { nome: "Desenvolvimento Front-end", area: "Desenvolvimento web", descricao: "Aprenda a criar interfaces para a web com HTML, CSS, JavaScript e React." },
    { nome: "Desenvolvimento Back-end", area: "Desenvolvimento de APIs", descricao: "Aprenda Node.js, APIs REST, autenticação, bancos de dados e boas práticas de servidor." },
    { nome: "Banco de Dados", area: "Dados e persistência", descricao: "Aprenda modelagem de dados, SQL, PostgreSQL, consultas e relacionamentos." },
    { nome: "Python", area: "Programação com Python", descricao: "Aprenda fundamentos de Python, estruturas de dados, funções e automação." },
    { nome: "React", area: "Front-end com React", descricao: "Aprenda componentes, estados, props, hooks, rotas e integração com APIs usando React." },
  ];

  const selecionarTrilha = (nomeSelecionado) => {
    const trilha = trilhasPredefinidas.find((item) => item.nome === nomeSelecionado);
    setNome(nomeSelecionado);
    if (trilha) setDescricao(trilha.descricao);
  };

  const iniciarAvaliacao = async () => {
    if (!nome) {
      setErro("Selecione uma trilha para continuar");
      return;
    }

    setLoading(true);
    setErro("");

    const trilhaSelecionada = trilhasPredefinidas.find((trilha) => trilha.nome === nome);
    const res = await trilhaService.criar({
      nome,
      area: trilhaSelecionada?.area || descricao,
      nvl,
      descricao,
    });

    if (res.status === "SUCESSO") {
      navigate(`/responder-questionario/${res.trilha.id}`);
    } else {
      setErro("Erro ao criar trilha");
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="flex w-full gap-8 items-start">
        <div className="mentor-card p-8 flex-1 min-w-0">
          <div className="pb-4" style={{ borderBottom: `1px solid ${colors.border}` }}><ButtonBack label="Minha trilha" fallback="/minhas-trilhas" /></div>

          {erro && (
            <p className="font-poppins text-sm text-red-500 mt-4">{erro}</p>
          )}

          <div className="space-y-6 mt-6">
            <div>
              <p className="font-poppins px-5 mb-1" style={{ color: colors.grey }}>Nome da trilha</p>
              <select
                className="mentor-input w-full h-[45px] px-5 font-poppins outline-none"
                value={nome}
                onChange={(e) => selecionarTrilha(e.target.value)}
              >
                <option value="">Selecione uma trilha</option>
                {trilhasPredefinidas.map((trilha) => (
                  <option key={trilha.nome} value={trilha.nome}>{trilha.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="font-poppins-bold" style={{ color: colors.blue }}>Avaliação de nível</p>
              <p className="font-poppins text-sm mt-2" style={{ color: colors.grey }}>Você responderá 20 questões progressivas. O nível será calculado automaticamente pela sua nota.</p>
            </div>
          </div>

          <div className="mt-7 pt-6 flex items-center justify-between" style={{ borderTop: "1px solid #c7c9cf" }}>
            <p className="font-poppins text-sm" style={{ color: colors.grey }}>Próximo passo: responder uma avaliação rápida.</p>
            <div className="flex gap-4">
            <button
              className="py-2 px-6 rounded-lg font-poppins-bold text-sm cursor-pointer"
              style={{
                border: `1px solid ${colors.blue}`,
                color: colors.blue,
                backgroundColor: "transparent",
              }}
              onClick={() => navigate("/minhas-trilhas")}
            >
              Cancelar
            </button>
            <button
              className="py-2 px-6 rounded-lg font-poppins-bold text-sm cursor-pointer border-none disabled:opacity-50"
              style={{ backgroundColor: colors.orange, color: "white" }}
              onClick={iniciarAvaliacao}
              disabled={loading}
            >
              {loading ? "Preparando..." : "Verificar nível"}
            </button>
            </div>
          </div>
        </div>
        <div className="w-[32%] min-w-[320px] shrink-0">
          <div className="mentor-card p-8">
            <h2 className="font-poppins-bold text-xl pb-5" style={{ color: colors.blue, borderBottom: "1px solid #c7c9cf" }}>Mentoria IA</h2>
            <p className="font-poppins text-xl mt-6 mb-6">Precisa de ajuda?</p>
            <button className="mentor-secondary w-full cursor-pointer" onClick={() => navigate("/mentor-ia")}>Falar com a mentoria IA</button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
