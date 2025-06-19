// src/app/dashboard/tickets/[ticketId]/TicketTitleEditor.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TicketTitleEditorProps {
  title: string;
  originalTitle: string;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  onTitleChange: (newTitle: string) => void;
  showHistory: boolean;
  onToggleHistory: (show: boolean) => void;
  submittedBy: string;
}

export const TicketTitleEditor: React.FC<TicketTitleEditorProps> = ({
  title,
  originalTitle,
  isEditing,
  setIsEditing,
  onSave,
  onCancel,
  onTitleChange,
  showHistory,
  onToggleHistory,
  submittedBy,
}) => {
  const hasTitleBeenEdited = title !== originalTitle;

  return (
    <div className="mb-6 pb-4 border-b ">
      <h2 className="text-xl font-semibold text-gray-700">Title</h2>
      <div className="flex justify-between items-start">
        {isEditing ? (
          <div className="w-full space-y-2">
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-3xl font-bold"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600" onClick={onSave}>
                Save Title
              </Button>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl break-all font-bold text-gray-800">
            {title}
          </h1>
        )}
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            className="ml-4 flex-shrink-0"
            onClick={() => setIsEditing(true)}
          >
            Edit Title
          </Button>
        )}
      </div>
      {hasTitleBeenEdited && (
        <div className="flex items-center space-x-2 mt-2">
          <Switch
            id="title-history-toggle"
            checked={showHistory}
            onCheckedChange={onToggleHistory}
          />
          <Label
            htmlFor="title-history-toggle"
            className="text-xs font-semibold text-gray-600"
          >
            Show Title History
          </Label>
        </div>
      )}
      <p className="text-sm text-gray-500 mt-1">
        Submitted by: {submittedBy}
      </p>
      {hasTitleBeenEdited && showHistory && (
        <div className="mb-6 space-y-2 border-b pb-4">
          <div className="p-2 bg-gray-100 rounded-md">
            <h4 className="text-xs font-bold text-gray-500">Original Title</h4>
            <p className="text-sm text-gray-700">{originalTitle}</p>
          </div>
        </div>
      )}
    </div>
  );
};