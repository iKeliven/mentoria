import React, { useState } from "react";
import { sizeInputs } from "../constants/sizeInputs";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";

export default function DefaultInput({
  placeholder,
  size = "default",
  label,
  value,
  onChangeText,
  color,
  secureTextEntry = false
}) {
  const [focused, setFocused] = useState(false);
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  let widthClass = "w-[450px]";
  let heightClass = "h-[45px]";

  switch (size) {
    case "big":
      widthClass = "w-[585px]";
      heightClass = "h-[58.5px]";
      break;
    case "small":
      widthClass = "w-[315px]";
      heightClass = "h-[31.5px]";
      break;
  }

  return (
    <div className="max-w-full">
      {label && (
        <p className="font-poppins px-5 mb-1" style={{ color: colors.grey }}>{label}</p>
      )}
      <input
        className={`${widthClass} ${heightClass} mentor-input px-5 font-poppins outline-none transition-shadow duration-200 max-w-full ${
          focused ? "shadow-[0_0_0_1px_#0F3468]" : ""
        }`}
        style={{
          backgroundColor: color || colors.card,
          border: `1px solid ${colors["light-grey"]}`,
          color: colors.grey,
        }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChangeText(e.target.value)}
        type={secureTextEntry ? "password" : "text"}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}
