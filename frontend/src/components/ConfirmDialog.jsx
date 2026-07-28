import React from "react";
import Button from "./Button";

export default function ConfirmDialog({ aberto, titulo = "Confirmar ação", mensagem, confirmarTexto = "Confirmar", cancelarTexto = "Cancelar", variante = "danger", onConfirmar, onCancelar }) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <button className="absolute inset-0 border-0 bg-[#0d315f]/55 cursor-default" aria-label="Fechar popup" onClick={onCancelar} />
      <div className="relative w-full max-w-md mentor-card p-7 shadow-2xl">
        <h2 id="confirm-dialog-title" className="font-poppins-bold text-xl" style={{ color: "#143e78" }}>{titulo}</h2>
        <p className="font-poppins text-sm leading-relaxed mt-3" style={{ color: "#4b5563" }}>{mensagem}</p>
        <div className="flex justify-end gap-3 mt-7">
          <Button variant="secondary" className="min-h-0 py-2 px-5 text-sm" onClick={onCancelar}>{cancelarTexto}</Button>
          <Button variant={variante} className="min-h-0 py-2 px-5 text-sm" onClick={onConfirmar}>{confirmarTexto}</Button>
        </div>
      </div>
    </div>
  );
}
