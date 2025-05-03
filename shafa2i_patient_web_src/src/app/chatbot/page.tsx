// /home/ubuntu/shafa2i_project/frontend/patient-web/src/app/chatbot/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { sendMessageToChatbot } from '@/services/apiClient'; // Import actual API function

export default function ChatbotPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you today?' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    setTimeout(() => {
        const scrollViewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
    }, 0);
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessage = inputMessage.trim();
    if (!userMessage) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInputMessage('');
    setLoading(true);
    scrollToBottom(); // Scroll after adding user message

    try {
      console.log('Sending message to chatbot:', userMessage);
      // Use actual API call
      const response = await sendMessageToChatbot(userMessage);
      const botReply = response.reply; // Adjust based on actual API response structure

      // Add bot response to chat
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to get response from the assistant.';
      toast({ title: "Chatbot Error", description: errorMsg, variant: "destructive" });
      // Optionally add an error message to the chat
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
      // Handle 401 etc. (Interceptor might handle this)
    } finally {
      setLoading(false);
      scrollToBottom(); // Scroll after adding bot message or error
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-8rem)]"> {/* Adjust height as needed */}
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>

      <ScrollArea className="flex-grow border rounded-md p-4 mb-4 bg-gray-50" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && (
                <Avatar className="h-8 w-8">
                  {/* TODO: Add actual bot avatar image */}
                  <AvatarImage src="/placeholder-bot.jpg" alt="Bot" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <Avatar className="h-8 w-8">
                  {/* TODO: Add actual user avatar image or initials */}
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-end gap-2 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-bot.jpg" alt="Bot" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="max-w-[70%] rounded-lg px-4 py-2 bg-gray-200 text-gray-900">
                <span className="italic">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          type="text"
          placeholder="Ask me anything..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-grow"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !inputMessage.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}

