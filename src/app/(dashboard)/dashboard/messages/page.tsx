import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getMyConversations, getConversationById } from '@/services/conversationService';
import { getConversationMessages } from '@/services/messageService';
import Link from 'next/link';
import ChatBox from './ChatBox';
import styles from './messages.module.css';

export default async function MessagesPage({ searchParams }: { searchParams: { conversationId?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { conversations } = await getMyConversations(user.id, user.role as "TENANT" | "LANDLORD", 1, 50);

  const activeConversationId = searchParams.conversationId;
  let messages: any[] = [];
  let activeConversation: any = null;

  if (activeConversationId) {
    try {
      activeConversation = await getConversationById(activeConversationId, user.id);
      const res = await getConversationMessages(activeConversationId, user.id, 1, 100);
      messages = res.messages;
    } catch (e) {
      // Ignore not found or forbidden
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Conversations</h2>
        {conversations.length > 0 ? (
          <ul className={styles.convList}>
            {conversations.map((conv) => {
              const otherUser = user.role === 'TENANT' ? conv.landlord : conv.tenant;
              const isActive = conv.id === activeConversationId;
              
              return (
                <li key={conv.id} className={`${styles.convItem} ${isActive ? styles.activeConv : ''}`}>
                  <Link href={`/dashboard/messages?conversationId=${conv.id}`} className={styles.convLink}>
                    <p className={styles.convName}>{otherUser.name}</p>
                    <p className={styles.convProperty}>{conv.property.title}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.emptySidebar}>No conversations yet.</p>
        )}
      </div>

      <div className={styles.main}>
        {activeConversationId && activeConversation ? (
          <div className={styles.chatArea}>
            <div className={styles.chatHeader}>
              <h3>{user.role === 'TENANT' ? activeConversation.landlord.name : activeConversation.tenant.name}</h3>
              <p>{activeConversation.property.title}</p>
            </div>
            
            <div className={styles.messagesContainer}>
              {messages.length > 0 ? (
                messages.slice().reverse().map((msg) => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`${styles.messageWrapper} ${isMine ? styles.myMessage : styles.theirMessage}`}>
                      <div className={styles.messageBubble}>
                        <p>{msg.message}</p>
                        <span className={styles.time}>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className={styles.emptyMessages}>Say hello!</p>
              )}
            </div>

            <div className={styles.chatInputArea}>
              <ChatBox conversationId={activeConversationId} />
            </div>
          </div>
        ) : (
          <div className={styles.noConversationSelected}>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
