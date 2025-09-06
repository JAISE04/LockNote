import React, { useState } from "react";
import { Eye, EyeOff, Save, Shield } from "lucide-react";
import FormGroup from "./FormGroup";
import ActionButton from "./ActionButton";
import Message from "./Message";
import { createNote } from "../../lib/notesService";

export default function StoreTextTab() {
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [noteId, setNoteId] = useState("");
  const [expiration, setExpiration] = useState("never");
  const [oneTime, setOneTime] = useState(false);

  const validatePassword = (pwd) => pwd.trim().length >= 3;

  const getExpirationDate = () => {
    if (expiration === "never") return null;
    const now = new Date();
    switch (expiration) {
      case "1hour":
        return new Date(now.getTime() + 60 * 60 * 1000);
      case "1day":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "1week":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "1month":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  const getExpirationISO = () => {
    const d = getExpirationDate();
    return d ? d.toISOString() : null; // Supabase expects ISO string or null
  };

  const handleStoreText = async () => {
    setError("");
    setMessage(null);

    if (!text.trim()) return setError("Please enter some text to store");
    if (!password.trim()) return setError("Please set a password");
    if (!validatePassword(password))
      return setError("Password must be at least 3 characters long");

    setIsLoading(true);
    try {
      // NEW: object-style service signature
      const { id } = await createNote({
        text: text.trim(),
        password,
        expiresAt: getExpirationISO(),
        oneTime,
      });

      setNoteId(id);
      setMessage({
        type: "success",
        content: "Text stored securely!",
        noteId: id,
        expiration,
        oneTime,
      });

      // Reset form
      setText("");
      setPassword("");
      setExpiration("never");
      setOneTime(false);
    } catch (err) {
      setError(err?.message || "Failed to store text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // onKeyPress is deprecated; support Ctrl/Cmd+Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleStoreText();
    }
  };

  return (
    <div className="space-y-6" role="tabpanel" id="store-panel" aria-live="polite">
      <FormGroup
        label="Your Text/Message"
        required
        hint="Enter the text you want to store securely"
        error={error}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your text or paragraph here..."
          maxLength={5000}
          className="w-full rounded-xl bg-background/40 border border-input px-4 py-3 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-32 resize-vertical"
          aria-describedby={error ? "your-text-message-error" : "your-text-message-hint"}
          data-invalid={Boolean(error)}
        />
      </FormGroup>

      <FormGroup label="Set Password" required hint="Minimum 3 characters">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Create a secure password..."
            className="w-full rounded-xl bg-background/40 border border-input px-4 py-3 pr-12 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive"
            aria-describedby="set-password-hint"
            data-invalid={!validatePassword(password) && password.length > 0}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </FormGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup label="Expiration" hint="When should this note expire?">
          <select
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
            className="w-full rounded-xl bg-background/40 border border-input px-4 py-3 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="never">Never</option>
            <option value="1hour">1 Hour</option>
            <option value="1day">1 Day</option>
            <option value="1week">1 Week</option>
            <option value="1month">1 Month</option>
          </select>
        </FormGroup>

        <FormGroup label="Security" hint="Additional security options">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={oneTime}
              onChange={(e) => setOneTime(e.target.checked)}
              className="rounded border-input text-primary focus:ring-ring focus:ring-offset-2"
            />
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-muted-foreground" />
              <span className="text-sm">Burn after reading</span>
            </div>
          </label>
        </FormGroup>
      </div>

      <ActionButton
        onClick={handleStoreText}
        icon={<Save className="size-4" aria-hidden />}
        loading={isLoading}
        disabled={!text.trim() || !password.trim()}
        variant="primary"
      >
        Store Text Securely
      </ActionButton>

      {message && <Message message={message} noteId={noteId} />}
    </div>
  );
}
