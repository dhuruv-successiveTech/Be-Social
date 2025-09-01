"use client";

import { useEffect, useState, useRef } from "react";

import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { motion } from "framer-motion";
import { FiMessageCircle, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { PageBackground, Card, GradientText, LoadingSpinner } from "../common";
import { fadeInScale, slideIn, staggerContainer } from "../common/animations";
import { GET_CHAT, GET_CHATS, GET_CURRENT_USER_FOLLOWING } from "../../graphql/queries/chat";
import { SEND_MESSAGE, CREATE_CHAT } from "../../graphql/mutations/chat";
import { MESSAGE_SUBSCRIPTION } from "../../graphql/subscriptions/chat";



// ---------------- Components ----------------
const Message = ({ message, isOwn }) => (
  <motion.div
    variants={slideIn}
    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
        isOwn
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      }`}
    >
      <p>{message.content}</p>
      <p className="text-xs mt-1 opacity-70">
        {new Date(parseInt(message.createdAt)).toLocaleTimeString()}
      </p>
    </div>
  </motion.div>
);

const ChatList = ({ chats, selectedChatId, onSelectChat, currentUser }) => (
  <motion.div
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
    className="space-y-2"
  >
    {chats?.map((chat) => (
      <motion.div
        key={chat.id}
        variants={fadeInScale}
        onClick={() => onSelectChat(chat.id)}
        className={`p-3 rounded-xl cursor-pointer transition-all duration-200 
          ${
            selectedChatId === chat.id
              ? "bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30"
              : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
          }`}
      >
        <div className="flex items-center space-x-3">
          {chat.isGroupChat ? (
            <div className="relative w-12 h-12 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
              <FiUsers className="w-6 h-6 text-indigo-500" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              <img
                src={
                  chat.participants.find((p) => p.id !== currentUser.id)
                    ?.avatar || "/default-media-placeholder.jpg"
                }
                alt={
                  chat.participants.find((p) => p.id !== currentUser.id)
                    ?.username
                }
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {chat.isGroupChat
                ? chat.groupName
                : chat.participants.find((p) => p.id !== currentUser.id)
                    ?.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {chat.messages.at(-1)?.content || "No messages yet"}
            </p>
          </div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

// ---------------- Main ChatContainer ----------------
const ChatContainer = () => {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState("");
  const messageEndRef = useRef(null);

  // Queries
  const {
    loading: chatsLoading,
    error: chatsError,
    data: chatsData,
    refetch: refetchChats,
  } = useQuery(GET_CHATS);

  const { loading: followingLoading, data: followingData } = useQuery(
    GET_CURRENT_USER_FOLLOWING
  );

  const {
    data: chatData,
    loading: chatLoading,
    error: chatError,
    refetch: refetchChat,
  } = useQuery(GET_CHAT, {
    variables: { chatId: selectedChatId },
    skip: !selectedChatId,
  });

  // Mutations
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: () => refetchChat(),
  });

  const [createChat] = useMutation(CREATE_CHAT);

  // Subscription
  useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { chatId: selectedChatId },
    skip: !selectedChatId,
    onData: ({ client, data }) => {
      const newMsg = data.data.messageReceived;
      client.cache.updateQuery(
        { query: GET_CHAT, variables: { chatId: selectedChatId } },
        (old) => ({
          getChat: {
            ...old.getChat,
            messages: [...old.getChat.messages, newMsg],
          },
        })
      );
    },
  });

  // Scroll on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.getChat?.messages]);

  // Handle send
  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChatId) return;
    try {
      await sendMessage({
        variables: { chatId: selectedChatId, content: message },
      });
      setMessage("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  // Handle starting chat
  const handleStartChat = async (userId) => {
    try {
      const existing = chatsData?.getChats.find(
        (chat) =>
          !chat.isGroupChat &&
          chat.participants.some((p) => p.id === userId)
      );

      if (existing) {
        setSelectedChatId(existing.id);
      } else {
        const res = await createChat({
          variables: {
            participantIds: [user.id, userId],
            isGroup: false,
          },
        });
        setSelectedChatId(res.data.createChat.id);
        await refetchChats();
      }
    } catch {
      toast.error("Failed to start chat");
    }
  };

  if (!user) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageBackground>
    );
  }

  const chats = chatsData?.getChats || [];
  const following = followingData?.getCurrentUser?.following || [];
  const chat = chatData?.getChat;

  return (
    <PageBackground>
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Chat List */}
          <Card className="lg:col-span-1 h-[calc(100vh-8rem)] flex flex-col">
            <div className="p-4 border-b dark:border-gray-700">
              <GradientText className="text-xl font-semibold">
                Chats
              </GradientText>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chatsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : chatsError ? (
                <div className="p-4 text-red-500">Failed to load chats</div>
              ) : (
                <ChatList
                  chats={chats}
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                  currentUser={user}
                />
              )}
            </div>

            {/* Following */}
            <div className="border-t dark:border-gray-700">
              <div className="p-4">
                <GradientText className="text-lg font-semibold">
                  Following
                </GradientText>
              </div>
              <div className="max-h-48 overflow-y-auto px-2 pb-4">
                {followingLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <LoadingSpinner />
                  </div>
                ) : (
                  following.map((f) => (
                    <motion.div
                      key={f.id}
                      variants={fadeInScale}
                      className="p-2 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
                      onClick={() => handleStartChat(f.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <img
                            src={f.avatar || "/default-media-placeholder.jpg"}
                            alt={f.username}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {f.username}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-3 h-[calc(100vh-8rem)] flex flex-col">
            {!selectedChatId ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <FiMessageCircle className="w-16 h-16 mb-4" />
                <p className="text-lg">Select a chat to start messaging</p>
              </div>
            ) : chatLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : chatError ? (
              <div className="p-4 text-red-500">Error loading chat</div>
            ) : (
              <>
                <div className="p-4 border-b dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    {chat.isGroupChat ? (
                      <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                        <FiUsers className="w-6 h-6 text-indigo-500" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={
                            chat.participants.find((p) => p.id !== user.id)
                              ?.avatar || "/default-media-placeholder.jpg"
                          }
                          alt="avatar"
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {chat.isGroupChat
                        ? chat.groupName
                        : chat.participants.find((p) => p.id !== user.id)
                            ?.username}
                    </h2>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chat.messages.map((msg) => (
                    <Message
                      key={msg.id}
                      message={msg}
                      isOwn={msg.sender.id === user.id}
                    />
                  ))}
                  <div ref={messageEndRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="p-4 border-t dark:border-gray-700"
                >
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 p-2 rounded-xl bg-gray-100 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    </PageBackground>
  );
};

export default ChatContainer;