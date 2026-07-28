import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";

export default function MentoriaIA() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <div className="mentor-card p-8 flex flex-col items-stretch gap-6">
      <h2
        className="font-poppins-bold text-xl pb-5"
        style={{ color: colors.blue, borderBottom: "1px solid #c7c9cf" }}
      >
        Mentoria IA
      </h2>
      <p className="font-poppins text-xl" style={{ color: "#111" }}>
        Precisa de ajuda?
      </p>
      <button
        className="mentor-secondary w-full text-lg cursor-pointer"
        onClick={() => navigate("/mentor-ia")}
      >
        Falar com a mentoria IA
      </button>
    </div>
  );
}
