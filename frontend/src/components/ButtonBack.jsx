import React from "react";
import { LuChevronLeft } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export default function ButtonBack({ label, fallback = "/inicio" }) {
  const navigate = useNavigate();
  return <button className="mentor-back" onClick={() => window.history.length > 1 ? navigate(-1) : navigate(fallback)}>
    <LuChevronLeft size={30} strokeWidth={3} />
    <span>{label}</span>
  </button>;
}
