import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { getColors } from "../constants/colors";

export default function ErrorMessage({ timeout, message, color, ocultarErro }) {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  useEffect(() => {
    const timer = setTimeout(() => {
      ocultarErro();
    }, timeout);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="absolute z-10 mt-[30px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-[200px] border-t-[3px] rounded-t-[10px] rounded-e-[10px]"
        style={{ borderColor: color }}
        initial={{ width: 200 }}
        animate={{ width: 0 }}
        transition={{ duration: timeout / 1000, ease: "linear" }}
      />
      <div
        className="absolute z-10 mt-[2.5px] self-center flex items-center justify-center h-[50px] w-[200px] rounded-[10px]"
        style={{ backgroundColor: colors["dark-white"] }}
      >
        <p className="text-center font-poppins text-sm" style={{ color: colors.grey }}>{message}</p>
      </div>
    </motion.div>
  );
}
