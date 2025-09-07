import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@prisma/client";

const statusMap: Record<BookingStatus, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-400 text-yellow-900" },
  CONFIRMED: { label: "Confirmed", color: "bg-green-500 text-white" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500 text-white" },
  COMPLETED: { label: "Completed", color: "bg-blue-500 text-white" },
  IN_PROGRESS: { label: "In Progress", color: "bg-indigo-500 text-white" },
  NO_SHOW: { label: "No Show", color: "bg-gray-400 text-white" },
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { label, color } = statusMap[status] || statusMap.PENDING;
  return (
    <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`} aria-label={label}>
      {label}
    </Badge>
  );
}
