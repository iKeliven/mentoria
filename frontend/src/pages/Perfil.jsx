import React from "react";
import { useNavigate } from "react-router-dom";
import LayoutWrapper from "../components/LayoutWrapper";
import ButtonBack from "../components/ButtonBack";
import Button from "../components/Button";

export default function Perfil() {
  const navigate = useNavigate();
  const dados = JSON.parse(localStorage.getItem("dadosDeSessao") || "{}");
  return <LayoutWrapper><div className="w-full"><section className="mentor-card p-8 min-h-[680px]">
    <div className="border-b border-[#c7c9cf] pb-5"><ButtonBack label="Meu Perfil" /></div>
    <div className="flex items-center gap-4 py-6 border-b border-[#c7c9cf]"><div className="w-16 h-16 rounded-full bg-[#d9d9d9] flex items-center justify-center font-poppins-bold text-xl">{dados.nome?.[0]?.toUpperCase() || "U"}</div><div><p className="font-poppins text-lg text-[#143e78]">{dados.nome || "Usuário"}</p><p className="font-poppins text-base text-[#696969]">{dados.email || "email@exemplo.com"}</p></div></div>
    <div className="mt-8 max-w-3xl rounded-[20px] border border-[#c7c9cf] bg-white p-7"><h2 className="mentor-section-heading pb-4 border-b border-[#c7c9cf]">Editar Perfil</h2>
      <dl className="font-poppins"><div className="flex justify-between py-5 border-b border-[#d3d3d3]"><dt>Nome</dt><dd className="text-[#696969]">{dados.nome || "Usuário"}</dd></div><div className="flex justify-between py-5 border-b border-[#d3d3d3]"><dt>E-mail</dt><dd className="text-[#696969]">{dados.email || "email@exemplo.com"}</dd></div><div className="flex justify-between py-5 border-b border-[#d3d3d3]"><dt>Senha</dt><dd><button className="font-poppins-bold underline text-[#143e78] bg-transparent border-0 cursor-pointer" onClick={() => navigate("/perfil/alterar-senha")}>Alterar Senha</button></dd></div></dl>
      <div className="flex justify-end gap-4 mt-5"><Button variant="secondary" onClick={() => navigate("/inicio")}>Cancelar</Button><Button onClick={() => navigate("/perfil/alterar-senha")}>Salvar</Button></div>
    </div>
  </section></div></LayoutWrapper>;
}
