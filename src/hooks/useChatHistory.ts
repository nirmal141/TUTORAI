import { useState, useEffect } from 'react';
import { Message, ChatHistory } from '../components/Chat';

export function useChatHistory() {
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Load chat histories on mount
  useEffect(() => {
    const savedHistories = localStorage.getItem('chatHistories');
    if (savedHistories) {
      const histories = JSON.parse(savedHistories);
      histories.forEach((history: ChatHistory) => {
        history.createdAt = new Date(history.createdAt);
        history.messages.forEach((msg: Message) => {
          msg.timestamp = new Date(msg.timestamp);
        });
      });
      setChatHistories(histories);
    }
  }, []);

  const saveNewChat = (messages: Message[]) => {
    if (messages.length <= 1) return; // Don't save empty chats

    if (!currentChatId) {
      // Create new chat
      const newHistory: ChatHistory = {
        id: Date.now().toString(),
        title: messages[1]?.content.slice(0, 50) + '...',
        messages: [...messages],
        createdAt: new Date(),
      };
      setChatHistories(prev => {
        const updated = [...prev, newHistory];
        localStorage.setItem('chatHistories', JSON.stringify(updated));
        return updated;
      });
      setCurrentChatId(newHistory.id);
    } else {
      // Update existing chat
      setChatHistories(prev => {
        const updated = prev.map(history => 
          history.id === currentChatId 
            ? { ...history, messages: [...messages] }
            : history
        );
        localStorage.setItem('chatHistories', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const loadChatHistory = (historyId: string) => {
    const history = chatHistories.find(h => h.id === historyId);
    setCurrentChatId(historyId);
    return history?.messages || [];
  };

  const startNewChat = () => {
    setCurrentChatId(null);
  };

  const deleteChat = (historyId: string) => {
    setChatHistories(prev => {
      const updated = prev.filter(history => history.id !== historyId);
      localStorage.setItem('chatHistories', JSON.stringify(updated));
      return updated;
    });
    
    if (currentChatId === historyId) {
      setCurrentChatId(null);
    }
  };

  return {
    chatHistories,
    currentChatId,
    saveNewChat,
    loadChatHistory,
    startNewChat,
    deleteChat
  };
} 