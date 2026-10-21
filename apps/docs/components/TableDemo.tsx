"use client";

import * as React from "react";
import {
  Button,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableCheckbox,
  TableFilterBar,
  TableFilterChip,
  TableHead,
  TableHeader,
  TableRow,
  TableSearchInput,
} from "@bobslab/ui";

interface ServiceItem {
  id: string;
  name: string;
  duration: string;
  price: number;
  location: string;
}

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: "1",
    name: "Website Setup & Configuration",
    duration: "3 hours",
    price: 200,
    location: "New York, NY",
  },
  {
    id: "2",
    name: "Brand Identity Consultation",
    duration: "5 hours",
    price: 320,
    location: "Los Angeles, CA",
  },
  {
    id: "3",
    name: "Product Design Workshop",
    duration: "2 hours",
    price: 275,
    location: "New York, NY",
  },
  {
    id: "4",
    name: "Social Media Content Planning",
    duration: "5 hours",
    price: 225,
    location: "Austin, TX",
  },
  {
    id: "5",
    name: "SEO Optimization Session",
    duration: "3 hours",
    price: 320,
    location: "Seattle, WA",
  },
  {
    id: "6",
    name: "Marketing Strategy Session",
    duration: "8 hours",
    price: 480,
    location: "Los Angeles, CA",
  },
  {
    id: "7",
    name: "UI/UX Design Review",
    duration: "5 hours",
    price: 320,
    location: "San Francisco, CA",
  },
  {
    id: "8",
    name: "E-commerce Store Setup",
    duration: "7 hours",
    price: 320,
    location: "New York, NY",
  },
  {
    id: "9",
    name: "Product Photography",
    duration: "6 hours",
    price: 500,
    location: "Los Angeles, CA",
  },
  {
    id: "10",
    name: "Business Consultation",
    duration: "6 hours",
    price: 350,
    location: "Chicago, IL",
  },
];

export function TableDemo() {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set(["1", "4", "5", "8"]),
  );
  const [search, setSearch] = React.useState("");
  const [sortField, setSortField] = React.useState<"name" | "price" | null>(
    null,
  );
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [filterActive, setFilterActive] = React.useState(true);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(INITIAL_SERVICES.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSort = (field: "name" | "price") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredItems = React.useMemo(() => {
    let list = INITIAL_SERVICES.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
    if (sortField) {
      list = [...list].sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "string" && typeof valB === "string") {
          return sortOrder === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortOrder === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
    }
    return list;
  }, [search, sortField, sortOrder]);

  const allSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.has(item.id));
  const someSelected =
    filteredItems.some((item) => selectedIds.has(item.id)) && !allSelected;

  return (
    <div className="w-full my-6 font-sans">
      <TableFilterBar>
        <div className="flex flex-wrap items-center gap-2">
          <TableSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search services..."
          />
          {filterActive && (
            <TableFilterChip
              label="Filter"
              value="Active services"
              onRemove={() => setFilterActive(false)}
            />
          )}
          {sortField && (
            <TableFilterChip
              label="Sort"
              value={`${sortField} (${sortOrder})`}
              onRemove={() => setSortField(null)}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm">
            Create Service
          </Button>
        </div>
      </TableFilterBar>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">
              <TableCheckbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead
              isSorted={sortField === "name" ? sortOrder : null}
              onSort={() => handleSort("name")}
            >
              Service name (All)
            </TableHead>
            <TableHead>Duration</TableHead>
            <TableHead
              isSorted={sortField === "price" ? sortOrder : null}
              onSort={() => handleSort("price")}
            >
              Price
            </TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <TableRow key={item.id} selected={isSelected}>
                <TableCell className="w-12 text-center">
                  <TableCheckbox
                    checked={isSelected}
                    onCheckedChange={(checked) => toggleRow(item.id, checked)}
                    aria-label={`Select ${item.name}`}
                  />
                </TableCell>
                <TableCell className="font-semibold text-slate-900 dark:text-zinc-100">
                  {item.name}
                </TableCell>
                <TableCell>
                  <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                    {item.duration.split(" ")[0]}
                  </strong>{" "}
                  <span className="text-slate-500">hours</span>
                </TableCell>
                <TableCell className="font-semibold text-slate-900 dark:text-zinc-100">
                  ${item.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-zinc-400">
                  {item.location}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Pagination
        pageIndex={pageIndex}
        pageCount={Math.ceil(filteredItems.length / pageSize) || 1}
        totalItems={filteredItems.length}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 20]}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
