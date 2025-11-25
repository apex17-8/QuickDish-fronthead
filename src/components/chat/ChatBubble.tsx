export const ChatBubble = ({
  message,
  isSender,
}: {
  message: string;
  isSender: boolean;
}) => {
  return (
    <div
      className={`w-full flex ${isSender ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`px-4 py-2 rounded-2xl max-w-xs 
        ${isSender ? "bg-[var(--primary)] text-white rounded-br-none" : "bg-gray-200 rounded-bl-none"}
      `}
      >
        {message}
      </div>
    </div>
  );
};
