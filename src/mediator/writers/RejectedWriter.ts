import { DataRecord } from "../../models/DataRecord";
import * as fs from "fs/promises";

export class RejectedWriter {
  private lines: string[] = [];

  write(record: DataRecord, error: string) {
    const line = JSON.stringify({ ...record, error });
    this.lines.push(line);
  }

  async finalize() {
    await fs.writeFile("rejected_records.json", this.lines.join("\n"), "utf-8");
  }
}