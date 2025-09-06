import React from "react";
import { FileText, Search } from "lucide-react";

const TabButton = ({ id, label, icon, active, onClick }) => (
  <button
    className={`relative px-4 py-2 rounded-xl border transition duration-200 ${
      active
        ? "bg-secondary border-border text-foreground font-medium"
        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/70"
    }`}
    onClick={onClick}
    role="tab"
    aria-selected={active}
    aria-controls={`${id}-panel`}
  >
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
    {active && (
      <span className="absolute left-4 right-4 -bottom-[6px] h-[2px] bg-ring rounded-full" />
    )}
  </button>
);

export default function TabNavigation({
  activeTab,
  switchTab,
  className = "",
}) {
  return (
    <div className={`flex gap-1 ${className}`} role="tablist">
      <TabButton
        id="store"
        label="Store Text"
        icon={<FileText className="size-4" aria-hidden="true" />}
        active={activeTab === "store"}
        onClick={() => switchTab("store")}
      />
      <TabButton
        id="retrieve"
        label="Retrieve Text"
        icon={<Search className="size-4" aria-hidden="true" />}
        active={activeTab === "retrieve"}
        onClick={() => switchTab("retrieve")}
      />
    </div>
  );
}
