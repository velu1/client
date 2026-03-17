import ExcelJS from "exceljs";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import React from "react";

interface Column {
  header: string;
  accessorKey: string;
  width?: number; // Optional: custom width in pixels
  maxTextLength?: number; // Optional: custom text truncation limit
}

interface ReportOptions {
  data: any[];
  columns: Column[];
  reportName: string;
  primaryColor?: string;
  secondaryColor?: string;
}

// For server-side paginated data
interface FetchAllDataFn {
  (options: {
    pageSize: number;
    page: number;
    sortColumn?: string;
    sortOrder?: string | "asc" | "desc";
    searchQuery?: string;
    startDate?: string;
    endDate?: string;
    [key: string]: any; // Allow additional parameters
  }): Promise<{
    tableData: any[];
    totalCount: number;
    [key: string]: any; // Allow additional return values
  }>;
}

interface ServerSideReportOptions {
  fetchDataFn: FetchAllDataFn;
  columns: Column[];
  reportName: string;
  primaryColor?: string;
  secondaryColor?: string;
  initialParams: {
    sortColumn?: string;
    sortOrder?: string;
    searchQuery?: string;
    startDate?: string;
    endDate?: string;
  };
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  date: {
    fontSize: 10,
    marginBottom: 15,
    textAlign: "center",
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    fontSize: 10,
  },
  tableCell: {
    padding: 4,
    fontSize: 9,
    textAlign: "left",
    minHeight: 20,
    flexWrap: "wrap",
    maxWidth: "100%",
    overflow: "hidden",
  },
  tableHeaderCell: {
    padding: 4,
    fontSize: 9,
    textAlign: "left",
    fontWeight: "bold",
    minHeight: 20,
    flexWrap: "wrap",
    maxWidth: "100%",
    overflow: "hidden",
  },
});

// Helper function to calculate column widths based on content
const calculateColumnWidths = (data: any[], columns: Column[]) => {
  const pageWidth = 555; // A4 page width minus padding (595 - 40)
  const minWidth = 50;
  const maxWidth = 150;

  const columnWidths = columns.map((col, index) => {
    console.log(index, "iss");
    // Calculate content length for this column
    const headerLength = col.header.length;

    // Sample first 10 rows to estimate content width
    const sampleRows = data.slice(0, 10);
    const maxContentLength = Math.max(
      headerLength,
      ...sampleRows.map((row) => {
        const value = row[col.accessorKey];
        if (value === null || value === undefined) return 3; // "N/A"
        if (Array.isArray(value)) return value.join(", ").length;
        return String(value).length;
      })
    );

    // Calculate width based on content (rough estimation: 6px per character)
    const estimatedWidth = Math.max(
      minWidth,
      Math.min(maxWidth, maxContentLength * 6)
    );
    return estimatedWidth;
  });

  // Normalize widths to fit page width
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const scaleFactor = pageWidth / totalWidth;

  return columnWidths.map((width) => width * scaleFactor);
};

// Helper function to truncate text if too long
const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

export const generateReport = async (
  options: ReportOptions,
  format: "excel" | "pdf"
) => {
  const {
    data,
    columns,
    reportName,
    primaryColor = "#000000",
    secondaryColor = "#f0f0f0",
  } = options;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${reportName}-${timestamp}`;

  if (format === "excel") {
    await generateExcelReport(
      data,
      columns,
      reportName,
      fileName,
      primaryColor,
      secondaryColor
    );
  } else {
    await generatePDFReport(data, columns, reportName, fileName);
  }
};

/**
 * Generates a report for server-side paginated data by fetching all pages
 * @param options ServerSideReportOptions with fetch function and parameters
 * @param format "excel" or "pdf"
 */
export const generateServerSideReport = async (
  options: ServerSideReportOptions,
  format: "excel" | "pdf"
) => {
  const {
    fetchDataFn,
    columns,
    reportName,
    primaryColor = "#000000",
    secondaryColor = "#f0f0f0",
    initialParams,
  } = options;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${reportName}-${timestamp}`;

  try {
    // First fetch to get total count
    const firstResult = await fetchDataFn({
      page: 1,
      pageSize: 10,
      ...initialParams,
    });

    const totalCount = firstResult.totalCount;

    // Fetch all data in one request with large page size
    const allDataResult = await fetchDataFn({
      page: 1,
      pageSize: totalCount > 0 ? totalCount : 1000,
      ...initialParams,
    });

    const allData = allDataResult.tableData;

    // Generate the appropriate report format
    if (format === "excel") {
      await generateExcelReport(
        allData,
        columns,
        reportName,
        fileName,
        primaryColor,
        secondaryColor
      );
    } else {
      await generatePDFReport(allData, columns, reportName, fileName);
    }
  } catch (error) {
    console.error(`Error generating ${format} report:`, error);
    throw new Error(`Failed to generate ${format} report`);
  }
};

