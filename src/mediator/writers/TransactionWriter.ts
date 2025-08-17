import { TransactionRecord } from "../../models/DataRecord";
import * as fs from "fs/promises";
import * as path from "path";

export class TransactionWriter {
  private lines: string[] = ["timestamp,amount,currency"];

  write(record: TransactionRecord) {
    this.lines.push(`${record.timestamp},${record.amount},${record.currency}`);
  }

  async finalize() {
    const outputDir = path.resolve("src/output");
    const outputFile = path.join(outputDir, "transactions.csv");
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputFile, this.lines.join("\n"), "utf-8");
  }
}