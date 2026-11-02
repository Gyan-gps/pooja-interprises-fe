import { describe, expect, it } from "vitest";
import { redactSensitiveText } from "@/server/utils/logger";

describe("redactSensitiveText", () => {
  it("redacts MongoDB credentials", () => {
    expect(
      redactSensitiveText("Failed mongodb+srv://user:secret@cluster/db")
    ).toBe("Failed mongodb+srv://***@cluster/db");
  });

  it("redacts bearer tokens and session cookies", () => {
    expect(
      redactSensitiveText("Authorization Bearer abc.def.ghi pe_session=tok123")
    ).toBe("Authorization Bearer *** pe_session=***");
  });
});
