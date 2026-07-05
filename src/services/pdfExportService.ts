export async function exportElementToPdf(element: HTMLElement, filename: string): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;
  await html2pdf()
    .set({
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save();
}

export async function exportTextReportToPdf(
  container: HTMLElement,
  filename: string,
): Promise<void> {
  return exportElementToPdf(container, filename);
}
