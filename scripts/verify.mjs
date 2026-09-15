import { execSync } from "node:child_process";

const run = (c) => {
  console.log(`$ ${c}`);
  execSync(c, { stdio: "inherit" });
};

run("npx tsc --noEmit");
run('node --test --experimental-strip-types "src/test/**/*.test.mjs"');
console.log("verify: OK");
