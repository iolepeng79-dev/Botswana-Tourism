import React, { useState, useEffect } from 'react';
import { Send, User, Search, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { Message, ChatThread, Profile } from '../types';
import { format, subMinutes } from 'date-fns';
import { supabase } from '../lib/supabase';

interface MessagingPanelProps {
  currentUser: Profile | null;
  receiverRole: 'Admin' | 'Business' | 'Tourist';
}

export default function MessagingPanel({ currentUser, receiverRole }: MessagingPanelProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Load threads
  useEffect(() => {
    if (!currentUser || !supabase) return;

    async function fetchThreads() {
      // In a real app, we'd query a messages table with group by or a threads view
      // For now, we'll use a mix of real lookup and fallback
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Group messages into threads
        const threadMap = new Map<string, ChatThread>();
        data.forEach(msg => {
          const otherId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
          if (!threadMap.has(otherId)) {
            threadMap.set(otherId, {
              other_party_id: otherId,
              other_party_name: otherId === 'admin' ? 'Admin Support' : 'Business Partner', // Simplified
              last_message: msg.content,
              last_message_time: msg.created_at,
              unread_count: msg.receiver_id === currentUser.id && !msg.read ? 1 : 0
            });
          }
        });
        setThreads(Array.from(threadMap.values()));
      } else {
        setThreads([
          { 
            other_party_id: 'b1', 
            other_party_name: receiverRole === 'Business' ? 'Delta Cruises' : 'Admin Support', 
            last_message: 'How can we help you today?', 
            last_message_time: new Date().toISOString(), 
            unread_count: 1 
          }
        ]);
      }
    }

    fetchThreads();

    // Subscribe to new messages to update threads
    const channel = supabase
      .channel('public:messages_threads')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, () => {
        fetchThreads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, receiverRole]);

  // Load messages for selected thread
  useEffect(() => {
    if (!selectedThread || !currentUser || !supabase) return;

    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedThread.other_party_id}),and(sender_id.eq.${selectedThread.other_party_id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    }

    fetchMessages();

    // Subscribe to real-time messages for this thread
    const channel = supabase
      .channel(`chat:${selectedThread.other_party_id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (
          (newMsg.sender_id === currentUser.id && newMsg.receiver_id === selectedThread.other_party_id) ||
          (newMsg.sender_id === selectedThread.other_party_id && newMsg.receiver_id === currentUser.id)
        ) {
          setMessages(prev => [...prev.filter(m => m.id !== newMsg.id), newMsg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedThread, currentUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread || !currentUser) return;

    const msgData = {
      sender_id: currentUser.id,
      receiver_id: selectedThread.other_party_id,
      content: newMessage,
      created_at: new Date().toISOString(),
      read: false
    };

    setNewMessage('');

    if (supabase) {
      const { data, error } = await supabase.from('messages').insert([msgData]).select().single();
      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message.');
      } else if (data) {
        // optimistically update messages if real-time doesn't catch it immediately
        setMessages(prev => [...prev.filter(m => m.id !== data.id), data]);
      }
    } else {
      // Demo fallback
      const msg: Message = {
        ...msgData,
        id: Date.now().toString(),
      };
      setMessages([...messages, msg]);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <MessageSquare className="w-12 h-12 text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-800">Messages Locked</h3>
        <p className="text-slate-500 mt-2">Please login or register to contact businesses.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
      {/* Thread List */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-6 border-b border-slate-100">
           <h3 className="font-black text-slate-800 text-lg">Inbox</h3>
           <div className="relative mt-4">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search messages..." 
               className="w-full bg-white border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
             />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map(thread => (
            <button
              key={thread.other_party_id}
              onClick={() => setSelectedThread(thread)}
              className={cn(
                "w-full p-6 flex gap-4 transition-all hover:bg-slate-50 text-left relative",
                selectedThread?.other_party_id === thread.other_party_id ? "bg-white shadow-sm ring-1 ring-slate-100" : ""
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                {thread.other_party_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-900 truncate">{thread.other_party_name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{format(new Date(thread.last_message_time), 'HH:mm')}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{thread.last_message}</p>
              </div>
              {thread.unread_count > 0 && (
                <span className="absolute top-6 right-6 w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {thread.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Space */}
      {selectedThread ? (
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                {selectedThread.other_party_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-slate-900">{selectedThread.other_party_name}</h3>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div> Online
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map(msg => {
              const isMe = msg.sender_id === currentUser.id;
              return (
                <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[70%] p-4 rounded-3xl text-sm font-medium",
                    isMe ? "bg-slate-900 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"
                  )}>
                    {msg.content}
                    <div className={cn("text-[9px] mt-2 opacity-50 font-bold", isMe ? "text-right" : "text-left")}>
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} className="p-6 bg-slate-50 border-t border-slate-100">
             <div className="bg-white p-2 rounded-3xl border border-slate-200 flex items-center gap-2 pr-4 shadow-sm">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-sm font-bold text-slate-800"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                  <Send className="w-5 h-5" />
                </button>
             </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
           <MessageSquare className="w-20 h-20 text-slate-200 mb-6" />
           <h3 className="text-2xl font-black text-slate-800">Select a Conversation</h3>
           <p className="text-slate-500 font-bold">Your messages will appear here once you select a thread.</p>
        </div>
      )}
    </div>
  );
}
