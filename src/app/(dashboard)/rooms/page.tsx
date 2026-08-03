"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RoomForm } from "@/components/forms/RoomForm";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { DataTable } from "@/components/shared/DataTable";
import { Modal } from "@/components/shared/Modal";
import { Pagination } from "@/components/shared/Pagination";
import { SearchBar } from "@/components/shared/SearchBar";
import { RoomStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { useRoomMutations, useRooms } from "@/hooks/use-rooms";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Room } from "@/types";

export default function RoomsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState<Room | null>(null);

  const { data, isLoading } = useRooms({ search, page, pageSize: DEFAULT_PAGE_SIZE });
  const { create, update, remove } = useRoomMutations();

  const columns = useMemo<ColumnDef<Room>[]>(
    () => [
      { accessorKey: "roomNumber", header: "Room Number" },
      { accessorKey: "floor", header: "Floor" },
      { accessorKey: "roomType", header: "Room Type" },
      { accessorKey: "capacity", header: "Capacity" },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => formatCurrency(row.original.price),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <RoomStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
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
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleting(row.original)}
            >
              <Trash2 />
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
          <h1 className="text-2xl font-semibold tracking-tight">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            Manage inventory, pricing, and room status.
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
          Add Room
        </Button>
      </div>

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search rooms..."
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyTitle="No rooms found"
        emptyDescription="Add your first room to start taking bookings."
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
        title={editing ? "Edit Room" : "Add Room"}
        description="Room details sync with booking availability."
      >
        <RoomForm
          key={editing?.id ?? "new-room"}
          initialData={editing}
          loading={create.isPending || update.isPending}
          onCancel={() => setModalOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await update.mutateAsync({ id: editing.id, input: values });
              toast.success("Room updated");
            } else {
              await create.mutateAsync(values);
              toast.success("Room added");
            }
            setModalOpen(false);
          }}
        />
      </Modal>

      <ConfirmationDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete room?"
        description={`Room ${deleting?.roomNumber} will be removed from inventory.`}
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={async () => {
          if (!deleting) return;
          await remove.mutateAsync(deleting.id);
          toast.success("Room deleted");
          setDeleting(null);
        }}
      />
    </div>
  );
}
