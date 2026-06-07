import type { Transaction } from "@/hooks/use-finance-store"

export function exportToCSV(transactions: Transaction[]) {
  const headers = ["Tanggal", "Tipe", "Kategori", "Nominal", "Keterangan"]
  const rows = transactions.map((t) => [
    t.date,
    t.type === "income" ? "Pemasukan" : "Pengeluaran",
    t.category,
    t.amount.toString(),
    t.description ?? "",
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n")
  download(csv, "transaksi-frugalside.csv", "text/csv")
}

export function exportToJSON(transactions: Transaction[]) {
  const json = JSON.stringify(transactions, null, 2)
  download(json, "transaksi-frugalside.json", "application/json")
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
