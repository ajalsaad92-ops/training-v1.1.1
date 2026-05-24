// Two professional print templates rendered in a hidden iframe and printed.
import type { ReportSource } from "@/lib/reportEngine";
import { formatRow } from "@/lib/reportEngine";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type PrintTemplate = "official" | "executive";

interface PrintOptions {
  template: PrintTemplate;
  title: string;
  source: ReportSource;
  rows: Record<string, unknown>[];
  columns: string[];
  dateFrom?: string;
  dateTo?: string;
  preparedBy?: string;
  organization?: string;
}

const ORG = "قسم التدريب والتطوير";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function buildHtml(opts: PrintOptions): string {
  const { template, title, source, rows, columns, dateFrom, dateTo, preparedBy, organization } = opts;
  const cols = columns.map((k) => source.columns.find((c) => c.key === k)).filter(Boolean) as NonNullable<ReturnType<typeof source.columns.find>>[];
  const headers = cols.map((c) => `<th>${escapeHtml(c!.label)}</th>`).join("");
  const body = rows
    .map((r, i) => {
      const cells = formatRow(source, r, columns).map((v) => `<td>${escapeHtml(v)}</td>`).join("");
      return `<tr><td class="num">${i + 1}</td>${cells}</tr>`;
    })
    .join("");
  const dateRange = dateFrom || dateTo ? `<span>الفترة: ${dateFrom || "—"} إلى ${dateTo || "—"}</span>` : "";
  const generatedAt = new Date().toLocaleString("ar-SA");
  const org = organization || ORG;
  const totalRows = rows.length;

  const officialHeader = `
    <header class="hdr">
      <div class="hdr-row">
        <div class="hdr-org">
          <div class="logo">📋</div>
          <div>
            <div class="org-name">${escapeHtml(org)}</div>
            <div class="org-sub">مديرية شؤون المحافظات العامة</div>
          </div>
        </div>
        <div class="hdr-meta">
          <div><b>تاريخ التقرير:</b> ${generatedAt}</div>
          <div><b>المرجع:</b> RPT-${Date.now().toString().slice(-6)}</div>
          ${dateRange ? `<div>${dateRange}</div>` : ""}
        </div>
      </div>
      <h1 class="report-title">${escapeHtml(title)}</h1>
      <div class="title-bar"></div>
    </header>`;

  const officialFooter = `
    <section class="signatures">
      <div class="sig-block">
        <div class="sig-label">أعدّه</div>
        <div class="sig-line"></div>
        <div class="sig-name">${escapeHtml(preparedBy || "—")}</div>
      </div>
      <div class="sig-block">
        <div class="sig-label">راجعه</div>
        <div class="sig-line"></div>
        <div class="sig-name">رئيس الشعبة</div>
      </div>
      <div class="sig-block">
        <div class="sig-label">اعتمده</div>
        <div class="sig-line"></div>
        <div class="sig-name">مدير القسم</div>
      </div>
    </section>`;

  const executiveHeader = `
    <header class="exec-hdr">
      <div class="exec-tag">تقرير تنفيذي</div>
      <h1>${escapeHtml(title)}</h1>
      <div class="exec-meta">
        <span>${escapeHtml(org)}</span>
        <span>•</span>
        <span>${generatedAt}</span>
        ${dateRange ? `<span>•</span>${dateRange}` : ""}
      </div>
      <div class="exec-stats">
        <div class="stat"><div class="stat-num">${totalRows}</div><div class="stat-lbl">إجمالي السجلات</div></div>
        <div class="stat"><div class="stat-num">${cols.length}</div><div class="stat-lbl">الأعمدة</div></div>
        <div class="stat"><div class="stat-num">${escapeHtml(source.label)}</div><div class="stat-lbl">المصدر</div></div>
      </div>
    </header>`;

  const styles = `
    @page { size: A4; margin: 18mm 14mm; }
    * { box-sizing: border-box; }
    html, body { padding: 0; margin: 0; }
    body { font-family: 'Tajawal','Segoe UI',Arial,sans-serif; color:#111; direction: rtl; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
    th, td { border: 1px solid #d8d8d8; padding: 6px 8px; text-align: right; vertical-align: top; }
    td.num { width: 36px; text-align: center; color:#666; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }

    /* OFFICIAL */
    .hdr { border-bottom: 2px solid #0a4d8c; padding-bottom: 10px; margin-bottom: 14px; }
    .hdr-row { display:flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .hdr-org { display:flex; gap: 10px; align-items: center; }
    .logo { width:54px; height:54px; border:2px solid #0a4d8c; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:26px; }
    .org-name { font-size: 18px; font-weight: 800; color:#0a4d8c; }
    .org-sub { font-size: 11px; color:#666; }
    .hdr-meta { font-size: 11px; color:#333; line-height: 1.7; text-align: left; }
    .report-title { text-align:center; margin: 14px 0 6px; font-size: 20px; color:#0a4d8c; }
    .title-bar { height: 3px; background: linear-gradient(90deg, #0a4d8c, #2a85d6); border-radius: 2px; }
    .official thead th { background:#eaf2fb; color:#0a4d8c; font-weight:700; }
    .signatures { display:flex; justify-content: space-around; gap:16px; margin-top: 50px; page-break-inside: avoid; }
    .sig-block { text-align:center; flex:1; }
    .sig-label { font-size: 11px; color:#666; margin-bottom: 28px; }
    .sig-line { border-bottom: 1px solid #333; margin-bottom: 6px; }
    .sig-name { font-size: 12px; font-weight: 700; }

    /* EXECUTIVE */
    .exec-hdr { padding: 18px; border-radius: 12px; background: linear-gradient(135deg, #0f172a, #1e3a8a); color:#fff; margin-bottom: 16px; }
    .exec-tag { display:inline-block; background: rgba(255,255,255,.18); padding:4px 10px; border-radius: 999px; font-size: 11px; letter-spacing: .5px; }
    .exec-hdr h1 { margin: 8px 0 4px; font-size: 22px; }
    .exec-meta { font-size: 11px; opacity: .9; display:flex; gap:8px; flex-wrap:wrap; }
    .exec-stats { display:flex; gap: 12px; margin-top: 14px; }
    .stat { flex:1; background: rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18); border-radius:10px; padding:10px; text-align:center; }
    .stat-num { font-size: 20px; font-weight: 800; }
    .stat-lbl { font-size: 11px; opacity:.85; margin-top:2px; }
    .executive thead th { background:#0f172a; color:#fff; font-weight:700; }
    .executive tbody tr:nth-child(even) { background:#f8fafc; }

    .meta-line { color:#666; font-size:11px; margin: 8px 0 4px; }
    .footer { margin-top: 18px; font-size: 10px; color:#888; border-top: 1px dashed #ccc; padding-top: 6px; display:flex; justify-content: space-between; }
  `;

  const tableClass = template === "official" ? "official" : "executive";

  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head>
    <meta charset="utf-8"/>
    <title>${escapeHtml(title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet"/>
    <style>${styles}</style>
  </head><body class="${tableClass}">
    ${template === "official" ? officialHeader : executiveHeader}
    <div class="meta-line">عدد السجلات: ${totalRows} • وصف المصدر: ${escapeHtml(source.description)}</div>
    <table>
      <thead><tr><th class="num">#</th>${headers}</tr></thead>
      <tbody>${body || `<tr><td colspan="${cols.length + 1}" style="text-align:center;padding:30px;color:#888">لا توجد سجلات</td></tr>`}</tbody>
    </table>
    ${template === "official" ? officialFooter : ""}
    <div class="footer"><span>${escapeHtml(org)} — تقرير آلي</span><span>صفحة <span class="page"></span></span></div>
  </body></html>`;
}

export function printReport(opts: PrintOptions) {
  const html = buildHtml(opts);
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.onload = () => {
    setTimeout(() => {
      w.focus();
      w.print();
    }, 400);
  };
}

export function downloadHtml(opts: PrintOptions) {
  const html = buildHtml(opts);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.title}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportPdf(opts: PrintOptions) {
  const html = buildHtml(opts);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "794px"; // A4 @ 96dpi
  iframe.style.height = "1123px";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();
  // wait for fonts/layout
  await new Promise<void>((resolve) => {
    const done = () => resolve();
    if (doc.readyState === "complete") setTimeout(done, 500);
    else iframe.onload = () => setTimeout(done, 500);
  });
  try {
    const d = doc as Document & { fonts?: { ready: Promise<unknown> } };
    if (d.fonts?.ready) await d.fonts.ready;
  } catch { /* ignore */ }
  const target = doc.body;
  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: target.scrollWidth,
    windowHeight: target.scrollHeight,
  });
  document.body.removeChild(iframe);

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  let heightLeft = imgH;
  let position = 0;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
  }
  pdf.save(`${opts.title}.pdf`);
}
