'use client';

import { useCallback, useEffect, useState } from 'react';

type InstallPromptOutcome = 'accepted' | 'dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallPromptOutcome; platform: string }>;
};

type PwaInstallSnapshot = {
  canInstall: boolean;
  isInstalled: boolean;
};

let promptEvent: BeforeInstallPromptEvent | null = null;
let hasListeners = false;
let isInstalled = false;
const subscribers = new Set<() => void>();

function getIsStandalone() {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone,
    )
  );
}

function getSnapshot(): PwaInstallSnapshot {
  return {
    canInstall: Boolean(promptEvent) && !isInstalled,
    isInstalled,
  };
}

function emitChange() {
  subscribers.forEach((subscriber) => subscriber());
}

export function initPwaInstallPrompt() {
  if (typeof window === 'undefined' || hasListeners) return;

  hasListeners = true;
  isInstalled = getIsStandalone();

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    promptEvent = event as BeforeInstallPromptEvent;
    isInstalled = getIsStandalone();
    emitChange();
  });

  window.addEventListener('appinstalled', () => {
    promptEvent = null;
    isInstalled = true;
    emitChange();
  });
}

export function usePwaInstallPromptCapture() {
  useEffect(() => {
    initPwaInstallPrompt();
  }, []);
}

export function usePwaInstall() {
  const [snapshot, setSnapshot] = useState<PwaInstallSnapshot>(() =>
    getSnapshot(),
  );

  useEffect(() => {
    initPwaInstallPrompt();

    const updateSnapshot = () => setSnapshot(getSnapshot());
    updateSnapshot();
    subscribers.add(updateSnapshot);

    return () => {
      subscribers.delete(updateSnapshot);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent || isInstalled) return;

    const event = promptEvent;
    promptEvent = null;
    emitChange();

    await event.prompt();
    const choice = await event.userChoice;

    if (choice.outcome === 'accepted') {
      isInstalled = true;
    }

    emitChange();
  }, []);

  return { ...snapshot, install };
}
