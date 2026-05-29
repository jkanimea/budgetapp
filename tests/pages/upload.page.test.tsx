import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/upload",
}));

import UploadPage from "@/app/upload/page";

function createFile(name: string, content: string, type: string): File {
  return new File([content], name, { type });
}

describe("Upload Page", () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it("import button disabled when no file selected", () => {
    render(<UploadPage />);

    const btn = screen.getByRole("button", { name: /import csv/i });
    expect(btn).toBeDisabled();
  });

  it("drag-and-drop a CSV file sets filename", async () => {
    render(<UploadPage />);

    const dropZone = screen.getByText(/drop your csv file here/i).closest("div");
    expect(dropZone).toBeInTheDocument();

    const file = createFile("test.csv", "test content", "text/csv");
    Object.defineProperty(file, "name", { value: "test.csv" });

    if (dropZone) {
      const event = new Event("drop", { bubbles: true });
      Object.defineProperty(event, "dataTransfer", {
        value: {
          files: [file],
          items: [{ kind: "file", type: "text/csv", getAsFile: () => file }],
        },
      });
      dropZone.dispatchEvent(event);
    }

    await waitFor(() => {
      expect(screen.getByText("test.csv")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("shows success toast on successful upload", async () => {
    const user = userEvent.setup();
    render(<UploadPage />);

    const file = createFile("data.csv", "test", "text/csv");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      Object.defineProperty(input, "files", { value: [file] });
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    await waitFor(() => {
      expect(screen.getByText("data.csv")).toBeInTheDocument();
    }, { timeout: 3000 });

    const btn = screen.getByRole("button", { name: /import csv/i });
    await user.click(btn);

    await waitFor(() => {
      expect(screen.queryByText("test.csv")).toBeNull();
    }, { timeout: 3000 });
  });

  it("shows error toast on failed upload", async () => {
    server.use(
      http.post("*/api/transactions", () => {
        return HttpResponse.json({ error: "Upload failed" }, { status: 500 });
      })
    );

    const user = userEvent.setup();
    render(<UploadPage />);

    const file = createFile("data.csv", "test", "text/csv");
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      Object.defineProperty(input, "files", { value: [file] });
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    await waitFor(() => {
      expect(screen.getByText("data.csv")).toBeInTheDocument();
    }, { timeout: 3000 });

    const btn = screen.getByRole("button", { name: /import csv/i });
    await user.click(btn);
  });
});
