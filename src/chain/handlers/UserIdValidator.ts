import { AbstractHandler } from "../AbstractHandler";
import { AccessLogRecord } from "../../models/DataRecord";

export class UserIdValidator extends AbstractHandler {
  protected process(record: AccessLogRecord): AccessLogRecord {
    if (!record.userId) {
      throw new Error("Invalid record: missing userId");
    }
    // Якщо userId має бути числом, можна перетворити
    const id = Number(record.userId);
    if (isNaN(id)) {
      throw new Error("Invalid record: userId is not a number");
    }
    record.userId = id.toString();
    return record;
  }
}