import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import axe from "axe-core";
import Breadcrumbs from "@/components/breadcrumbs";

describe("Breadcrumbs", () => {
  it("marks the current page", () => {
    render(
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { label: "About" },
        ]}
      />,
    );
    expect(screen.getByText("About")).toHaveAttribute("aria-current", "page");
  });
});

describe("accessibility smoke", () => {
  it("breadcrumb landmark has no serious axe violations", async () => {
    const { container } = render(
      <main id="main-content">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "About" }]} />
        <h1>About</h1>
      </main>,
    );
    const results = await axe.run(container, {
      rules: {
        // Next/Link not used here; keep smoke focused on structure.
        region: { enabled: false },
      },
    });
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toEqual([]);
  });
});
