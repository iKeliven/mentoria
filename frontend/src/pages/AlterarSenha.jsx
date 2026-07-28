import React, { useState } from "react";
import LayoutWrapper from "../components/LayoutWrapper";
import ButtonBack from "../components/ButtonBack";
import Button from "../components/Button";
import DefaultInput from "../components/DefaultInput";
import { authService } from "../services/authService";

export default function AlterarSenha() {
  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [repetirSenha, setRepetirSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const dados = JSON.parse(localStorage.getItem("dadosDeSessao") || "{}");

  const salvar = async () => {
    if (!senhaAntiga || !senhaNova || senhaNova !== repetirSenha) return setMensagem("Preencha os campos e confirme a nova senha.");
    setLoading(true);
    const res = await authService.alterarSenha(senhaAntiga, senhaNova);
    setMensagem(res.status === "SUCESSO" ? "Senha alterada com sucesso." : res.mensagem || "Não foi possível alterar a senha.");
    if (res.status === "SUCESSO") { setSenhaAntiga(""); setSenhaNova(""); setRepetirSenha(""); }
    setLoading(false);
  };

  return <LayoutWrapper><div className="w-full"><section className="mentor-card p-8 min-h-[680px]">
    <div className="border-b border-[#c7c9cf] pb-5"><ButtonBack label="Meu Perfil" fallback="/perfil" /></div>
    <div className="flex items-center gap-4 py-6 border-b border-[#c7c9cf]"><div className="w-16 h-16 rounded-full bg-[#d9d9d9] flex items-center justify-center font-poppins-bold text-xl">{dados.nome?.[0]?.toUpperCase() || "U"}</div><p className="font-poppins text-base text-[#696969]">{dados.email || "email@exemplo.com"}</p></div>
    <div className="mt-8 max-w-3xl rounded-[20px] border border-[#c7c9cf] bg-white p-7"><h2 className="mentor-section-heading pb-4 border-b border-[#c7c9cf]">Editar Senha</h2>
      {mensagem && <p className="font-poppins text-sm mt-4 text-[#143e78]">{mensagem}</p>}
      <div className="space-y-4 mt-5"><DefaultInput label="Senha antiga" value={senhaAntiga} onChangeText={setSenhaAntiga} secureTextEntry /><DefaultInput label="Senha nova" value={senhaNova} onChangeText={setSenhaNova} secureTextEntry /><DefaultInput label="Repetir senha" value={repetirSenha} onChangeText={setRepetirSenha} secureTextEntry /></div>
      <div className="flex justify-end gap-4 mt-7"><Button variant="secondary" onClick={() => { setSenhaAntiga(""); setSenhaNova(""); setRepetirSenha(""); }}>Cancelar</Button><Button disabled={loading} onClick={salvar}>{loading ? "Salvando..." : "Salvar"}</Button></div>
    </div>
  </section></div></LayoutWrapper>;
}
