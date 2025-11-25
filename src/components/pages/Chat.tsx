import { ChatBubble } from "../chat/ChatBubble";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { text: "Hello!", sender: "rider" },
    { text: "Hi! Where is my order?", sender: "customer" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input) return;
    setMessages([...messages, { text: input, sender: "customer" }]);
    setInput("");
  };

  return (
    <div className="p-6 flex flex-col h-screen gap-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg.text} isSender={msg.sender==="customer"} />
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
