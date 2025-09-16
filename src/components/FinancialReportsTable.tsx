import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useProjectFinancialReports,
  ProjectFinancialReport,
} from "@/hooks/useFinancials";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  Download,
  FolderOpen,
  ArrowDownCircle,
  ArrowUpCircle,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { StatCard } from "@/components/StatCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

export const FinancialReportsTable: React.FC = () => {
  const {
    data: reports,
    isLoading,
    isError,
    error,
  } = useProjectFinancialReports();
  const [filterText, setFilterText] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProjectFinancialReport | null;
    direction: "ascending" | "descending";
  }>({ key: null, direction: "ascending" });
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [selectedReports, setSelectedReports] = useState<Set<number>>(
    new Set()
  );
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter((report) => {
      const matchesFilterText = report.project_name
        .toLowerCase()
        .includes(filterText.toLowerCase());

      const reportDate = new Date(report.created_at);
      const matchesDateRange =
        (!dateRange.from || reportDate >= dateRange.from) &&
        (!dateRange.to || reportDate <= dateRange.to);

      const reportNetProfit = report.net_profit;
      const matchesAmountRange =
        (!amountRange.min || reportNetProfit >= parseFloat(amountRange.min)) &&
        (!amountRange.max || reportNetProfit <= parseFloat(amountRange.max));

      return matchesFilterText && matchesDateRange && matchesAmountRange;
    });
  }, [reports, filterText, dateRange, amountRange]);

  const sortedReports = useMemo(() => {
    let sortableReports = [...filteredReports];
    if (sortConfig.key) {
      sortableReports.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Handle date sorting
        if (sortConfig.key === "created_at") {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return sortConfig.direction === "ascending"
            ? dateA - dateB
            : dateB - dateA;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }
        return 0;
      });
    }
    return sortableReports;
  }, [filteredReports, sortConfig]);

  const totalExpenses = useMemo(() => {
    return filteredReports.reduce((sum, report) => sum + report.expenses, 0);
  }, [filteredReports]);

  const totalProfits = useMemo(() => {
    return filteredReports.reduce((sum, report) => sum + report.profits, 0);
  }, [filteredReports]);

  const handleDateSelect = useCallback((range: { from?: Date; to?: Date }) => {
    setDateRange(range);
  }, []);

  const requestSort = (key: keyof ProjectFinancialReport) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const generatePdfContent = (reportsToGenerate: ProjectFinancialReport[]) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Financial Reports", 14, 22);

    const tableColumn = [
      "Project Name",
      "Status",
      "Created At",
      "Expenses",
      "Profits",
      "Net Profit",
    ];
    const tableRows: (string | number)[][] = [];

    reportsToGenerate.forEach((report) => {
      const reportData = [
        report.project_name,
        report.project_status,
        formatCurrency(report.expenses),
        formatCurrency(report.profits),
        formatCurrency(report.net_profit),
      ];
      tableRows.push(reportData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: "center",
      },
      headStyles: {
        fillColor: "#f8f8f8",
        textColor: "#000000",
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: "#f2f2f2",
      },
      didDrawCell: (data: any) => {
        if (data.column.index === 5 && data.cell.section === "body") {
          // Net Profit column
          const netProfit = parseFloat(data.cell.text[0].replace("₹", ""));
          if (netProfit > 0) {
            doc.setTextColor(34, 139, 34); // Green
          } else if (netProfit < 0) {
            doc.setTextColor(255, 0, 0); // Red
          } else {
            doc.setTextColor(0, 0, 0); // Black
          }
        } else {
          doc.setTextColor(0, 0, 0); // Reset to black for other cells
        }
      },
    });
    return doc;
  };

  const handlePreviewPdf = () => {
    const reportsToPrint = sortedReports.filter((report) =>
      selectedReports.has(report.project_id)
    );

    if (reportsToPrint.length === 0) {
      alert("Please select at least one report to preview.");
      return;
    }
    const doc = generatePdfContent(reportsToPrint);
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    setPdfBlobUrl(url);
    setShowPdfPreview(true);
  };

  const handleDownloadPdf = () => {
    if (pdfBlobUrl) {
      const a = document.createElement("a");
      a.href = pdfBlobUrl;
      a.download = "financial_reports.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    if (!showPdfPreview && pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
  }, [showPdfPreview, pdfBlobUrl]);

  if (isLoading) return <div>Loading financial reports...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight mb-6">
        Financial Reports
      </h2>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Reports"
          value={filteredReports.length}
          icon={FolderOpen}
          className="animate-fade-in"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={ArrowDownCircle}
          variant="in-work"
          className="animate-fade-in"
        />
        <StatCard
          title="Total Profits"
          value={formatCurrency(totalProfits)}
          icon={ArrowUpCircle}
          variant="done"
          className="animate-fade-in"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(totalProfits - totalExpenses)}
          icon={Scale}
          variant={totalProfits - totalExpenses > 0 ? "done" : "pending"}
          className="animate-fade-in"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Filter by project name..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="flex-1"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-full md:w-[240px] justify-start text-left font-normal ${
                !dateRange.from ? "text-muted-foreground" : ""
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange as any}
              onSelect={handleDateSelect as any}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Input
          type="number"
          placeholder="Min Amount (Net Profit)"
          value={amountRange.min}
          onChange={(e) =>
            setAmountRange({ ...amountRange, min: e.target.value })
          }
          className="w-full md:w-[180px]"
        />
        <Input
          type="number"
          placeholder="Max Amount (Net Profit)"
          value={amountRange.max}
          onChange={(e) =>
            setAmountRange({ ...amountRange, max: e.target.value })
          }
          className="w-full md:w-[180px]"
        />
        <Button
          onClick={handlePreviewPdf}
          className="flex items-center gap-2 w-full md:w-auto"
          disabled={selectedReports.size === 0}
        >
          <Download className="h-4 w-4" />
          Preview PDF
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  checked={
                    sortedReports.length > 0 &&
                    selectedReports.size === sortedReports.length
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const allProjectIds = new Set(
                        sortedReports.map((report) => report.project_id)
                      );
                      setSelectedReports(allProjectIds);
                    } else {
                      setSelectedReports(new Set());
                    }
                  }}
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("project_name")}
                >
                  Project Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("project_status")}
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("created_at")}
                >
                  Created At
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("expenses")}>
                  Expenses
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("profits")}>
                  Profits
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort("net_profit")}
                >
                  Net Profit
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReports.length > 0 ? (
              sortedReports.map((report) => (
                <TableRow key={report.project_id}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedReports.has(report.project_id)}
                      onCheckedChange={(checked) => {
                        setSelectedReports((prevSelected) => {
                          const newSelected = new Set(prevSelected);
                          if (checked) {
                            newSelected.add(report.project_id);
                          } else {
                            newSelected.delete(report.project_id);
                          }
                          return newSelected;
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {report.project_name}
                  </TableCell>
                  <TableCell>{report.project_status}</TableCell>
                  <TableCell>
                    {format(new Date(report.created_at), "PPP")}
                  </TableCell>
                  <TableCell>{formatCurrency(report.expenses)}</TableCell>
                  <TableCell>{formatCurrency(report.profits)}</TableCell>
                  <TableCell
                    className={
                      report.net_profit > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {formatCurrency(report.net_profit)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No financial reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>PDF Preview</DialogTitle>
            <DialogDescription>
              Preview of your selected financial reports.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow">
            {pdfBlobUrl && (
              <iframe
                src={pdfBlobUrl}
                width="100%"
                height="100%"
                title="PDF Preview"
              ></iframe>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleDownloadPdf}>Download PDF</Button>
            <Button variant="outline" onClick={() => setShowPdfPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
