declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      getAppName: () => Promise<string>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      onNewTask: (callback: () => void) => void;
      onAppReady: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
      platform: string;
      isDev: boolean;
    };
  }
}

export {}; 