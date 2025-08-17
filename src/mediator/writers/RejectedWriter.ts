import { DataRecord } from "../../models/DataRecord";
import * as fs from "fs/promises";
import * as path from "path";

export class RejectedWriter {
  private lines: string[] = [];

  write(record: DataRecord, error: string) {
    let minimalRecord: Partial<DataRecord> = { type: record.type };
    if (record.type === "access_log") {
      minimalRecord = { type: record.type, ip: (record as any).ip };
    } else if (record.type === "transaction") {
      minimalRecord = { type: record.type };
    }
    const entry = {
      record: minimalRecord,
      error: this.formatError(error),
    };
    this.lines.push(JSON.stringify(entry));
  }

  private formatError(error: string): string {
    if (error.includes("userId")) return "Invalid userId";
    if (error.includes("amount")) return "Invalid amount";
    if (error.includes("currency")) return "Invalid currency";
    if (error.includes("Missing required field"))
      return error;
    return error;
  }
  
  async finalize() {
    const outputDir = path.resolve("src/output");
    await fs.mkdir(outputDir, { recursive: true });
    const outputFile = path.join(outputDir, "rejected.jsonl");
    await fs.writeFile(outputFile, this.lines.join("\n"), "utf-8");
  }
}