import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "px-4 py-2 rounded-xl font-semibold transition-all active:scale-95";

  const variants = {
    primary:
      "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
    outline:
      "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white",
    ghost:
      "text-[var(--primary)] hover:bg-pink-50",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
