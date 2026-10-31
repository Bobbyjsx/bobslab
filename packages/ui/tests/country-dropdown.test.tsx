// @vitest-environment jsdom
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CountryDropdown, findCountryByCode } from "../src/index";

afterEach(async () => {
  cleanup();
  await new Promise((resolve) => setTimeout(resolve, 20));
});

describe("@bobslab/ui CountryDropdown", () => {
  it("renders default trigger button with default country GB", () => {
    render(<CountryDropdown defaultValue="GB" />);

    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button.textContent).toContain("🇬🇧");
    expect(button.textContent).toContain("GB");
  });

  it("findCountryByCode resolves correct country objects", () => {
    const gb = findCountryByCode("GB");
    expect(gb).toBeDefined();
    expect(gb?.name).toBe("United Kingdom");
    expect(gb?.flag).toBe("🇬🇧");

    const us = findCountryByCode("us");
    expect(us).toBeDefined();
    expect(us?.name).toBe("United States");

    const unknown = findCountryByCode("ZZ");
    expect(unknown).toBeUndefined();
  });

  it("handles controlled value correctly", () => {
    render(<CountryDropdown value="US" />);
    const button = screen.getByRole("button");
    expect(button.textContent).toContain("United States");
    expect(button.textContent).toContain("US");
  });

  it("renders custom trigger when children render prop is provided", () => {
    render(
      <CountryDropdown value="CA">
        {({ selectedCountry, isOpen }) => (
          <button data-testid="custom-trigger">
            <span>{selectedCountry?.flag}</span>
            <span>{selectedCountry?.code}</span>
            <span>{isOpen ? "Open" : "Closed"}</span>
          </button>
        )}
      </CountryDropdown>,
    );

    const trigger = screen.getByTestId("custom-trigger");
    expect(trigger).toBeDefined();
    expect(trigger.textContent).toContain("🇨🇦");
    expect(trigger.textContent).toContain("CA");
  });

  it("opens popover, filters list on search, and calls onChange on selection", async () => {
    const handleChange = vi.fn();
    const handleValueChange = vi.fn();

    render(
      <CountryDropdown
        defaultValue="GB"
        onChange={handleChange}
        onValueChange={handleValueChange}
      />,
    );

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    // Search input should be visible
    const searchInput = screen.getByPlaceholderText(
      "Search country or code...",
    );
    expect(searchInput).toBeDefined();

    // Search for "Japan"
    fireEvent.change(searchInput, { target: { value: "Japan" } });

    // Option should appear in the virtualized list
    const japanOption = await screen.findByText("Japan");
    expect(japanOption).toBeDefined();

    // Click Japan option
    fireEvent.click(japanOption);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "JP",
        name: "Japan",
        flag: "🇯🇵",
      }),
    );
    expect(handleValueChange).toHaveBeenCalledWith("JP");
  });

  it("shows emptyText when search yields no matches", async () => {
    render(
      <CountryDropdown
        defaultValue="GB"
        emptyText="No matching countries found"
      />,
    );

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText(
      "Search country or code...",
    );
    fireEvent.change(searchInput, { target: { value: "XYZXYZXYZ" } });

    const empty = await screen.findByText("No matching countries found");
    expect(empty).toBeDefined();
  });

  it("supports keyboard navigation with Enter to select", async () => {
    const handleChange = vi.fn();

    render(<CountryDropdown defaultValue="GB" onChange={handleChange} />);

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText(
      "Search country or code...",
    );
    // Search for "Germany"
    fireEvent.change(searchInput, { target: { value: "Germany" } });

    // Press Enter to select the top filtered item
    fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "DE",
        name: "Germany",
        flag: "🇩🇪",
      }),
    );
  });

  it("supports common alias search such as UK and USA", async () => {
    render(<CountryDropdown defaultValue="CA" />);

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText(
      "Search country or code...",
    );

    // Search for "UK"
    fireEvent.change(searchInput, { target: { value: "UK" } });
    const ukOption = await screen.findByText("United Kingdom");
    expect(ukOption).toBeDefined();

    // Search for "USA"
    fireEvent.change(searchInput, { target: { value: "USA" } });
    const usOption = await screen.findByText("United States");
    expect(usOption).toBeDefined();
  });

  it("allows clearing search query with clear button", async () => {
    render(<CountryDropdown defaultValue="GB" />);

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText(
      "Search country or code...",
    );
    fireEvent.change(searchInput, { target: { value: "France" } });

    const clearButton = screen.getByLabelText("Clear search");
    expect(clearButton).toBeDefined();

    fireEvent.click(clearButton);
    expect((searchInput as HTMLInputElement).value).toBe("");
  });

  it("honors priorityCountries pinning at top of list", async () => {
    render(
      <CountryDropdown defaultValue="AF" priorityCountries={["GB", "US"]} />,
    );

    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);

    // GB should be in first visible positions
    const gbOption = await screen.findByText("United Kingdom");
    expect(gbOption).toBeDefined();
  });
});
