// src/components/CommentSection.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

// Define the shape of a single comment
interface Comment {
  id: number;
  text: string;
  author: string; // In a real app, this would come from the logged-in user
  timestamp: Date;
}

interface CommentSectionProps {
  // This prop is crucial
  onCommentAdded: (commentText: string, author: string) => void; 
}


// For now, we'll start with some mock comments
const initialComments: Comment[] = [
  {
    id: 1,
    text: "Have you tried restarting the service? That sometimes resolves this issue.",
    author: "Jane Doe",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  }, // 2 hours ago
  {
    id: 2,
    text: "Yes, I've tried that and also cleared the cache. The problem persists.",
    author: "John Smith",
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
  }, // 55 minutes ago
];

export const CommentSection = ({
  onCommentAdded,
}: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return; // Don't submit empty comments

    const newCommentObject: Comment = {
      id: comments.length + 1,
      text: newComment,
      author: "Ayush (You)", // Mock author name
      timestamp: new Date(),
    };

    setComments([...comments, newCommentObject]);
    setNewComment(""); // Clear the input field
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ===== Comments List (Scrollable Area) ===== */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 bg-gray-300 rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
              {comment.author.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm text-gray-800">
                  {comment.author}
                </p>
                <p className="text-gray-700">{comment.text}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {comment.timestamp.toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Fixed Comment Input Area ===== */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={handleCommentSubmit}
          className="flex items-center space-x-2"
        >
          <Input
            type="text"
            placeholder="Type your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
