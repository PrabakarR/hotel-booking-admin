export const queryKeys = {
  rooms: {
    all: ["rooms"] as const,
    list: (params: unknown) => ["rooms", "list", params] as const,
    detail: (id: string) => ["rooms", "detail", id] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (params: unknown) => ["customers", "list", params] as const,
    detail: (id: string) => ["customers", "detail", id] as const,
    bookings: (id: string) => ["customers", "bookings", id] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    list: (params: unknown) => ["bookings", "list", params] as const,
    detail: (id: string) => ["bookings", "detail", id] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
    recent: ["dashboard", "recent"] as const,
    checkouts: ["dashboard", "checkouts"] as const,
    occupancy: ["dashboard", "occupancy"] as const,
    revenue: ["dashboard", "revenue"] as const,
  },
  reports: ["reports"] as const,
  settings: ["settings"] as const,
};
