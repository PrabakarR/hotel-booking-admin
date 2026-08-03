import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { createId, delay, mockStore } from "@/mock/store";
import type {
  CreateCustomerInput,
  Customer,
  ListQuery,
  PaginatedResult,
  UpdateCustomerInput,
} from "@/types";
import type { ICustomerRepository } from "@/repositories/interfaces";

function paginate<T>(items: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export class MockCustomerRepository implements ICustomerRepository {
  async findAll(query: ListQuery = {}): Promise<PaginatedResult<Customer>> {
    await delay();
    const search = query.search?.toLowerCase().trim() ?? "";
    let items = [...mockStore.customers].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    if (search) {
      items = items.filter(
        (customer) =>
          customer.name.toLowerCase().includes(search) ||
          customer.phone.toLowerCase().includes(search) ||
          customer.idProof.toLowerCase().includes(search) ||
          customer.address.toLowerCase().includes(search)
      );
    }
    return paginate(items, query.page, query.pageSize);
  }

  async findById(id: string): Promise<Customer | null> {
    await delay(200);
    return mockStore.customers.find((customer) => customer.id === id) ?? null;
  }

  async getAll(): Promise<Customer[]> {
    await delay(200);
    return [...mockStore.customers];
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    await delay();
    const now = new Date().toISOString();
    const customer: Customer = {
      ...input,
      id: createId("cust"),
      createdAt: now,
      updatedAt: now,
    };
    mockStore.customers.unshift(customer);
    return customer;
  }

  async update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    await delay();
    const index = mockStore.customers.findIndex((customer) => customer.id === id);
    if (index === -1) throw new Error("Customer not found");
    const updated: Customer = {
      ...mockStore.customers[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    mockStore.customers[index] = updated;
    return updated;
  }
}

export const customerRepository = new MockCustomerRepository();
