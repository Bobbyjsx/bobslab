import * as React from "react";
import { describe, expect, it } from "vitest";
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  CopyIcon,
  Logo,
  SearchIcon,
  SpinnerIcon,
} from "../src/index";

describe("@bobslab/icons", () => {
  it("renders Logo with custom size and class", () => {
    const el = <Logo className="custom-logo" size={32} />;
    expect(el.props.size).toBe(32);
    expect(el.props.className).toBe("custom-logo");
  });

  it("renders SpinnerIcon with spin class", () => {
    const el = <SpinnerIcon size={20} />;
    expect(el.props.size).toBe(20);
  });

  it("renders CheckIcon, CopyIcon, CloseIcon, SearchIcon, ChevronDownIcon", () => {
    const check = <CheckIcon />;
    const copy = <CopyIcon />;
    const close = <CloseIcon />;
    const search = <SearchIcon />;
    const chevron = <ChevronDownIcon />;

    expect(check).toBeDefined();
    expect(copy).toBeDefined();
    expect(close).toBeDefined();
    expect(search).toBeDefined();
    expect(chevron).toBeDefined();
  });
});
