// Minimal kintone global typings used by this plugin. Only the surface actually
// called is declared; extend as needed rather than pulling in the full dts.

interface KintoneLoginUser {
  code: string;
  timeZone?: string;
}

interface KintoneEvent {
  viewType?: string;
  viewId?: string;
  [key: string]: unknown;
}

interface KintoneNamespace {
  events: {
    on(
      event: string | string[],
      handler: (event: KintoneEvent) => KintoneEvent | Promise<KintoneEvent>,
    ): void;
  };
  app: {
    getId(): number | null;
    getHeaderMenuSpaceElement(): HTMLElement | null;
    record: {
      getHeaderMenuSpaceElement(): HTMLElement | null;
    };
  };
  plugin: {
    app: {
      getConfig(id: string): Record<string, string>;
      setConfig(config: Record<string, string>, callback?: () => void): void;
    };
  };
  getLoginUser(): KintoneLoginUser;
  // Replaced by kintone at load time with the actual plugin id.
  $PLUGIN_ID: string;
}

declare const kintone: KintoneNamespace;
