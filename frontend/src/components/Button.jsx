import React from "react";

const variants = {
  primary: "mentor-primary",
  secondary: "mentor-secondary",
  navy: "mentor-navy",
  danger: "mentor-danger",
};

export default function Button({ variant = "primary", className = "", type = "button", children, ...props }) {
  return <button type={type} className={`mentor-button ${variants[variant] || variants.primary} ${className}`} {...props}>{children}</button>;
}
