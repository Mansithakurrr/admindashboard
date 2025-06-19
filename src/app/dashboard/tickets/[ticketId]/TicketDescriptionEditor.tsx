// src/app/dashboard/tickets/[ticketId]/TicketDescriptionEditor.tsx
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TicketDescriptionEditorProps {
  description: string;
  originalDescription: string;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  onDescriptionChange: (newDescription: string) => void;
  showHistory: boolean;
  onToggleHistory: (show: boolean) => void;
}

export const TicketDescriptionEditor: React.FC<TicketDescriptionEditorProps> = ({
  description,
  originalDescription,
  isEditing,
  setIsEditing,
  onSave,
  onCancel,
  onDescriptionChange,
  showHistory,
  onToggleHistory,
}) => {
  const hasDescriptionBeenEdited = description !== originalDescription;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-700">Description</h2>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </div>
      {isEditing ? (
        <div className="max-w-full">
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={8}
            className="w-full max-h-[20px]"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" className="mt-2" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              className="mt-2 bg-blue-500 hover:bg-blue-600"
              onClick={onSave}
            >
              Save Description
            </Button>
          </div>
        </div>
      ) : (
        <p className="break-all">{description}</p>
      )}
      {hasDescriptionBeenEdited && (
        <div className="flex items-center space-x-2 mt-6 border-t pt-4">
          <Switch
            id="desc-history-toggle"
            checked={showHistory}
            onCheckedChange={onToggleHistory}
          />
          <Label
            htmlFor="desc-history-toggle"
            className="font-semibold text-gray-600"
          >
            Show Description History
          </Label>
        </div>
      )}
      {hasDescriptionBeenEdited && showHistory && (
        <div className="mt-4 space-y-4">
          <div className="p-3 bg-gray-100 rounded-md">
            <h4 className="text-sm font-bold text-gray-500">
              Original Description
            </h4>
            <p className="text-sm text-gray-700 mt-1">{originalDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
};