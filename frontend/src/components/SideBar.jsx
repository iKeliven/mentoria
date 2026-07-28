import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";

const itensMenu = [
  { label: "Inicio", rota: "/inicio" },
  { label: "Minhas trilhas", rota: "/minhas-trilhas" },
  { label: "Mentor IA", rota: "/mentor-ia" },
  { label: "Perfil", rota: "/perfil" },
];

export default function SideBar({ showSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <aside
      className="mentor-sidebar min-h-screen overflow-hidden flex flex-col shrink-0"
      style={{
        width: showSidebar ? 250 : 0,
        backgroundColor: "#f5f6f9",
        borderRight: "1px solid #c7c9cf",
      }}
    >
      <div className="px-10 pt-10 pb-8 flex flex-col flex-1">
        <div className="mb-20">
          <img src="/assets/logo_mentor_ai.png" alt="Mentor IA+" className="w-[172px] h-auto" />
        </div>

        <nav className="flex flex-col gap-8">
          {itensMenu.map((item) => {
            const ativo = location.pathname === item.rota;
            return (
              <button
                key={item.rota}
                className={`text-left font-poppins-bold text-xl bg-transparent border-none cursor-pointer pb-1 ${
                  ativo ? "underline underline-offset-4" : ""
                }`}
                style={{ color: colors.blue }}
                onClick={() => navigate(item.rota)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
