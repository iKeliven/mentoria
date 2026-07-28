import React, { useState } from "react";
import SideBar from "./SideBar";
import HeaderSuperior from "./HeaderSuperior";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";

export default function LayoutWrapper({ children }) {
  const [showSidebar] = useState(true);
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <div className="mentor-shell min-h-screen flex flex-row overflow-x-hidden bg-white">
      <SideBar showSidebar={showSidebar} />
      <div className="mentor-main flex-1 flex flex-col min-w-0" style={{ backgroundColor: "#ffffff" }}>
        <HeaderSuperior />
        <main className="mentor-content flex-1 w-full px-8 py-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
