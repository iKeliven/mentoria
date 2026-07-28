import React from "react";
import { useNavigate } from "react-router-dom";

export default function HeaderSuperior() {
  const navigate = useNavigate();
  const dados = JSON.parse(localStorage.getItem("dadosDeSessao") || "{}");
  const nome = dados.nome || "Usuário";
  const inicial = nome.charAt(0).toUpperCase();

  const sair = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("dadosDeSessao");
    navigate("/");
  };

  return (
    <div
      className="h-20 flex items-center justify-between px-10 sm:px-14 shrink-0"
      style={{ backgroundColor: "#143e78" }}
    >
      <div className="flex items-center gap-3 text-white">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-poppins-bold text-base" style={{ backgroundColor: "#f5f6f9", color: "#143e78" }}>
          {inicial}
        </div>
        <span className="font-poppins text-base">Olá, <strong className="font-poppins-bold">{nome}</strong></span>
      </div>
      <button
        className="bg-transparent border-none text-white font-poppins-bold text-xl cursor-pointer hover:opacity-80"
        onClick={sair}
      >
        Sair
      </button>
    </div>
  );
}
