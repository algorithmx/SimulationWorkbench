import React, { useRef, useEffect } from 'react';

export function SystemMessageArea({ messages }) {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="system-message-area">
            {messages.map((message, index) => (
                <div key={index} className="system-message">{message}</div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}