import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "", title }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
