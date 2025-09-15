import React, { useState, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  useProjectFinancialReports,
  ProjectFinancialReport,
} from "@/hooks/useFinancials";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { ArrowUpDown, Download, FolderOpen, ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { StatCard } from "@/components/StatCard";

const Reports: React.FC = () => {
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
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter((report) => {
      const matchesFilterText = report.project_name.toLowerCase().includes(filterText.toLowerCase());

      const reportDate = new Date(report.created_at);
      const matchesDateRange = (!dateRange.from || reportDate >= dateRange.from) &&
                               (!dateRange.to || reportDate <= dateRange.to);

      const reportNetProfit = report.net_profit;
      const matchesAmountRange = (!amountRange.min || reportNetProfit >= parseFloat(amountRange.min)) &&
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
        if (sortConfig.key === 'created_at') {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
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

  const chartData = [
    { name: 'Total Expenses', value: totalExpenses, color: '#FF8042' },
    { name: 'Total Profits', value: totalProfits, color: '#00C49F' },
  ];

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

  const downloadPdf = () => {
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

    sortedReports.forEach((report) => {
      const reportData = [
        report.project_name,
        report.project_status,
        format(new Date(report.created_at), "PPP"),
        `$${report.expenses.toFixed(2)}`,
        `$${report.profits.toFixed(2)}`,
        `$${report.net_profit.toFixed(2)}`,
      ];
      tableRows.push(reportData);
    });

    (doc as any).autoTable({
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
        if (data.column.index === 5 && data.cell.section === 'body') { // Net Profit column
          const netProfit = parseFloat(data.cell.text[0].replace('$', ''));
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
      }
    });

    doc.save("financial_reports.pdf");
  };

  if (isLoading) return <div>Loading financial reports...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Financial Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-md border p-4">
          <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
          {totalExpenses > 0 || totalProfits > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground">No data for chart.</div>
          )}
        </div>
        <div className="grid gap-4 grid-cols-2">
          <StatCard
            title="Total Projects"
            value={filteredReports.length}
            icon={FolderOpen}
            className="animate-fade-in"
          />
          <StatCard
            title="Total Expenses"
            value={`$${totalExpenses.toFixed(2)}`}
            icon={ArrowDownCircle}
            variant="in-work"
            className="animate-fade-in"
          />
          <StatCard
            title="Total Profits"
            value={`$${totalProfits.toFixed(2)}`}
            icon={ArrowUpCircle}
            variant="done"
            className="animate-fade-in"
          />
          <StatCard
            title="Net Profit"
            value={`$${(totalProfits - totalExpenses).toFixed(2)}`}
            icon={Scale}
            variant={(totalProfits - totalExpenses) > 0 ? "done" : "pending"}
            className="animate-fade-in"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Filter by project name..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="max-w-full"
          />
          <div className="flex gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-[240px] justify-start text-left font-normal ${
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
              onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Max Amount (Net Profit)"
              value={amountRange.max}
              onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button onClick={downloadPdf} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
                  <TableCell className="font-medium">
                    {report.project_name}
                  </TableCell>
                  <TableCell>{report.project_status}</TableCell>
                  <TableCell>{format(new Date(report.created_at), "PPP")}</TableCell>
                  <TableCell>${report.expenses.toFixed(2)}</TableCell>
                  <TableCell>${report.profits.toFixed(2)}</TableCell>
                  <TableCell className={report.net_profit > 0 ? "text-green-600" : "text-red-600"}>
                    ${report.net_profit.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No financial reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Reports;
