/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";

export interface Table {
  id: string;
  number: number;
  companies: string[]; // IDs de empresas (máximo 2)
  status: "available" | "partial" | "full";
}

export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalTables: number;
  availableTables: number;
  status: "available" | "full" | "finished";
  tables: Table[];
  eventName?: string;
}

export interface Booking {
  id: string;
  companyId: string;
  shiftId: string;
  tableId: string;
  representativeId: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  companyId: string;
  partnerCompanyId: string;
  shiftId: string;
  tableId: string;
  representativeId: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "completed" | "cancelled";
}

interface BookingContextType {
  shifts: Shift[];
  bookings: Booking[];
  meetings: Meeting[];
  getShift: (id: string) => Shift | undefined;
  bookTable: (
    shiftId: string,
    tableId: string,
    companyId: string,
    representativeId: string
  ) => boolean;
  getCompanyBookings: (companyId: string) => Booking[];
  getCompanyMeetings: (companyId: string) => Meeting[];
  cancelBooking: (bookingId: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [meetings] = useState<Meeting[]>([
    {
      id: "m1",
      companyId: "1",
      partnerCompanyId: "2",
      shiftId: "past-1",
      tableId: "past-1-1",
      representativeId: "rep1",
      eventName: "Ronda de Negocios 2024 - Primavera",
      date: "2024-09-15",
      startTime: "10:00",
      endTime: "11:30",
      status: "completed",
    },
    {
      id: "m2",
      companyId: "1",
      partnerCompanyId: "3",
      shiftId: "past-1",
      tableId: "past-1-5",
      representativeId: "rep1",
      eventName: "Ronda de Negocios 2024 - Primavera",
      date: "2024-09-15",
      startTime: "14:00",
      endTime: "15:30",
      status: "completed",
    },
    {
      id: "m3",
      companyId: "1",
      partnerCompanyId: "4",
      shiftId: "past-2",
      tableId: "past-2-3",
      representativeId: "rep2",
      eventName: "Ronda de Negocios 2024 - Verano",
      date: "2024-11-20",
      startTime: "09:00",
      endTime: "10:30",
      status: "completed",
    },
    {
      id: "m4",
      companyId: "1",
      partnerCompanyId: "5",
      shiftId: "past-2",
      tableId: "past-2-7",
      representativeId: "rep2",
      eventName: "Ronda de Negocios 2024 - Verano",
      date: "2024-11-20",
      startTime: "11:00",
      endTime: "12:30",
      status: "completed",
    },
    {
      id: "m5",
      companyId: "1",
      partnerCompanyId: "2",
      shiftId: "past-3",
      tableId: "past-3-2",
      representativeId: "rep1",
      eventName: "Encuentro Empresarial 2025 - Invierno",
      date: "2025-03-10",
      startTime: "10:00",
      endTime: "11:30",
      status: "completed",
    },
  ]);

  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: "1",
      date: "2025-10-21",
      startTime: "09:00",
      endTime: "10:30",
      totalTables: 12,
      availableTables: 8,
      status: "available",
      eventName: "Ronda de Negocios 2025 - Otoño",
      tables: Array.from({ length: 12 }, (_, i) => ({
        id: `1-${i + 1}`,
        number: i + 1,
        companies:
          i === 0 ? ["1"] : i === 1 ? ["2"] : i === 2 ? ["1", "3"] : [],
        status: i === 2 ? "full" : i === 0 || i === 1 ? "partial" : "available",
      })),
    },
    {
      id: "2",
      date: "2025-10-21",
      startTime: "11:00",
      endTime: "12:30",
      totalTables: 12,
      availableTables: 12,
      status: "available",
      eventName: "Ronda de Negocios 2025 - Otoño",
      tables: Array.from({ length: 12 }, (_, i) => ({
        id: `2-${i + 1}`,
        number: i + 1,
        companies: [],
        status: "available",
      })),
    },
    {
      id: "3",
      date: "2025-10-21",
      startTime: "14:00",
      endTime: "15:30",
      totalTables: 12,
      availableTables: 3,
      status: "available",
      eventName: "Ronda de Negocios 2025 - Otoño",
      tables: Array.from({ length: 12 }, (_, i) => ({
        id: `3-${i + 1}`,
        number: i + 1,
        companies: i < 9 ? (i % 2 === 0 ? ["1", "2"] : ["3", "4"]) : [],
        status: i < 9 ? "full" : "available",
      })),
    },
    {
      id: "4",
      date: "2025-10-21",
      startTime: "16:00",
      endTime: "17:30",
      totalTables: 12,
      availableTables: 0,
      status: "full",
      eventName: "Ronda de Negocios 2025 - Otoño",
      tables: Array.from({ length: 12 }, (_, i) => ({
        id: `4-${i + 1}`,
        number: i + 1,
        companies: ["1", "2"],
        status: "full",
      })),
    },
  ]);

  const getShift = (id: string) => {
    return shifts.find((s) => s.id === id);
  };

  const bookTable = (
    shiftId: string,
    tableId: string,
    companyId: string,
    representativeId: string
  ): boolean => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return false;

    const table = shift.tables.find((t) => t.id === tableId);
    if (
      !table ||
      table.status === "full" ||
      table.companies.includes(companyId)
    )
      return false;

    const updatedShifts = shifts.map((s) => {
      if (s.id === shiftId) {
        const updatedTables = s.tables.map((t) => {
          if (t.id === tableId) {
            const newCompanies = [...t.companies, companyId];
            return {
              ...t,
              companies: newCompanies,
              status: newCompanies.length === 2 ? "full" : "partial",
            } as Table;
          }
          return t;
        });

        const availableCount = updatedTables.filter(
          (t) => t.status !== "full"
        ).length;

        return {
          ...s,
          tables: updatedTables,
          availableTables: availableCount,
          status: availableCount === 0 ? "full" : "available",
        } as Shift;
      }
      return s;
    });

    setShifts(updatedShifts);

    const newBooking: Booking = {
      id: Date.now().toString(),
      companyId,
      shiftId,
      tableId,
      representativeId,
      createdAt: new Date().toISOString(),
    };
    setBookings([...bookings, newBooking]);

    return true;
  };

  const getCompanyBookings = (companyId: string) => {
    return bookings.filter((b) => b.companyId === companyId);
  };

  const getCompanyMeetings = (companyId: string) => {
    return meetings.filter(
      (m) => m.companyId === companyId || m.partnerCompanyId === companyId
    );
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updatedShifts = shifts.map((s) => {
      if (s.id === booking.shiftId) {
        const updatedTables = s.tables.map((t) => {
          if (t.id === booking.tableId) {
            const newCompanies = t.companies.filter(
              (c) => c !== booking.companyId
            );
            return {
              ...t,
              companies: newCompanies,
              status: newCompanies.length === 0 ? "available" : "partial",
            } as Table;
          }
          return t;
        });

        const availableCount = updatedTables.filter(
          (t) => t.status !== "full"
        ).length;

        return {
          ...s,
          tables: updatedTables,
          availableTables: availableCount,
          status: "available",
        } as Shift;
      }
      return s;
    });

    setShifts(updatedShifts);
    setBookings(bookings.filter((b) => b.id !== bookingId));
  };

  return (
    <BookingContext.Provider
      value={{
        shifts,
        bookings,
        meetings,
        getShift,
        bookTable,
        getCompanyBookings,
        getCompanyMeetings,
        cancelBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
}
