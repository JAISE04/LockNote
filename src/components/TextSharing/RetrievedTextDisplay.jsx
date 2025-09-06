import React, { useState } from "react";
import { CheckCircle, Copy, Check } from "lucide-react";

export default function RetrievedTextDisplay({ text, onCopy, className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (onCopy) {
      await onCopy(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-card/50 p-6 animate-fade-in ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="size-4 text-success" />
          <span className="text-sm font-medium text-muted-foreground">
            Retrieved Text
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-secondary hover:bg-muted rounded-lg transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Copy text"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        <pre className="whitespace-pre-wrap break-words text-sm font-mono leading-relaxed text-foreground">
          {text}
        </pre>
      </div>
    </div>
  );
}
