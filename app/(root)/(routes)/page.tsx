"use client";

import { useStoreModal } from "@/hooks/use-store-modal";
import { useEffect } from "react";

const SetupPage = () => {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen ){
      onOpen();
    }
  },[isOpen,onOpen]);

  return (
    <div
      className="flex flex-col justify-items-center justify-end"
    >
      <main
      // className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start"
      >
      </main>

    </div>
  );
};

export default SetupPage;
