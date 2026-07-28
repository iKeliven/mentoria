import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";

export default function LoadingScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <div className="flex-1 flex items-center justify-center mb-[120px] min-h-screen overflow-x-hidden" style={{ backgroundColor: colors.page }}>
      <div className="flex flex-col items-center gap-8">
        <img
          src="/assets/logo_mentor_ai.png"
          alt="Logo Mentor IA"
          className="w-[538px] h-[155px] max-w-full"
        />
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: colors.blue, borderTopColor: "transparent" }}
        />
      </div>
    </div>
  );
}
