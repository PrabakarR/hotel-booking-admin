"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CustomerForm } from "@/components/forms/CustomerForm";
import { DataTable } from "@/components/shared/DataTable";
import { Modal } from "@/components/shared/Modal";
import { Pagination } from "@/components/shared/Pagination";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { useCustomerMutations, useCustomers } from "@/hooks/use-customers";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { CustomerWithStats } from "@/types";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerWithStats | null>(null);

  const { data, isLoading } = useCustomers({
    search,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const { create, update } = useCustomerMutations();

  const columns = useMemo<ColumnDef<CustomerWithStats>[]>(
    () => [
      { accessorKey: "name", header: "Customer Name" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "idProof", header: "ID Proof" },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
          <span className="block max-w-[220px] truncate">{row.original.address}</span>
        ),
      },
      {
        accessorKey: "previousBookings",
        header: "Previous Bookings",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              nativeButton={false}
              render={<Link href={`/customers/${row.original.id}`} />}
            >
              <Eye />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setEditing(row.original);
                setModalOpen(true);
              }}
            >
              <Pencil />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Guest profiles and booking history.
          </p>
        </div>
        <Button
          className="rounded-2xl"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add Customer
        </Button>
      </div>

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search customers..."
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyTitle="No customers found"
      />

      {data ? (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          pageSize={data.pageSize}
          onPageChange={setPage}
        />
      ) : null}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Customer" : "Add Customer"}
      >
        <CustomerForm
          key={editing?.id ?? "new-customer"}
          initialData={editing}
          loading={create.isPending || update.isPending}
          onCancel={() => setModalOpen(false)}
          onSubmit={async (values) => {
            try {
              if (editing) {
                await update.mutateAsync({ id: editing.id, input: values });
                toast.success("Customer updated");
              } else {
                await create.mutateAsync(values);
                toast.success("Customer added");
              }
              setModalOpen(false);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to save customer");
            }
          }}
        />
      </Modal>
    </div>
  );
}
