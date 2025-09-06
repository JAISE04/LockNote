import React, { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import TabNavigation from "./TabNavigation";
import StoreTextTab from "./StoreTextTab";
import RetrieveTextTab from "./RetrieveTextTab";

export default function TextSharingApp() {
  const [activeTab, setActiveTab] = useState("store");
  const [prefillId, setPrefillId] = useState("");

  // Parse "#/abc123" or "#abc123" and prefill Retrieve tab
  const parseHash = useCallback(() => {
    const raw = window.location.hash || "";
    const id = raw.replace(/^#\/?/, "").trim();
    if (id) {
      setActiveTab("retrieve");
      setPrefillId(id);
    } else {
      setPrefillId("");
    }
  }, []);

  useEffect(() => {
    parseHash(); // on mount
    window.addEventListener("hashchange", parseHash);
    return () => window.removeEventListener("hashchange", parseHash);
  }, [parseHash]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === "store") {
      // Clear hash so IDs aren't left in the URL when returning to Store
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  };

  return (
    <main className="min-h-dvh bg-app">
      <div className="container max-w-3xl py-12 md:py-14">
        <div className="mx-auto max-w-3xl rounded-2xl bg-card/80 backdrop-blur border border-border shadow-[0_20px_60px_rgba(0,0,0,.45)] p-8 md:p-10">
          <Header />
          <TabNavigation
            activeTab={activeTab}
            switchTab={switchTab}
            className="mb-6"
          />
          <div>
            {activeTab === "store" && <StoreTextTab />}
            {activeTab === "retrieve" && <RetrieveTextTab prefillId={prefillId} />}
          </div>
        </div>
      </div>
    </main>
  );
}
