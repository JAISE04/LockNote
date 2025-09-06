import React from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const MessageIcon = ({ type }) => {
  const icons = {
    success: <CheckCircle className="size-4" aria-hidden="true" />,
    error: <XCircle className="size-4" aria-hidden="true" />,
    warning: <AlertTriangle className="size-4" aria-hidden="true" />,
  };
  return icons[type] || null;
};

export default function Message({ message, className = "" }) {
  const variants = {
    success: "bg-success/10 border-success/20 text-success-foreground",
    error:
      "bg-destructive/10 border-destructive/20 text-destructive-foreground",
    warning: "bg-warning/10 border-warning/20 text-warning-foreground",
  };

  return (
    <div
      className={`p-4 rounded-xl border animate-fade-in ${
        variants[message.type]
      } ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <MessageIcon type={message.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{message.content}</div>
          {message.noteId && (
            <div className="mt-3 p-3 bg-background/50 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-2">
                Note ID (share this with others):
              </div>
              <div className="text-sm font-mono font-semibold tracking-wide break-all">
                {message.noteId}
              </div>
              {message.expiration && message.expiration !== "never" && (
                <div className="text-xs text-muted-foreground mt-2">
                  Expires: {message.expiration}
                </div>
              )}
              {message.oneTime && (
                <div className="text-xs text-warning mt-1">
                  ⚠️ This note will be deleted after first viewing
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
