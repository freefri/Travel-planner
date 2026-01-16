import { useState, useCallback } from 'react';
import { Chat as ChatUI } from './components/ui/chat';
import { type Message } from './components/ui/chat-message';

export const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const append = useCallback((message: { role: "user"; content: string }) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: message.content,
            createdAt: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);

        // Simulate bot response
        setIsGenerating(true);
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "This is a demo response from the new Shadcn-styled Chat microfrontend!",
                createdAt: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsGenerating(false);
        }, 1000);
    }, []);

    const handleSubmit = (e?: { preventDefault?: () => void }) => {
        e?.preventDefault?.();
        if (!input.trim()) return;

        append({ role: "user", content: input });
        setInput('');
    };

    return (
        <div className="flex h-[600px] w-full max-w-4xl flex-col rounded-xl border bg-background shadow-xl overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
                <h2 className="text-lg font-semibold text-primary">Chat Support</h2>
                <p className="text-xs text-muted-foreground">Powered by Shadcn Chatbot Kit</p>
            </div>
            <div className="flex-1 overflow-hidden p-4">
                <ChatUI
                    messages={messages}
                    input={input}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    isGenerating={isGenerating}
                    append={append}
                    suggestions={[
                        "What is this microfrontend?",
                        "How to integrate this?",
                        "Tell me about the tech stack"
                    ]}
                />
            </div>
        </div>
    );
};

export default Chat;
