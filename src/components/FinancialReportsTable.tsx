import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import { CalendarIcon, Download, FolderOpen, ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { ReusableTable } from "@/components/ui/ReusableTable";
import { Project, ProjectStatus } from "@/types/project";

export const FinancialReportsTable: React.FC = () => {
  const {
    data: reports,
    isLoading,
    isError,
    error,
  } = useProjectFinancialReports();
  const [filterText, setFilterText] = useState("");
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

  const mappedReports: Project[] = useMemo(() => {
    if (!reports) return [];
    return reports.map((report) => ({
      id: report.project_id,
      user_id: "dummy_user_id", // Add dummy user_id to satisfy Project type
      name: report.project_name,
      description: `Expenses: ${formatCurrency(report.expenses)}, Profits: ${formatCurrency(report.profits)}`,
      status: report.project_status as ProjectStatus,
      contact: { name: "", email: "", phone: "", address: "" }, // Dummy contact data
      financials: { expenses: report.expenses, profits: report.profits },
      images: [],
      createdAt: new Date(report.created_at),
      updatedAt: new Date(report.created_at),
    }));
  }, [reports]);

  const searchFinancialReports = useCallback((term: string) => {
    if (!term.trim()) {
      return mappedReports;
    }
    return mappedReports.filter(
      (report) =>
        report.name.toLowerCase().includes(term.toLowerCase()) ||
        report.id.toString().includes(term)
    );
  }, [mappedReports]);


  const filteredReports = useMemo(() => {
    let currentReports = searchFinancialReports(filterText);

    const reportNetProfit = (report: Project) => report.financials.profits - report.financials.expenses;

    // Date range filter
    currentReports = currentReports.filter((report) => {
      const reportDate = report.createdAt;
      return (
        (!dateRange.from || reportDate >= dateRange.from) &&
        (!dateRange.to || reportDate <= dateRange.to)
      );
    });

    // Amount range filter (net profit)
    currentReports = currentReports.filter((report) => {
      const netProfit = reportNetProfit(report);
      return (
        (!amountRange.min || netProfit >= parseFloat(amountRange.min)) &&
        (!amountRange.max || netProfit <= parseFloat(amountRange.max))
      );
    });

    return currentReports;
  }, [mappedReports, filterText, dateRange, amountRange, searchFinancialReports]);


  const totalExpenses = useMemo(() => {
    return filteredReports.reduce((sum, report) => sum + report.financials.expenses, 0);
  }, [filteredReports]);

  const totalProfits = useMemo(() => {
    return filteredReports.reduce((sum, report) => sum + report.financials.profits, 0);
  }, [filteredReports]);

  const handleDateSelect = useCallback((range: { from?: Date; to?: Date }) => {
    setDateRange(range);
  }, []);

  const generatePdfContent = (reportsToGenerate: Project[]) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Financial Reports", 14, 22);

    const tableColumn = [
      "Project ID",
      "Project Name",
      "Status",
      "Created At",
      "Expenses",
      "Profits",
      "Net Profit",
    ];
    const tableRows: (string | number)[][] = [];

    reportsToGenerate.forEach((report) => {
      const netProfit = report.financials.profits - report.financials.expenses;
      const reportData = [
        report.id,
        report.name,
        report.status,
        format(report.createdAt, "PPP"),
        formatCurrency(report.financials.expenses),
        formatCurrency(report.financials.profits),
        formatCurrency(netProfit),
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
        if (data.column.index === 6 && data.cell.section === "body") {
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
    const reportsToPrint = filteredReports.filter((report) =>
      selectedReports.has(report.id)
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
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Button
          onClick={handlePreviewPdf}
          className="flex items-center gap-2 w-full md:w-auto"
          disabled={selectedReports.size === 0}
        >
          <Download className="h-4 w-4" />
          Preview PDF
        </Button>
      </div>

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
          placeholder="Filter by project name or ID..."
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
      </div>

      <ReusableTable
        data={filteredReports}
        showActions={false}
        searchProjects={searchFinancialReports}
      />

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
