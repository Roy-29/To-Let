"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { sendMessageAction } from './actions';
import styles from './messages.module.css';

export default function ChatBox({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsLoading(true);
    try {
      await sendMessageAction(conversationId, message);
      setMessage('');
    } catch (err) {
      alert('Could not send message.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className={styles.chatForm} onSubmit={handleSend}>
      <Input
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !message.trim()} variant="primary">
        Send
      </Button>
    </form>
  );
}
