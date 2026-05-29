import "@testing-library/jest-dom";
import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./mocks/server";

class MockDataTransfer {
  files: File[] = [];
  items = {
    add: (file: File) => { this.files.push(file); },
    [Symbol.iterator]: function () { return [][Symbol.iterator](); },
  };
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });

  Object.defineProperty(globalThis, "DataTransfer", {
    value: MockDataTransfer,
    writable: true,
    configurable: true,
  });

  if (typeof window !== "undefined" && window.HTMLInputElement) {
    const nativeDescriptor = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "files"
    );
    if (nativeDescriptor?.set) {
      Object.defineProperty(window.HTMLInputElement.prototype, "files", {
        set(value: FileList | null) {
          try { nativeDescriptor.set.call(this, value); } catch { }
        },
        get: nativeDescriptor.get,
        configurable: true,
      });
    }
  }
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
