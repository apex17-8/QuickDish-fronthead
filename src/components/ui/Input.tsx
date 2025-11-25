interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = ({ className = "", ...props }: InputProps) => {
  return (
    <input
      className={`w-full border rounded-xl px-3 py-2 outline-none 
                  focus:border-[var(--primary)] ${className}`}
      {...props}
    />
  );
};
