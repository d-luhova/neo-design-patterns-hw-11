import { AbstractHandler } from "../AbstractHandler";
import { SystemErrorRecord } from "../../models/DataRecord";

export class MessageTrimmer extends AbstractHandler {
  protected process(record: SystemErrorRecord): SystemErrorRecord {
    if (record.message && typeof record.message === "string") {
      record.message = record.message.trim().substring(0, 255);
    }
    return record;
  }
}