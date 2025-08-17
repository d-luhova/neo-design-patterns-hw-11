import { AbstractHandler } from "../AbstractHandler";
import { DataRecord } from "../../models/DataRecord";

export class TimestampParser extends AbstractHandler {
  protected process(record: DataRecord): DataRecord {
    if (record.timestamp && typeof record.timestamp === "string") {
      const date = new Date(record.timestamp);
      if (!isNaN(date.getTime())) {
        record.timestamp = date.toISOString();
      }
    }
    return record;
  }
}
