// CI helper (NOT part of the CooL standard): validates that every example in
// examples/ matches its manifest `expect_schema_valid` flag against the
// authoritative receipt.schema.json. Run by .github/workflows/ci.yml.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const schema = JSON.parse(readFileSync(path.join(root, "receipt-format", "receipt.schema.json"), "utf8"));
const ajv = new Ajv2020({ strict: false, allErrors: true, logger: false });
const validate = ajv.compile(schema);

const manifest = JSON.parse(readFileSync(path.join(root, "examples", "index.json"), "utf8"));
let failures = 0;
for (const v of manifest.vectors) {
  const receipt = JSON.parse(readFileSync(path.join(root, "examples", v.file), "utf8"));
  const ok = Boolean(validate(receipt));
  if (ok !== v.expect_schema_valid) {
    failures++;
    console.error(`FAIL ${v.file}: schema-valid=${ok}, expected ${v.expect_schema_valid}`);
  } else {
    console.log(`ok   ${v.file}: schema-valid=${ok}`);
  }
}
if (failures > 0) {
  console.error(`${failures} example(s) did not match their expected schema validity.`);
  process.exit(1);
}
console.log("All examples match their expected schema validity.");
