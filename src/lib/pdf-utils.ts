import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import { Project } from "@/types/project";
import { formatCurrency } from "./utils";

applyPlugin(jsPDF); // Apply the plugin right after importing jsPDF

console.log("pdf-utils.ts module loaded.");

interface PDFOptions {
  includeRingCharts: boolean;
  // Add more options as needed for other visualizations
}

export const generateAnalyticsPdf = (
  projects: Project[],
  options: PDFOptions
) => {
  console.log("generateAnalyticsPdf function called.");
  const doc = new jsPDF();
  console.log("jsPDF object after applyPlugin:", jsPDF);
  console.log("doc object after applyPlugin:", doc);
  console.log("doc.autoTable after applyPlugin:", (doc as any).autoTable);

  // Title
  doc.setFontSize(18);
  doc.text("Analytics Report", 14, 22);

  // Summary of Selected Projects
  doc.setFontSize(12);
  doc.text(`Selected Projects: ${projects.length}`, 14, 30);

  // Project Table
  (doc as any).autoTable({
    startY: 40,
    head: [["ID", "Name", "Status", "Contact", "Profit", "Revenue"]],
    body: projects.map((project) => [
      project.id,
      project.name,
      project.status,
      project.contact.name,
      formatCurrency(project.financials.profits - project.financials.expenses),
      formatCurrency(project.financials.profits),
    ]),
    theme: "striped",
    headStyles: { fillColor: "#f8f8f8", textColor: "#333" },
    styles: { overflow: "linebreak" },
  });

  // Final Calculation Area
  // Use doc.lastAutoTable.finalY to get the Y-coordinate of the end of the last table.
  const finalCalculationsY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text("Summary Statistics", 14, finalCalculationsY);

  const totalProfit = projects.reduce(
    (sum, project) =>
      sum + (project.financials.profits - project.financials.expenses),
    0
  );
  const totalRevenue = projects.reduce(
    (sum, project) => sum + project.financials.profits,
    0
  );
  const averageProfit = projects.length > 0 ? totalProfit / projects.length : 0;

  doc.setFontSize(12);
  doc.text(
    `Total Profit: ${formatCurrency(totalProfit)}`,
    14,
    finalCalculationsY + 10
  );
  doc.text(
    `Total Revenue: ${formatCurrency(totalRevenue)}`,
    14,
    finalCalculationsY + 17
  );
  doc.text(
    `Average Profit per Project: ${formatCurrency(averageProfit)}`,
    14,
    finalCalculationsY + 24
  );

  if (options.includeRingCharts) {
    // Placeholder for Ring Chart - In a real application, you would render your chart
    // to an image (e.g., using a canvas library like Chart.js or Recharts)
    // and then add that image to the PDF.
    // For demonstration, we'll just add some text.
    doc.setFontSize(14);
    doc.text("Data Visualizations (Ring Charts)", 14, finalCalculationsY + 40);
    doc.setFontSize(10);
    doc.text(
      "Placeholder for actual ring chart images based on selected data.",
      14,
      finalCalculationsY + 47
    );
    doc.text(
      "Integration would involve rendering chart components off-screen and converting them to images.",
      14,
      finalCalculationsY + 52
    );
  }

  doc.save("analytics-report.pdf");
};
