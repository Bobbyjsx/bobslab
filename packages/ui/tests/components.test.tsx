// @vitest-environment jsdom
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

afterEach(async () => {
  cleanup();
  await new Promise((resolve) => setTimeout(resolve, 20));
});
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  OtpInput,
  Pagination,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "../src/index";

describe("@bobslab/ui components", () => {
  describe("Button", () => {
    it("renders with variant classes and handles click", () => {
      const handleClick = vi.fn();
      render(
        <Button variant="outline" onClick={handleClick}>
          Click Me
        </Button>,
      );

      const btn = screen.getByRole("button", { name: "Click Me" });
      expect(btn).toBeDefined();
      expect(btn.className).toContain("border-border");

      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("renders disabled state when disabled", () => {
      render(<Button disabled>Disabled Button</Button>);
      const btn = screen.getByRole("button", { name: "Disabled Button" });
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe("Dialog (Dual-Layer API)", () => {
    it("supports high-level single entry component with trigger, title, and footer", () => {
      render(
        <Dialog
          defaultOpen
          trigger={<Button>Open Modal</Button>}
          title="Account Details"
          description="Update your profile here."
          footer={<Button>Save Changes</Button>}
        >
          <div data-testid="modal-body">Modal body text</div>
        </Dialog>,
      );

      expect(screen.getByText("Account Details")).toBeDefined();
      expect(screen.getByText("Update your profile here.")).toBeDefined();
      expect(screen.getByTestId("modal-body")).toBeDefined();
      expect(screen.getByText("Save Changes")).toBeDefined();
    });

    it("supports primitive headless composition", () => {
      render(
        <DialogRoot defaultOpen>
          <DialogTrigger render={<Button>Trigger</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Primitive Title</DialogTitle>
            </DialogHeader>
            <div>Primitive Body</div>
          </DialogContent>
        </DialogRoot>,
      );

      expect(screen.getByText("Primitive Title")).toBeDefined();
      expect(screen.getByText("Primitive Body")).toBeDefined();
    });
  });

  describe("Tabs (Dual-Layer API)", () => {
    it("supports zero-boilerplate items prop", () => {
      render(
        <Tabs
          items={[
            {
              value: "tab1",
              label: "Profile",
              content: <div data-testid="p1">Profile Panel</div>,
            },
            {
              value: "tab2",
              label: "Billing",
              content: <div data-testid="p2">Billing Panel</div>,
            },
          ]}
        />,
      );

      expect(screen.getByText("Profile")).toBeDefined();
      expect(screen.getByText("Billing")).toBeDefined();
      expect(screen.getByTestId("p1")).toBeDefined();
    });

    it("supports fine-grained primitive composition", () => {
      render(
        <TabsRoot defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview Body</TabsContent>
        </TabsRoot>,
      );

      expect(screen.getByText("Overview")).toBeDefined();
      expect(screen.getByText("Overview Body")).toBeDefined();
    });
  });

  describe("Skeleton (Canonical)", () => {
    it("renders with canonical skeleton-shimmer class and data-slot", () => {
      const { container } = render(<Skeleton className="h-6 w-32" />);
      const skeleton = container.querySelector("[data-slot='skeleton']");
      expect(skeleton).not.toBeNull();
      expect(skeleton?.getAttribute("aria-hidden")).toBe("true");
      expect(skeleton?.className).toContain("skeleton-shimmer");
    });
  });

  describe("Badge", () => {
    it("resolves status variants correctly", () => {
      const { container, rerender } = render(
        <Badge status="completed">Done</Badge>,
      );
      expect(container.firstChild).toBeDefined();
      expect((container.firstChild as HTMLElement).className).toContain(
        "bg-emerald-50",
      );

      rerender(<Badge status="processing">In Progress</Badge>);
      expect((container.firstChild as HTMLElement).className).toContain(
        "bg-amber-50",
      );

      rerender(<Badge status="failed">Failed</Badge>);
      expect((container.firstChild as HTMLElement).className).toContain(
        "bg-rose-50",
      );
    });
  });

  describe("Card", () => {
    it("renders card with header and content", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card Content Body</CardContent>
        </Card>,
      );

      expect(screen.getByText("Card Title")).toBeDefined();
      expect(screen.getByText("Card Content Body")).toBeDefined();
    });
  });

  describe("Composable Table", () => {
    it("renders table with headers and rows with selected state", () => {
      const handleSort = vi.fn();
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead isSorted="asc" onSort={handleSort}>
                Service Name
              </TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow selected>
              <TableCell>Website Setup</TableCell>
              <TableCell>$200.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>SEO Optimization</TableCell>
              <TableCell>$320.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );

      expect(screen.getByText("Website Setup")).toBeDefined();
      expect(screen.getByText("$200.00")).toBeDefined();

      const selectedRow = container.querySelector("[data-state='selected']");
      expect(selectedRow).not.toBeNull();
      expect(selectedRow?.className).toContain("bg-blue-50/70");

      const sortHeader = screen.getByText("Service Name");
      fireEvent.click(sortHeader);
      expect(handleSort).toHaveBeenCalledTimes(1);
    });
  });

  describe("Pagination", () => {
    it("renders page buttons and fires onPageChange", () => {
      const handlePageChange = vi.fn();
      render(
        <Pagination
          pageIndex={0}
          pageCount={3}
          totalItems={10}
          onPageChange={handlePageChange}
        />,
      );

      expect(screen.getByText("Total record:")).toBeDefined();
      expect(screen.getByText("10")).toBeDefined();

      const page2Btn = screen.getByRole("button", { name: "2" });
      fireEvent.click(page2Btn);
      expect(handlePageChange).toHaveBeenCalledWith(1);
    });
  });

  describe("OtpInput", () => {
    it("renders inputs and handles changes", () => {
      const handleChange = vi.fn();
      render(<OtpInput value="12" length={6} onChange={handleChange} />);

      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBe(6);
      expect((inputs[0] as HTMLInputElement).value).toBe("1");
      expect((inputs[1] as HTMLInputElement).value).toBe("2");
      expect((inputs[2] as HTMLInputElement).value).toBe("");

      fireEvent.change(inputs[2]!, { target: { value: "3" } });
      expect(handleChange).toHaveBeenCalledWith("123");
    });
  });
});
