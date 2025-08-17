import * as fs from "fs/promises";
import { buildAccessLogChain } from "./chain/chains/AccessLogChain";
import { buildTransactionChain } from "./chain/chains/TransactionChain";
import { buildSystemErrorChain } from "./chain/chains/SystemErrorChain";
import { ProcessingMediator } from "./mediator/ProcessingMediator";
import { AccessLogWriter } from "./mediator/writers/AccessLogWriter";
import { TransactionWriter } from "./mediator/writers/TransactionWriter";
import { ErrorLogWriter } from "./mediator/writers/ErrorLogWriter";
import { RejectedWriter } from "./mediator/writers/RejectedWriter";
import { DataRecord } from "./models/DataRecord";

const handlerMap = {
  access_log: buildAccessLogChain,
  transaction: buildTransactionChain,
  system_error: buildSystemErrorChain,
};

async function main() {
  const rawData = await fs.readFile("src/data/records.json", "utf-8");
  const records: DataRecord[] = JSON.parse(rawData);
  const accessLogWriter = new AccessLogWriter();
  const transactionWriter = new TransactionWriter();
  const errorLogWriter = new ErrorLogWriter();
  const rejectedWriter = new RejectedWriter();

  const mediator = new ProcessingMediator(
    accessLogWriter,
    transactionWriter,
    errorLogWriter,
    rejectedWriter
  );

  for (const record of records) {
    const buildChain = handlerMap[record.type];
    if (!buildChain) {
      mediator.onRejected(record, "Unknown record type");
      continue;
    }

    const handlerChain = buildChain();

    try {
      const processed = handlerChain.handle(record);
      mediator.onSuccess(processed);
    } catch (err: any) {
      mediator.onRejected(record, err.message || "Processing error");
    }
  }

  await mediator.finalize();
  console.log("Processing finished.");
}

main();