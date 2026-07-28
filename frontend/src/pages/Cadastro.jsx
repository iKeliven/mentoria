import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";
import DefaultInput from "../components/DefaultInput";
import ErrorMessage from "../components/ErrorMessage";
import { userService } from "../services/User.service";
import { sequelizeErrors } from "../constants/errorsSequelize";
import { errorMessages } from "../constants/errorMessages";

export default function Cadastro() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [screenIsVisible, setScreenIsVisible] = useState(true);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const cadastrarUsuario = async () => {
    if (senha !== confirmarSenha || !nome || !email || !senha || !confirmarSenha) {
      mostrarErro("Verifique os campos novamente!");
      return;
    }

    const usuario = { nome, email, senha };
    const response = await userService.cadastrarUsuario(usuario);

    if (!response || response instanceof Error) {
      return mostrarErro("Nao foi possivel conectar ao servidor. Verifique se o backend esta rodando.");
    }

    if (response.status == "ERRO") {
      switch (response.tipo || response.e?.name) {
        case sequelizeErrors.uniqueConstraintError:
          return mostrarErro(errorMessages.uniqueConstraintError);
        case sequelizeErrors.connectionError:
          return mostrarErro(errorMessages.connectionError);
        case sequelizeErrors.validationError:
          return mostrarErro(errorMessages.validationError);
        default:
          return mostrarErro(response.mensagem || "Não foi possível criar sua conta. Tente novamente.");
      }
    } else if (response.status == "SUCESSO") {
      navigate("/");
    }
  };

  const mostrarErro = (mensagem) => {
    setErrorMessage(mensagem);
    setShowError(true);
  };

  const ocultarErro = () => {
    setShowError(false);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-white">
      <AnimatePresence mode="wait">
        {screenIsVisible && (
          <motion.div
            key="cadastro"
            className="flex flex-col items-center flex-1"
            initial={{ opacity: 0, scale: 0.5, x: 1000 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 1000 }}
            transition={{ duration: 1 }}
          >
            <div className="flex flex-col items-center relative mt-12">
              {showError && (
                <ErrorMessage
                  timeout={3000}
                  message={errorMessage}
                  color={colors.grey}
                  ocultarErro={ocultarErro}
                />
              )}
              <img
                src="/assets/logo_mentor_ai.png"
                alt="Logo Mentor IA"
                className="w-[330px] h-auto max-w-[80vw] relative z-10"
              />
            </div>

            <div
              className="mentor-card self-center w-[680px] min-h-[620px] mx-[25px] p-12 flex flex-col max-w-[calc(100vw-50px)]"
            >
              <div className="flex flex-col items-center">
                <p
                  className="font-poppins-bold"
                  style={{ color: colors.blue, fontSize: 24 }}
                >
                  Faca seu cadastro para utilizar a plataforma
                </p>

                <div className="flex flex-col gap-5 mt-[35px]">
                  <DefaultInput
                    color={colors.card}
                    label="Nome"
                    placeholder="Digite seu nome completo"
                    value={nome}
                    onChangeText={(text) => setNome(text)}
                  />
                  <DefaultInput
                    color={colors.card}
                    label="E-mail"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                  />
                  <DefaultInput
                    color={colors.card}
                    label="Senha"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChangeText={(text) => setSenha(text)}
                  />
                  <DefaultInput
                    color={colors.card}
                    label="Confirmar senha"
                    placeholder="Confirme a senha"
                    value={confirmarSenha}
                    onChangeText={(text) => setConfirmarSenha(text)}
                  />
                </div>
              </div>

              <div className="flex flex-row justify-end flex-1 mt-10 mr-5 gap-5 items-end">
                <button
                className="mentor-secondary w-[150px] cursor-pointer"
                  onClick={() => {
                    setScreenIsVisible(false);
                    setTimeout(() => navigate("/"), 1000);
                  }}
                >
                  Voltar
                </button>
                <button
                className="mentor-primary w-[150px] cursor-pointer"
                  onClick={cadastrarUsuario}
                >
                  Cadastrar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
