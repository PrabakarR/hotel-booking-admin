import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatCurrency } from "@/lib/format";
import type { ReportsData } from "@/types";

export function exportReportsToExcel(data: ReportsData) {
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      data.dailyRevenue.map((row) => ({
        Date: row.date,
        Bookings: row.bookings,
        Revenue: row.revenue,
      }))
    ),
    "Daily Revenue"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      data.monthlyRevenue.map((row) => ({
        Month: row.month,
        Bookings: row.bookings,
        Revenue: row.revenue,
      }))
    ),
    "Monthly Revenue"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      data.roomOccupancy.map((row) => ({
        Room: row.roomNumber,
        Type: row.roomType,
        "Occupied Nights": row.occupiedNights,
        "Occupancy %": row.occupancyRate,
        Revenue: row.revenue,
      }))
    ),
    "Room Occupancy"
  );

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(
      data.topCustomers.map((row) => ({
        Customer: row.name,
        Phone: row.phone,
        Bookings: row.bookings,
        "Total Spent": row.totalSpent,
      }))
    ),
    "Top Customers"
  );

  XLSX.writeFile(workbook, "hotel-reports.xlsx");
}

export function exportReportsToPdf(data: ReportsData) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Hotel Reports", 14, 18);
  doc.setFontSize(10);
  doc.text(
    `Total bookings: ${data.bookingStatistics.total} · Avg value: ${formatCurrency(
      data.bookingStatistics.averageBookingValue
    )}`,
    14,
    26
  );

  autoTable(doc, {
    startY: 32,
    head: [["Date", "Bookings", "Revenue"]],
    body: data.dailyRevenue.map((row) => [
      row.date,
      String(row.bookings),
      formatCurrency(row.revenue),
    ]),
  });

  const afterDaily = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY;

  autoTable(doc, {
    startY: afterDaily + 10,
    head: [["Customer", "Bookings", "Total Spent"]],
    body: data.topCustomers.map((row) => [
      row.name,
      String(row.bookings),
      formatCurrency(row.totalSpent),
    ]),
  });

  doc.save("hotel-reports.pdf");
}
