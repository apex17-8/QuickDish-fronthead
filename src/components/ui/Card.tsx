import React from "react";

export const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white shadow-md rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);
