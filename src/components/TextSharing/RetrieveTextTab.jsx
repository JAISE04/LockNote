import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Search } from "lucide-react";
import FormGroup from "./FormGroup";
import ActionButton from "./ActionButton";
import Message from "./Message";
import RetrievedTextDisplay from "./RetrievedTextDisplay";
import { fetchNoteByPassword } from "../../lib/notesService";

export default function RetrieveTextTab() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [retrievedText, setRetrievedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const passwordRef = useRef(null);
  useEffect(() => { passwordRef.current?.focus(); }, []);

  const handleRetrieveText = async () => {
    setError("");
    setMessage(null);
    setRetrievedText("");

    if (!password.trim()) return setError("Please enter the password.");

    setIsLoading(true);
    try {
      const res = await fetchNoteByPassword(password);

      if (res?.notFound) {
        setError("No note found for this password (invalid or expired).");
      } else if (res?.wrongPassword) {
        setError("Incorrect password.");
      } else {
        setRetrievedText(res.plaintext);
        setMessage({
          type: "success",
          content: `Text retrieved successfully! ${
            res.meta?.one_time ? "This note was deleted after viewing." : ""
          }`,
        });
        setPassword("");
      }
    } catch (err) {
      setError(err?.message || "Failed to retrieve text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRetrieveText();
    }
  };

  return (
    <div className="space-y-6" role="tabpanel" id="retrieve-panel" aria-live="polite">
      <FormGroup
        label="Password"
        required
        hint="Enter the password used to encrypt the note"
        error={error}
      >
        <div className="relative">
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter the password..."
            className="w-full rounded-xl bg-background/40 border border-input px-4 py-3 pr-12 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive"
            aria-describedby="password-hint"
            data-invalid={Boolean(error)}
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

      <ActionButton
        onClick={handleRetrieveText}
        icon={<Search className="size-4" aria-hidden />}
        loading={isLoading}
        disabled={!password.trim()}
        variant="primary"
      >
        Retrieve Text
      </ActionButton>

      {message && <Message message={message} />}
      {retrievedText && (
        <RetrievedTextDisplay
          text={retrievedText}
          onCopy={async (t) => navigator.clipboard.writeText(t)}
        />
      )}
    </div>
  );
}
