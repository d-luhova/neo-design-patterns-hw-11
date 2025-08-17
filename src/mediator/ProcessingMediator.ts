import { DataRecord } from "../models/DataRecord";
import { AccessLogWriter } from "./writers/AccessLogWriter";
import { TransactionWriter } from "./writers/TransactionWriter";
import { ErrorLogWriter } from "./writers/ErrorLogWriter";
import { RejectedWriter } from "./writers/RejectedWriter";

export class ProcessingMediator {
  private writerMap: Record<string, any>;
  private rejectedWriter: RejectedWriter;

  private totalRecords = 0;
  private successfulRecords = 0;
  private rejectedRecords = 0;

  constructor(
    accessLogWriter: AccessLogWriter,
    transactionWriter: TransactionWriter,
    errorLogWriter: ErrorLogWriter,
    rejectedWriter: RejectedWriter
  ) {
    this.writerMap = {
      access_log: accessLogWriter,
      transaction: transactionWriter,
      system_error: errorLogWriter,
    };
    this.rejectedWriter = rejectedWriter;
  }

  onSuccess(record: DataRecord) {
    const writer = this.writerMap[record.type];
    if (!writer) {
      this.rejectedWriter.write(record, `No writer for type: ${record.type}`);
      return;
    }
    writer.write(record);
    this.successfulRecords++;
  }

  onRejected(original: DataRecord, error: string) {
    this.totalRecords++;
    this.rejectedWriter.write(original, error);
    this.rejectedRecords++;
  }

  async finalize() {
    const writers = Object.values(this.writerMap).concat(this.rejectedWriter);
    for (const writer of writers) {
      if (writer.finalize) {
        await writer.finalize();
      }
    }
    console.log(`[INFO] Завантажено записів: ${this.totalRecords}`);
    console.log(`[INFO] Успішно оброблено: ${this.successfulRecords}`);
    console.log(`[WARN] Відхилено з помилками: ${this.rejectedRecords}`);
    console.log(`[INFO] Звіт збережено у директорії output/`);
  }
}