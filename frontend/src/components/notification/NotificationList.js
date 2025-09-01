"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { GET_NOTIFICATIONS } from "../../graphql/queries/notification";
import { NOTIFICATION_SUBSCRIPTION } from "../../graphql/subscriptions/notification";
import { MARK_NOTIFICATION_AS_READ } from "../../graphql/mutations/notification";

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getNotificationText = () => {
    switch (notification.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "follow":
        return "started following you";
      case "message":
        return "sent you a message";
      default:
        return "interacted with you";
    }
  };

  const getNotificationLink = () => {
    switch (notification.type) {
      case "like":
      case "comment":
        return `/post/${notification.post?.id}`;
      case "follow":
        return `/profile/${notification.sender?.id}`;
      case "message":
        return `/messages?chat=${notification.chat?.id}`;
      default:
        return "#";
    }
  };

  return (
    <Link href={getNotificationLink()}>
      <div
        className={`p-4 border-b-0 mb-3 rounded-xl shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
          notification.read ? "opacity-70" : ""
        }`}
        onClick={() => !notification.read && onMarkAsRead(notification.id)}
      >
        <div className="flex items-center">
          <img
            src={
              notification.sender?.avatar || "https://via.placeholder.com/40"
            }
            alt={notification.sender?.username}
            loading="lazy"
            className="w-12 h-12 rounded-full border-2 border-indigo-100 dark:border-indigo-900 object-cover"
          />
          <div className="ml-4 flex-1">
            <p className="text-base font-medium text-gray-900 dark:text-white">
              <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                {notification.sender?.username}
              </span>{" "}
              {getNotificationText()}
            </p>
            {notification.type === "comment" && (
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 truncate">
                {notification.comment?.content}
              </p>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              {new Date(parseInt(notification.createdAt)).toLocaleString()}
            </p>
          </div>
          {!notification.read && (
            <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full ml-2"></div>
          )}
        </div>
      </div>
    </Link>
  );
};

const NotificationList = ({ onClose }) => {
  const { loading, error, data, subscribeToMore } = useQuery(GET_NOTIFICATIONS);
  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    if (data?.getNotifications) {
      data.getNotifications.forEach((n) => seenIdsRef.current.add(n.id));
    }
  }, [data]);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: NOTIFICATION_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const newNotification = subscriptionData.data.notificationReceived;

        if (seenIdsRef.current.has(newNotification.id)) {
          return prev;
        }

        seenIdsRef.current.add(newNotification.id);

        const toastText = `${newNotification.sender.username} ${
          {
            like: "liked your post",
            comment: "commented on your post",
            follow: "started following you",
            message: "sent you a message",
          }[newNotification.type] || "interacted with you"
        }`;

        toast((t) => (
          <div
            className="cursor-pointer"
            onClick={() => {
              const link =
                newNotification.type === "like" ||
                newNotification.type === "comment"
                  ? `/post/${newNotification.post?.id}`
                  : newNotification.type === "follow"
                  ? `/profile/${newNotification.sender?.id}`
                  : newNotification.type === "message"
                  ? `/messages?chat=${newNotification.chat?.id}`
                  : "#";

              window.location.href = link;
              toast.dismiss(t.id);
            }}
          >
            🔔 <strong>{newNotification.sender.username}</strong> {toastText}
          </div>
        ));

        return {
          getNotifications: [newNotification, ...prev.getNotifications],
        };
      },
    });

    return () => unsubscribe();
  }, [subscribeToMore]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead({
        variables: { id },
        update: (cache, { data: { markNotificationAsRead } }) => {
          const existingNotifications = cache.readQuery({
            query: GET_NOTIFICATIONS,
          });

          const updatedNotifications =
            existingNotifications.getNotifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            );

          cache.writeQuery({
            query: GET_NOTIFICATIONS,
            data: { getNotifications: updatedNotifications },
          });
        },
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div>Error loading notifications</div>;

  return (
    <div
      ref={notificationRef}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl mx-auto border border-indigo-100 dark:border-indigo-900 p-6 animate-fadeIn"
    >
      <div className="mb-6 pb-2 border-b border-indigo-100 dark:border-indigo-900">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 tracking-tight">
          Notifications
        </h2>
      </div>
      <div>
        {data.getNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          data.getNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default NotificationList;
