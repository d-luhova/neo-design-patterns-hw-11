import { SystemErrorRecord } from "../../models/DataRecord";
import * as fs from "fs/promises";
import * as path from "path";

export class ErrorLogWriter {
  private records: SystemErrorRecord[] = [];

  write(record: SystemErrorRecord) {
    this.records.push(record);
  }

  async finalize() {
    const outputDir = path.resolve("src/output");
    await fs.mkdir(outputDir, { recursive: true });

    const outputFile = path.join(outputDir, "errors.jsonl");
    const lines = this.records.map(r => JSON.stringify(r));
    await fs.writeFile(outputFile, lines.join("\n"), "utf-8");
  }
}