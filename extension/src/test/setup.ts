import '@testing-library/jest-dom';

// Polyfill window.scrollIntoView if not present in jsdom
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

// Mock chrome APIs for test environment
(global as any).chrome = {
  runtime: {
    sendMessage: async () => ({ status: 'ok' }),
    onMessage: {
      addListener: () => {},
      removeListener: () => {}
    }
  },
  tabs: {
    query: async () => [{ id: 1, url: 'http://localhost:8080/application.html' }],
    sendMessage: async () => ({ status: 'ok' })
  },
  storage: {
    local: {
      get: async () => ({}),
      set: async () => {},
      remove: async () => {}
    }
  },
  sidePanel: {
    setPanelBehavior: async () => {}
  }
};
