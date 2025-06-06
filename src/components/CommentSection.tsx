// src/components/CommentSection.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquareText } from "lucide-react"; // Added MessageSquareText for placeholder

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
  // If you intend to pass comments from TicketViewClient (which is good for consistency with activityLog)
  // you would have a prop like:
  // commentsFromParent: Comment[]; 
}

export const CommentSection = ({
  ticketId,
  onCommentAdded,
}: CommentSectionProps) => {
  // This local 'comments' state will be for comments fetched by this component.
  // If parent passes 'ticket.comments', this component might not need to fetch/manage this list.
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  
  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!ticketId) {
        setIsLoadingComments(false);
        return;
      }
      setIsLoadingComments(true);
      try {
        // TODO: Ensure this API endpoint exists and works as expected
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
    const author = "You"; // Replace with actual logged-in user
    
    try {
      // TODO: Ensure this API endpoint exists and correctly saves the comment AND returns the saved comment
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newComment,
          author: author,
          ticketId: ticketId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error submitting comment: ${errorData.message || "Please try again."}`);
        return;
      }
      const savedComment = await res.json(); // Expect the saved comment with _id, createdAt
      
      const newDisplayComment: Comment = {
        ...savedComment,
        formattedTimestamp: new Date(savedComment.createdAt).toLocaleString(
          "en-IN",
          { dateStyle: "medium", timeStyle: "short" }
        ),
      };
      setComments((prev) => [...prev, newDisplayComment]);
      onCommentAdded(savedComment.text, savedComment.author); // Notify parent to update activity log
      setNewComment(""); // Clear input after successful submission
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("An error occurred while submitting your comment.");
    }
  };

  return (
    // Main container:
    // h-full: Fills the height allocated by its parent (e.g., the h-3/5 div in TicketViewClient)
    // overflow-hidden: Ensures this container itself doesn't grow.
    // flex flex-col: Key for distributing space between comments list and input.
    <div className="flex flex-col h-full">

      {/* Comments List Area (Scrollable) */}
      {/* flex-1: This is equivalent to flex-grow: 1, flex-shrink: 1, flex-basis: 0%. It will take up available space. */}
      {/* overflow-y-auto: Makes this specific div scrollable. */}
      {/* min-h-0: Allows this flex item to shrink smaller than its content if needed, crucial for scrolling. */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {isLoadingComments && (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Loading comments...</p>
          </div>
        )}
        {!isLoadingComments && comments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquareText className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium">No comments yet.</p>
            <p className="text-sm">Be the first to add to the conversation!</p>
          </div>
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
        {/* Empty div to scroll to when new comments are added */}
        {comments.length > 0 && <div ref={commentsEndRef} />}
      </div>

      {/* Input Area (Fixed height at the bottom) */}
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
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};