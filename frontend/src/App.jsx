import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Inicio from "./pages/Inicio";
import MinhasTrilhas from "./pages/MinhasTrilhas";
import ChatMentor from "./pages/ChatMentor";
import AvaliacaoNivel from "./pages/AvaliacaoNivel";
import Perfil from "./pages/Perfil";
import AlterarSenha from "./pages/AlterarSenha";
import AdicionarTrilha from "./pages/AdicionarTrilha";
import ResponderQuestionario from "./pages/ResponderQuestionario";
import ConfiguracoesIA from "./pages/ConfiguracoesIA";
import LoadingScreen from "./pages/LoadingScreen";

function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  return (
    <ThemeProvider>
      {!fontsLoaded ? (
        <LoadingScreen />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/minhas-trilhas" element={<MinhasTrilhas />} />
            <Route path="/mentor-ia" element={<ChatMentor />} />
            <Route path="/avaliacao-nivel" element={<AvaliacaoNivel />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/perfil/alterar-senha" element={<AlterarSenha />} />
            <Route path="/adicionar-trilha" element={<AdicionarTrilha />} />
            <Route path="/responder-questionario/:id" element={<ResponderQuestionario />} />
            <Route path="/configuracoes-ia" element={<ConfiguracoesIA />} />
          </Routes>
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
}

export default App;
