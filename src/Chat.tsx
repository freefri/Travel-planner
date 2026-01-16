import { useState } from 'react';

export const Chat = () => {
    const [messages, setMessages] = useState<{ id: number; text: string; sender: 'user' | 'bot' }[]>([]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), text: input, sender: 'user' }]);
        setInput('');
        // Simulate bot response
        setTimeout(() => {
            setMessages((prev) => [...prev, { id: Date.now() + 1, text: 'This is a demo response from the Chat microfrontend!', sender: 'bot' }]);
        }, 1000);
    };

    return (
        <div className="p-4 bg-background text-foreground border border-border rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-primary">Chat Support</h2>
            <div className="h-64 overflow-y-auto mb-4 border-b border-border pb-2">
                {messages.map((m) => (
                    <div key={m.id} className={`mb-2 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded-lg ${m.sender === 'user' ? 'bg-primary text-white' : 'bg-secondary text-foreground'}`}>
                            {m.text}
                        </span>
                    </div>
                ))}
                {messages.length === 0 && <p className="text-muted text-sm italic">Type a message to start...</p>}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type here..."
                    className="flex-1 p-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                    onClick={handleSend}
                    className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded font-bold transition-opacity"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
