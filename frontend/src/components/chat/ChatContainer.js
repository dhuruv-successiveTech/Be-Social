"use client";

import { useEffect, useState, useRef } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth

const GET_CURRENT_USER_FOLLOWING = gql`
  query GetCurrentUserFollowing {
    getCurrentUser {
      id
      following {
        id
        username
        avatar
      }
    }
  }
`;

const GET_CHATS = gql`
  query GetChats {
    getChats {
      id
      participants {
        id
        username
        avatar
      }
      messages {
        id
        content
        sender {
          id
          username
        }
        createdAt
      }
      isGroupChat
      groupName
    }
  }
`;

const GET_CHAT = gql`
  query GetChat($chatId: ID!) {
    getChat(chatId: $chatId) {
      id
      participants {
        id
        username
        avatar
      }
      messages {
        id
        content
        sender {
          id
          username
        }
        createdAt
      }
      isGroupChat
      groupName
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: ID!, $content: String!) {
    sendMessage(chatId: $chatId, content: $content) {
      id
      content
      sender {
        id
        username
      }
      createdAt
    }
  }
`;

const CREATE_CHAT = gql`
  mutation CreateChat(
    $participantIds: [ID!]!
    $isGroup: Boolean
    $groupName: String
  ) {
    createChat(
      participantIds: $participantIds
      isGroup: $isGroup
      groupName: $groupName
    ) {
      id
      participants {
        id
        username
        avatar
      }
      isGroupChat
      groupName
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription MessageReceived($chatId: ID!) {
    messageReceived(chatId: $chatId) {
      id
      content
      sender {
        id
        username
      }
      createdAt
    }
  }
`;

const ChatList = ({ onSelectChat, selectedChatId, currentUser }) => {
  const {
    loading: chatsLoading,
    data: chatsData,
    refetch: refetchChats,
  } = useQuery(GET_CHATS);
  const { loading: followingLoading, data: followingData } = useQuery(
    GET_CURRENT_USER_FOLLOWING
  );
  const [createChat] = useMutation(CREATE_CHAT);

  if (chatsLoading || followingLoading)
    return <div className="p-4">Loading...</div>;

  const chats = chatsData?.getChats || [];
  const following = followingData?.getCurrentUser?.following || [];

  const handleUserClick = async (userId) => {
    const existing = chats.find(
      (chat) =>
        !chat.isGroupChat && chat.participants.some((p) => p.id === userId)
    );

    if (existing) {
      onSelectChat(existing.id);
    } else {
      const res = await createChat({
        variables: {
          participantIds: [currentUser.id, userId],
          isGroup: false,
        },
      });

      onSelectChat(res.data.createChat.id);
      await refetchChats();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b font-semibold text-lg text-black bg-white">Chats</div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => {
          const other = chat.participants.find((p) => p.id !== currentUser.id);
          const lastMessage = chat.messages.at(-1);

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`flex items-center px-4 py-3 text-black cursor-pointer hover:bg-gray-100 border-b ${
                chat.id === selectedChatId ? "bg-blue-50" : ""
              }`}
            >
              <img
                src={other?.avatar || "/placeholder.png"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-black ml-3">
                <p className="font-medium">{other?.username}</p>
                <p className="text-sm text-black truncate w-40">
                  {lastMessage?.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 text-black border-t font-semibold text-lg bg-white">
        Followed Users
      </div>
      <div className="overflow-y-auto">
        {following.map((user) => {
          const hasChat = chats.some(
            (chat) =>
              !chat.isGroupChat &&
              chat.participants.some((p) => p.id === user.id)
          );

          return (
            <div
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className="flex text-black items-center px-4 py-3 cursor-pointer hover:bg-gray-100 border-b"
            >
              <img
                src={user.avatar || "/placeholder.png"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <p className="font-medium">{user.username}</p>
                {hasChat && (
                  <p className="text-sm text-black">Chat exists</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChatWindow = ({ chatId }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const { data, loading, error, refetch } = useQuery(GET_CHAT, {
    variables: { chatId },
    skip: !chatId,
  });

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: () => refetch(),
  });

  useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { chatId },
    skip: !chatId,
    onData: ({ client, data }) => {
      const newMsg = data.data.messageReceived;
      client.cache.updateQuery(
        { query: GET_CHAT, variables: { chatId } },
        (old) => ({
          getChat: {
            ...old.getChat,
            messages: [...old.getChat.messages, newMsg],
          },
        })
      );
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.getChat?.messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage({ variables: { chatId, content: message } });
    setMessage("");
  };

  if (!chatId)
    return (
      <div className="flex items-center text-black justify-center h-full text-black">
        Select a chat to begin
      </div>
    );

  if (loading) return <div className="p-4">Loading chat...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading chat</div>;

  const chat = data.getChat;
  const title = chat.isGroupChat
    ? chat.groupName
    : chat.participants.find((p) => p.id !== user.id)?.username;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white text-black font-semibold text-lg">{title}</div>

      <div className="flex-1 overflow-y-auto text-black px-6 py-4 space-y-4 bg-gray-50">
        {chat.messages.map((msg) => {
          const isOwn = msg.sender.id === user.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-xl px-4 py-2 max-w-xs md:max-w-md ${
                  isOwn ? "bg-blue-400 text-white" : "bg-gray-200"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 text-right">
                  {new Date(parseInt(msg.createdAt)).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4  border-t bg-white">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            className="flex-1 px-4 py-2 border text-black rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
            disabled={!message.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

const ChatContainer = () => {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState(null);

  if (!user) return <div className="text-center p-10">Loading user...</div>;

  return (
    <div className="min-h-[38rem] flex">
      <div className="w-1/4 border-r bg-gray-50 overflow-y-auto">
        <ChatList
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
          currentUser={user}
        />
      </div>
      <div className="w-3/4 bg-white flex flex-col">
        <ChatWindow chatId={selectedChatId} />
      </div>
    </div>
  );
};

export default ChatContainer;
