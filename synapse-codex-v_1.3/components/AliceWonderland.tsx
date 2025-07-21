// ALICE EASTER EGG

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AliceChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { LoaderIcon, TopHatIcon } from './Icons';

interface AliceWonderlandProps {
  onClose: () => void;
}

const MAD_HATTER_PERSONA = `You are the Mad Hatter, speaking in riddles, clever nonsense, and Wonderland wisdom. Remain in character, but offer helpful advice about coding, living documents, or Synapse Codex when asked. Your answers should be whimsical, slightly mad, and always entertaining. Keep responses relatively short. Never break character.`;

const ASCII_RABBIT_HOLE = `
               ,d88b.d88b,
              d88888888888b
              8888888888888
              'Y888888888Y'
                'Y88888Y'
                  'Y8Y'
                    '
`;

const RANDOM_RIDDLES = [
    "Why is a raven like a writing-desk?",
    "What's the difference between a schoolmaster and a train-driver? One minds the train, the other trains the mind!",
    "It's always tea-time!",
    "We're all mad here. I'm mad. You're mad.",
    "If you knew Time as well as I do, you wouldn't talk about wasting it. It's him.",
    "There's a place. Like no place on Earth. A land full of wonder, mystery, and danger. Some say, to survive it, you need to be as mad as a hatter. Which, luckily, I am.",
];

export const AliceWonderland: React.FC<AliceWonderlandProps> = ({ onClose }) => {
  const [portalState, setPortalState] = useState<'start' | 'active' | 'end'>('start');
  const [messages, setMessages] = useState<AliceChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Portal animation sequence
    document.body.style.overflow = 'hidden';
    const t1 = setTimeout(() => setPortalState('active'), 100);
    const t2 = setTimeout(() => setPortalState('end'), 1600); // 1.5s animation + 0.1s delay
    return () => {
      document.body.style.overflow = 'auto';
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  
   useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: AliceChatMessage = { id: uuidv4(), sender: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      if (!process.env.API_KEY) {
        throw new Error("Missing Gemini API Key for this tea party!");
      }
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: trimmedInput,
        config: {
          systemInstruction: MAD_HATTER_PERSONA,
          temperature: 0.8,
        }
      });
      
      const hatterResponse: AliceChatMessage = { id: uuidv4(), sender: 'mad-hatter', text: response.text };
      setMessages(prev => [...prev, hatterResponse]);
      
    } catch (error) {
      console.error("The tea party has been interrupted by a terrible error!", error);
      const errorMessage: AliceChatMessage = {
        id: uuidv4(),
        sender: 'mad-hatter',
        text: "Oh dear, oh dear! My thoughts are all a-jumble. Perhaps the Dormouse unplugged the teapot again. Try again in a moment!",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnotherCup = () => {
    const randomRiddle = RANDOM_RIDDLES[Math.floor(Math.random() * RANDOM_RIDDLES.length)];
    const riddleMessage: AliceChatMessage = { id: uuidv4(), sender: 'mad-hatter', text: randomRiddle };
    setMessages(prev => [...prev, riddleMessage]);
  };
  
  if (portalState !== 'end') {
    return (
        <div className="fixed inset-0 z-[150] bg-black flex items-center justify-center overflow-hidden">
            <pre
                className={`text-center font-mono whitespace-pre text-white animate-portal-zoom transition-opacity duration-500 ${portalState === 'active' ? 'opacity-100' : 'opacity-0'}`}
                style={{ fontSize: 'clamp(8px, 4vw, 24px)' }}
            >
                {ASCII_RABBIT_HOLE}
            </pre>
            <h1 className={`absolute text-2xl md:text-5xl text-white font-bold text-glitch transition-opacity duration-500 ${portalState === 'active' ? 'opacity-100' : 'opacity-0'}`}>
                Down the Rabbit Hole...
            </h1>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-right">
      <div className="w-full max-w-3xl h-[90vh] bg-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20 wonderland-gradient">
        <header className="p-4 border-b border-white/20 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
             <TopHatIcon className="w-8 h-8"/>
            <h2 className="text-2xl md:text-4xl" style={{ fontFamily: 'var(--font-wonderland)'}}>
              The Mad Hatter's Tea Party
            </h2>
          </div>
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold bg-white/20 hover:bg-white/40 rounded-lg transition-colors">
            Wake Up
          </button>
        </header>

        <main ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'mad-hatter' && <TopHatIcon className="w-8 h-8 text-white flex-shrink-0"/>}
                    <div className={`max-w-md px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-fuchsia-500 text-white rounded-br-none' : 'bg-cyan-500 text-black rounded-bl-none'}`}>
                        <p className="text-base" style={{fontFamily: 'Georgia, serif'}}>{msg.text}</p>
                    </div>
                </div>
            ))}
             {isLoading && (
                 <div className="flex items-end gap-3 justify-start">
                    <TopHatIcon className="w-8 h-8 text-white"/>
                    <div className="max-w-md px-4 py-3 rounded-2xl bg-cyan-500 text-black rounded-bl-none">
                       <LoaderIcon className="w-6 h-6 text-black"/>
                    </div>
                 </div>
            )}
        </main>
        
        <footer className="p-4 border-t border-white/20 flex-shrink-0">
          <button
              onClick={handleAnotherCup}
              className="w-full mb-3 py-2 text-lg font-bold text-black bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-colors"
              style={{ fontFamily: 'var(--font-wonderland)' }}
          >
            Have another cup?
          </button>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a riddle, or perhaps a question..."
              className="flex-grow px-4 py-2 rounded-lg border-2 border-fuchsia-400 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="px-4 py-2 font-bold text-white bg-fuchsia-500 hover:bg-fuchsia-600 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                Send
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};