"use client";

import { useEffect } from "react";
import { gql } from "@apollo/client";
import { useSubscription } from "@apollo/client/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// GraphQL subscription
const NOTIFICATION_SUBSCRIPTION = gql`
  subscription NotificationReceived {
    notificationReceived {
      id
      type
      sender {
        id
        username
      }
      post {
        id
      }
      comment {
        id
      }
      chat {
        id
      }
      read
      createdAt
    }
  }
`;

const NotificationDisplay = () => {
  const router = useRouter();

  const { data, loading, error } = useSubscription(NOTIFICATION_SUBSCRIPTION);
  console.log("hello", data);

  useEffect(() => {
    if (error) {
      console.error("Notification subscription error:", error.message);
      return;
    }

    if (data?.notificationReceived) {
      const notification = data.notificationReceived;
      const message = getNotificationMessage(notification);
      const link = getNotificationLink(notification);

      toast(message, {
        duration: 5000,
        position: "top-right",
        style: {
          border: "1px solid #ddd",
          padding: "12px",
          background: "#fff",
          color: "#333",
        },
        icon: "🔔",
        // Redirect when the toast is clicked
        onClick: () => {
          if (link) router.push(link);
        },
      });
    }
  }, [data, error, router]);

  // Helper to generate notification text
  const getNotificationMessage = (notification) => {
    console.log("notification", notification);

    const username = notification?.sender?.username || "Someone";
    switch (notification.type) {
      case "like":
        return `${username} liked your post`;
      case "comment":
        return `${username} commented on your post`;
      case "follow":
        return `${username} started following you`;
      case "message":
        return `New message from ${username}`;
      default:
        return "You have a new notification";
    }
  };

  // Helper to get appropriate link
  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case "like":
      case "comment":
        return notification?.post?.id ? `/post/${notification.post.id}` : null;
      case "follow":
        return notification?.sender?.id
          ? `/profile/${notification.sender.id}`
          : null;
      case "message":
        return notification?.chat?.id
          ? `/messages?chat=${notification.chat.id}`
          : null;
      default:
        return null;
    }
  };

  return null; // no UI rendered
};

export default NotificationDisplay;
