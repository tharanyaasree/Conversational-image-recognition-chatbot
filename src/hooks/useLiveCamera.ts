import { useEffect, useState } from "react";

type Listener = () => void;
const listeners = new Set<Listener>();
const state = { active: false };

function emit() { listeners.forEach((l) => l()); }

export function useLiveCamera() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return {
    active: state.active,
    setActive: (v: boolean) => { state.active = v; emit(); },
    toggle: () => { state.active = !state.active; emit(); },
  };
}
