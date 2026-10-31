"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  SearchIcon,
} from "@bobslab/icons";
import { cn } from "@bobslab/utils";
import { type Country, COUNTRIES, findCountryByCode } from "./countries-data";

export type { Country };
export { COUNTRIES, findCountryByCode };

export interface CountryDropdownProps {
  /**
   * The currently selected country ISO-2 code (controlled).
   */
  value?: string;
  /**
   * The initial selected country ISO-2 code (uncontrolled).
   */
  defaultValue?: string;
  /**
   * Callback fired when a country is selected, returning the full Country object.
   */
  onChange?: (country: Country) => void;
  /**
   * Callback fired when a country is selected, returning the ISO-2 code.
   */
  onValueChange?: (code: string) => void;
  /**
   * Custom list of countries to display. Defaults to all ISO 3166-1 alpha-2 countries.
   */
  countries?: Country[];
  /**
   * Optional list of ISO codes to pin at the top of the list when not searching.
   * e.g. ['GB', 'US', 'CA', 'AU', 'DE', 'FR']
   */
  priorityCountries?: string[];
  /**
   * Placeholder text when no country is selected.
   * @default "Select country..."
   */
  placeholder?: string;
  /**
   * Placeholder for search input.
   * @default "Search country or code..."
   */
  searchPlaceholder?: string;
  /**
   * Text shown when search yields no matches.
   * @default "No countries found."
   */
  emptyText?: string;
  /**
   * Whether the dropdown trigger is disabled.
   */
  disabled?: boolean;
  /**
   * Class name applied to the outer container.
   */
  className?: string;
  /**
   * Class name applied to the default trigger button.
   */
  triggerClassName?: string;
  /**
   * Class name applied to the popover content card.
   */
  contentClassName?: string;
  /**
   * Height of the virtualized scroll container in pixels.
   * @default 260
   */
  listHeight?: number;
  /**
   * Height of each individual country row in pixels.
   * @default 38
   */
  itemHeight?: number;
  /**
   * Overscan item count rendered outside the visible area.
   * @default 4
   */
  overscan?: number;
  /**
   * Whether to display the search input inside the popover.
   * @default true
   */
  showSearch?: boolean;
  /**
   * Whether to display flag emoji.
   * @default true
   */
  showFlag?: boolean;
  /**
   * Whether to display ISO-2 code badge.
   * @default true
   */
  showCode?: boolean;
  /**
   * Popover alignment relative to trigger.
   * @default "start"
   */
  align?: "start" | "center" | "end";
  /**
   * Distance between trigger and popover in pixels.
   * @default 6
   */
  sideOffset?: number;
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * Callback when popover open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Optional custom trigger renderer.
   */
  renderTrigger?: (
    selectedCountry: Country | undefined,
    isOpen: boolean,
  ) => React.ReactNode;
  /**
   * Optional children for custom trigger.
   */
  children?:
    | React.ReactNode
    | ((props: {
        selectedCountry?: Country;
        isOpen: boolean;
      }) => React.ReactNode);
}

const COMMON_ALIASES: Record<string, string> = {
  UK: "GB",
  USA: "US",
  UAE: "AE",
  ENGLAND: "GB",
  BRITAIN: "GB",
  HOLLAND: "NL",
  RUSSIA: "RU",
  KOREA: "KR",
};

export const CountryDropdown = React.forwardRef<
  HTMLButtonElement,
  CountryDropdownProps
