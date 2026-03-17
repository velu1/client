// src/mock/timelineData.ts
export type TimelineItemStatus =
  | "resubmitted"
  | "requestClarification"
  | "unblocked"
  | "blocked";

export type TimelineItem = {
  id: string;
  date: string;
  time: string;
  status: TimelineItemStatus;
  changesCount?: number;
  details?: {
    fields: {
      id: string;
      label: string;
      value: string;
      error?: string;
      isDocument?: boolean;
    }[];
  };
};

export const timelineData: TimelineItem[] = [
  {
    id: "1",
    date: "12 Apr 2025",
    time: "10:05 am",
    status: "resubmitted",
    changesCount: 2,
    details: {
      fields: [
        { id: "1", label: "Name", value: "John Doe" },
        { id: "2", label: "Email", value: "john.doe@example.com" },
      ],
    },
  },
  {
    id: "2",
    date: "12 Apr 2025",
    time: "10:05 am",
    status: "requestClarification",
    changesCount: 6,
    details: {
      fields: [
        { id: "1", label: "Name", value: "John Doe" },
        { id: "2", label: "Email", value: "john.doe@example.com" },
      ],
    },
  },
  {
    id: "3",
    date: "12 Apr 2025",
    time: "10:05 am",
    status: "requestClarification",
    changesCount: 6,
    details: {
      fields: [
        {
          id: "aadhar",
          label: "Aadhar card",
          value: "Jane Cooper- Aadhar",
          error: "Please upload a clear photo of the aadhaar card",
          isDocument: true,
        },
        {
          id: "pan",
          label: "Pan card",
          value: "Jane Cooper- Pan",
          error: "Please upload a clear photo of the aadhaar card",
          isDocument: true,
        },
        {
          id: "pinCode",
          label: "Pincode",
          value: "576928",
          error: "Please enter proper pinCode",
        },
      ],
    },
  },
  {
    id: "4",
    date: "12 Apr 2025",
    time: "10:05 am",
    status: "resubmitted",
    changesCount: 2,
  },
  {
    id: "5",
    date: "12 Apr 2025",
    time: "10:05 am",
    status: "requestClarification",
    changesCount: 6,
  },
  {
    id: "6",
    date: "12 Apr 2025",
    time: "10:05 am",
    status: "requestClarification",
    changesCount: 6,
  },
  {
    id: "7",
    date: "12 Apr 2025",
    time: "10:05 am",
    status: "unblocked",
  },
  {
    id: "8",
    date: "12 Apr 2025",
    time: "10:05 am",
    status: "blocked",
  },
  {
    id: "9",
    date: "12 Apr 2025",
    time: "10:05 am",
    status: "requestClarification",
    changesCount: 6,
  },
];
