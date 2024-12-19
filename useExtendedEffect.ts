import { useEffect, useLayoutEffect, useRef } from "react";

interface props {
  mode?: "DEFAULT" | "LAYOUT";
  exec: (finish: any) => void;
  dependencies?: any[];
}

export function useExtendedEffect({
  mode = "DEFAULT",
  exec,
  dependencies = [],
}: props) {
  const runOnce = useRef(false);

  (mode === "LAYOUT" ? useLayoutEffect : useEffect)(() => {
    if (runOnce.current) return;
    exec(() => {
      runOnce.current = true;
    });
  }, dependencies);
}