>(function CountryDropdown(
  {
    value: controlledValue,
    defaultValue = "GB",
    onChange,
    onValueChange,
    countries = COUNTRIES,
    priorityCountries,
    placeholder = "Select country...",
    searchPlaceholder = "Search country or code...",
    emptyText = "No countries found.",
    disabled = false,
    className,
    triggerClassName,
    contentClassName,
    listHeight = 260,
    itemHeight = 38,
    overscan = 4,
    showSearch = true,
    showFlag = true,
    showCode = true,
    align = "start",
    sideOffset = 6,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    renderTrigger,
    children,
  },
  ref,
) {
  // Controlled vs uncontrolled open
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isOpen =
    controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      controlledOnOpenChange?.(nextOpen);
    },
    [controlledOpen, controlledOnOpenChange],
  );

  // Controlled vs uncontrolled selected country
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const currentValueCode =
    controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const selectedCountry = React.useMemo(() => {
    if (!currentValueCode) return undefined;
    const upper = currentValueCode.toUpperCase();
    return (
      countries.find((c) => c.code.toUpperCase() === upper) ||
      findCountryByCode(upper)
    );
  }, [countries, currentValueCode]);

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Filtered country list
  const filteredCountries = React.useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      if (priorityCountries && priorityCountries.length > 0) {
        const priorityUpper = priorityCountries.map((c) => c.toUpperCase());
        const prioritized: Country[] = [];
        const rest: Country[] = [];

        for (const c of countries) {
          if (priorityUpper.includes(c.code.toUpperCase())) {
            prioritized.push(c);
          } else {
            rest.push(c);
          }
        }
        return [...prioritized, ...rest];
      }
      return countries;
    }

    const aliasTarget = COMMON_ALIASES[trimmed.toUpperCase()];

    return countries.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(trimmed);
      const codeMatch = c.code.toLowerCase().includes(trimmed);
      const dialMatch = c.dialCode?.toLowerCase().includes(trimmed);
      const aliasMatch = aliasTarget && c.code.toUpperCase() === aliasTarget;
      return nameMatch || codeMatch || dialMatch || aliasMatch;
    });
  }, [countries, searchQuery, priorityCountries]);

  // Virtualization state
  const [scrollTop, setScrollTop] = React.useState(0);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = filteredCountries.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    filteredCountries.length - 1,
    Math.floor((scrollTop + listHeight) / itemHeight) + overscan,
  );

  const virtualItems = React.useMemo(() => {
    const items: Array<{ country: Country; index: number; offsetTop: number }> =
      [];
    for (let i = startIndex; i <= endIndex; i++) {
      const country = filteredCountries[i];
      if (country) {
        items.push({
          country,
          index: i,
          offsetTop: i * itemHeight,
        });
      }
    }
    return items;
  }, [startIndex, endIndex, filteredCountries, itemHeight]);

  // Scroll a specific index into view within the virtual container
  const scrollIndexIntoView = React.useCallback(
    (index: number) => {
      if (
        !scrollContainerRef.current ||
        index < 0 ||
        index >= filteredCountries.length
      ) {
        return;
      }
      const itemTop = index * itemHeight;
      const currentTop = scrollContainerRef.current.scrollTop;
      const currentBottom = currentTop + listHeight;

      if (itemTop < currentTop) {
        scrollContainerRef.current.scrollTop = itemTop;
      } else if (itemTop + itemHeight > currentBottom) {
        scrollContainerRef.current.scrollTop =
          itemTop + itemHeight - listHeight;
      }
    },
    [filteredCountries.length, itemHeight, listHeight],
  );

  // When popover opens: reset search & scroll to active item
  const prevOpenRef = React.useRef(isOpen);
  React.useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = isOpen;

    if (isOpen && !wasOpen) {
      setSearchQuery("");
      setScrollTop(0);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      const activeIdx = countries.findIndex(
        (c) => c.code.toUpperCase() === selectedCountry?.code?.toUpperCase(),
      );
      if (activeIdx >= 0) {
        setFocusedIndex(activeIdx);
        // Defer scroll until container is rendered
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const target = Math.max(
              0,
              activeIdx * itemHeight - listHeight / 2 + itemHeight / 2,
            );
            scrollContainerRef.current.scrollTop = target;
          }
        });
      } else {
        setFocusedIndex(0);
      }

      // Auto-focus search input
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen, countries, selectedCountry, itemHeight, listHeight]);

  const handleSelect = React.useCallback(
    (country: Country) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(country.code);
      }
      onChange?.(country);
      onValueChange?.(country.code);
      setOpen(false);
    },
    [controlledValue, onChange, onValueChange, setOpen],
  );

  // Keyboard navigation within the dropdown
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = Math.min(prev + 1, filteredCountries.length - 1);
          scrollIndexIntoView(next);
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          scrollIndexIntoView(next);
          return next;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filteredCountries[focusedIndex];
        if (item) {
          handleSelect(item);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    },
    [
      filteredCountries,
      focusedIndex,
      handleSelect,
      scrollIndexIntoView,
      setOpen,
    ],
  );

  // Render trigger node
  let triggerElement: React.ReactNode;
  if (renderTrigger) {
    triggerElement = renderTrigger(selectedCountry, isOpen);
  } else if (typeof children === "function") {
    triggerElement = children({ selectedCountry, isOpen });
  } else if (children) {
    triggerElement = children;
  } else {
    triggerElement = (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "inline-flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground transition-all shadow-2xs hover:bg-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer outline-none",
          triggerClassName,
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedCountry ? (
            <>
              {showFlag && (
                <span className="text-base leading-none shrink-0">
                  {selectedCountry.flag}
                </span>
              )}
              <span className="truncate">{selectedCountry.name}</span>
              {showCode && (
                <span className="font-mono text-[11px] text-muted-foreground uppercase shrink-0">
                  {selectedCountry.code}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground truncate">
              {placeholder}
            </span>
          )}
        </span>
        <ChevronDownIcon
          size={14}
          className={cn(
            "text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
    );
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          render={triggerElement as React.ReactElement}
        />

        <PopoverContent
          side="bottom"
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 w-72 sm:w-80 overflow-hidden rounded-2xl border border-border bg-background p-2 text-foreground shadow-xl outline-none transition-all",
            contentClassName,
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Search Header */}
          {showSearch && (
            <div className="relative mb-2 flex items-center">
              <SearchIcon
                size={14}
                className="pointer-events-none absolute left-3 text-muted-foreground shrink-0"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFocusedIndex(0);
                  setScrollTop(0);
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = 0;
                  }
                }}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-xl border border-border bg-muted/40 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
                aria-label={searchPlaceholder}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFocusedIndex(0);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 p-0.5 text-muted-foreground hover:text-foreground rounded-full transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <CloseIcon size={12} />
                </button>
              )}
            </div>
          )}

          {/* Virtualized Country List */}
          {filteredCountries.length === 0 ? (
            <div className="flex h-32 items-center justify-center p-4 text-center text-xs text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="relative overflow-y-auto overscroll-contain rounded-xl pr-1 focus:outline-none"
              style={{
                height: `${Math.min(listHeight, totalHeight)}px`,
                maxHeight: `${listHeight}px`,
              }}
              role="listbox"
              aria-label="Countries"
            >
              <div
                style={{
                  height: `${totalHeight}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualItems.map(({ country, index, offsetTop }) => {
                  const isSelected =
                    selectedCountry &&
                    country.code.toUpperCase() ===
                      selectedCountry.code.toUpperCase();
                  const isFocused = index === focusedIndex;

                  return (
                    <div
                      key={country.code}
                      role="option"
                      aria-selected={Boolean(isSelected)}
                      data-highlighted={isFocused}
                      onClick={() => handleSelect(country)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${itemHeight}px`,
                        transform: `translateY(${offsetTop}px)`,
                      }}
                      className={cn(
                        "flex items-center justify-between px-2.5 rounded-lg text-xs cursor-pointer transition-colors select-none",
                        isSelected && "bg-primary/10 text-primary font-medium",
                        !isSelected && isFocused && "bg-muted text-foreground",
                        !isSelected &&
                          !isFocused &&
                          "text-foreground hover:bg-muted/60",
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0 truncate">
                        {showFlag && (
                          <span className="text-base shrink-0 leading-none">
                            {country.flag}
                          </span>
                        )}
                        <span className="truncate">{country.name}</span>
                      </span>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {showCode && (
                          <span className="font-mono text-[11px] text-muted-foreground uppercase">
                            {country.code}
                          </span>
                        )}
                        {isSelected && (
                          <CheckIcon
                            size={14}
                            className="text-primary shrink-0"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer note displaying result count */}
          <div className="mt-1 flex items-center justify-between border-t border-border/60 px-2 pt-1.5 text-[10px] text-muted-foreground">
            <span>
              {filteredCountries.length}{" "}
              {filteredCountries.length === 1 ? "country" : "countries"}
            </span>
            {selectedCountry && (
              <span className="font-mono">
                {selectedCountry.flag} {selectedCountry.code}
              </span>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

CountryDropdown.displayName = "CountryDropdown";
