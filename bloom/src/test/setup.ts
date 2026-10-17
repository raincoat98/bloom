class MemoryStorage implements Storage {
  readonly #values = new Map<string, string>();

  get length() {
    return this.#values.size;
  }

  clear() {
    this.#values.clear();
  }

  getItem(key: string) {
    return this.#values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.#values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.#values.delete(key);
  }

  setItem(key: string, value: string) {
    this.#values.set(key, value);
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
});

Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: globalThis,
});
class MockClassList {
  readonly #classes = new Set<string>();

  add(cls: string) {
    this.#classes.add(cls);
  }

  remove(cls: string) {
    this.#classes.delete(cls);
  }

  toggle(cls: string, force?: boolean): boolean {
    const shouldAdd = force !== undefined ? force : !this.#classes.has(cls);
    if (shouldAdd) {
      this.#classes.add(cls);
    } else {
      this.#classes.delete(cls);
    }
    return shouldAdd;
  }

  contains(cls: string): boolean {
    return this.#classes.has(cls);
  }
}

const mockDocumentElement = {
  classList: new MockClassList(),
};

Object.defineProperty(globalThis, 'document', {
  configurable: true,
  value: {
    documentElement: mockDocumentElement,
    querySelector: () => null,
  },
});

if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