const generateExcelReport = async (
  data: any[],
  columns: Column[],
  reportName: string,
  fileName: string,
  primaryColor: string,
  secondaryColor: string
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  // Add report title and date
  const lastColumn = String.fromCharCode(64 + columns.length); // Get the last column letter
  worksheet.mergeCells(`A1:${lastColumn}1`);
  const titleCell = worksheet.getCell("A1");
  titleCell.value = reportName;
  titleCell.font = {
    bold: true,
    size: 16,
    color: { argb: primaryColor.replace("#", "") },
  };
  titleCell.alignment = { horizontal: "center" };

  worksheet.mergeCells(`A2:${lastColumn}2`);
  const dateCell = worksheet.getCell("A2");
  dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
  dateCell.font = { italic: true };
  dateCell.alignment = { horizontal: "center" };

  // Add headers
  const headerRow = worksheet.addRow(columns.map((col) => col.header));
  headerRow.font = {
    bold: true,
    color: { argb: primaryColor.replace("#", "") },
  };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: secondaryColor.replace("#", "") },
  };

  // Add data
  data.forEach((item) => {
    const rowData = columns.map((col) => {
      const value = item[col.accessorKey];

      // Handle different data types properly
      if (value === null || value === undefined) {
        return "N/A";
      } else if (Array.isArray(value)) {
        return value.join(", ");
      } else if (value instanceof Date) {
        return value.toLocaleString();
      } else if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      } else if (typeof value === "number") {
        return value;
      }

      return String(value);
    });
    worksheet.addRow(rowData);
  });

  // Format cells and improve appearance
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 2) {
      // Skip header rows
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle" };

        // Apply different background to alternate rows for better readability
        if (rowNumber % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F9F9F9" },
          };
        }
      });
    }
  });

  // Auto-fit columns with proper width calculation
  worksheet.columns = columns.map((_, index) => {
    // const column = worksheet.getColumn(index + 1);
    let maxLength = 0;

    // Check header length
    const headerLength = columns[index].header.length;
    maxLength = Math.max(maxLength, headerLength);

    // Check data lengths
    data.forEach((row) => {
      const cellValue = row[columns[index].accessorKey] || "N/A";
      let cellLength = 0;

      if (Array.isArray(cellValue)) {
        cellLength = cellValue.join(", ").length;
      } else if (cellValue === null || cellValue === undefined) {
        cellLength = 3; // "N/A"
      } else {
        cellLength = String(cellValue).length;
      }

      maxLength = Math.max(maxLength, cellLength);
    });

    // Add some padding
    return {
      width: Math.min(Math.max(maxLength + 2, 10), 50), // Min width 10, max width 50
    };
  });

  // Save the file
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};

const generatePDFReport = async (
  data: any[],
  columns: Column[],
  reportName: string,
  fileName: string
) => {
  // Helper function to format cell values correctly
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "N/A";
    } else if (Array.isArray(value)) {
      return value.join(", ");
    } else if (value instanceof Date) {
      return value.toLocaleString();
    } else if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return String(value);
  };

  // Calculate dynamic column widths
  const columnWidths = calculateColumnWidths(data, columns);

  const MyDocument: React.FC = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{reportName}</Text>
          <Text style={styles.date}>
            Generated on: {new Date().toLocaleString()}
          </Text>
        </View>
        <View style={styles.table}>
          {/* Headers */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            {columns.map((col, index) => (
              <Text
                key={index}
                style={[styles.tableHeaderCell, { width: columnWidths[index] }]}
              >
                {truncateText(col.header, 20)}
              </Text>
            ))}
          </View>
          {/* Data */}
          {data.map((item, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.tableRow,
                rowIndex % 2 === 1 ? { backgroundColor: "#f9f9f9" } : {},
              ]}
            >
              {columns.map((col, colIndex) => {
                const cellValue = formatCellValue(item[col.accessorKey]);
                const maxCharsForColumn = Math.floor(
                  columnWidths[colIndex] / 6
                ); // Approximate chars per width

                return (
                  <Text
                    key={colIndex}
                    style={[
                      styles.tableCell,
                      { width: columnWidths[colIndex] },
                    ]}
                  >
                    {truncateText(cellValue, maxCharsForColumn)}
                  </Text>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );

  // Generate PDF blob
  const blob = await pdf(<MyDocument />).toBlob();
  saveAs(blob, `${fileName}.pdf`);
};
