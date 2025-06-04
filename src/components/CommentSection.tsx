"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface Comment {
  _id: string; 
  text: string;
  author: string;
  createdAt: string; 
  formattedTimestamp?: string; 
}

interface CommentSectionProps {
  ticketId: string;
  onCommentAdded: (commentText: string, author: string) => void;
}

export const CommentSection = ({
  ticketId,
  onCommentAdded,
}: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  // Ref for the scrollable comments list
  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);


  useEffect(() => {
    const fetchComments = async () => {
      if (!ticketId) return;
      setIsLoadingComments(true);
      try {
        const res = await fetch(`/api/comments?ticketId=${ticketId}`);
        if (!res.ok) {
          console.error("Failed to fetch comments, status:", res.status);
          setComments([]);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          const updated = data.map((comment: any) => ({
            ...comment,
            formattedTimestamp: new Date(comment.createdAt).toLocaleString(
              "en-IN",
              { dateStyle: "medium", timeStyle: "short" }
            ),
          }));
          setComments(updated);
        } else {
          console.error("Fetched comments data is not an array:", data);
          setComments([]);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      } finally {
        setIsLoadingComments(false);
      }
    };
    fetchComments();
  }, [ticketId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newComment,
          author: "Ayush (You)", 
          ticketId: ticketId,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error submitting comment: ${errorData.message || "Please try again."}`);
        return;
      }
      const savedComment = await res.json();
      const newDisplayComment: Comment = {
        ...savedComment,
        formattedTimestamp: new Date(savedComment.createdAt).toLocaleString(
          "en-IN",
          { dateStyle: "medium", timeStyle: "short" }
        ),
      };
      setComments((prev) => [...prev, newDisplayComment]);
      setNewComment("");
      if (onCommentAdded) {
        onCommentAdded(savedComment.text, savedComment.author);
      }
    } catch (error) {
      alert("An error occurred while submitting your comment.");
    }
  };

  return (
    // Main container:
    // h-full: Fills the height allocated by its parent (the h-3/5 div in TicketViewClient)
    // overflow-hidden: Crucial. Ensures this container itself doesn't grow beyond its allocated height
    //                  and forces internal scrolling.
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* Comments List (Scrollable) */}
      {/* flex-grow: Takes up available space. */}
      {/* overflow-y-auto: Makes this specific div scrollable. */}
      {/* min-h-0: Critical for flex-grow and overflow-y-auto to work correctly in a fixed-height parent,
                   allowing the element to shrink properly before growing. */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 min-h-0">
        {isLoadingComments && <p className="text-center text-gray-500">Loading comments...</p>}
        {!isLoadingComments && comments.length === 0 && (
            <p className="text-center text-gray-400">No comments yet. Be the first to comment!</p>
        )}
        {comments.map((comment) => (
          <div key={comment._id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 bg-gray-300 rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold">
              {comment.author ? comment.author.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="flex-1">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm text-gray-800">
                  {comment.author}
                </p>
                <p className="text-gray-700 text-sm break-words">{comment.text}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">
                {comment.formattedTimestamp}
              </p>
            </div>
          </div>
        ))}
        {/* Empty div to scroll to */}
        <div ref={commentsEndRef} />
      </div>

      {/* Input Area (Fixed height at bottom) */}
      {/* flex-shrink-0: Prevents this div from shrinking. */}
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