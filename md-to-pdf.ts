import { mdToHtml } from "./md-to-html";
import { join } from "path";
import { execSync } from "child_process";
import os from "os";
import { mkdtempSync, readFileSync, writeFileSync } from "fs";

(async () => {
  const md = readFileSync(process.argv[2], "utf8");

  const tmpDir = mkdtempSync(join(os.tmpdir(), "markdown-to-pdf-"));

  const mdChunks = md.split("\n").reduce(
    (acc, val) =>
      val.startsWith("#") &&
      !acc.at(-1).split("\n").filter(Boolean).at(-1)?.startsWith("#")
        ? [...acc, val]
        : [...acc.slice(0, -1), acc.at(-1) + "\n" + val],

    [""],
  );

  let prevI = 0;
  for (let i = 0; i < mdChunks.length; i++) {
    writeFileSync(
      join(tmpDir, `tmp.html`),
      await mdToHtml(mdChunks.slice(prevI, i + 1).join("\n"), {
        title: "",
      }),
      "utf8",
    );
    execSync(
      `prince ${join(tmpDir, `tmp.html`)} --pdf-profile='PDF/UA-1' -o ${join(tmpDir, `tmp.pdf`)}`,
    );
    const pageCount = parseInt(
      execSync(
        `pdfinfo ${join(tmpDir, `tmp.pdf`)} | grep Pages | awk '{print $2}'`,
      ).toString(),
    );
    console.log(
      `Chunk ${i}:${prevI}:${pageCount}: ${mdChunks[i].split("\n")[0]}`,
    );
    if (pageCount > 1) {
      prevI = i;
    } else {
      execSync(
        `mv ${join(tmpDir, `tmp.pdf`)} ${join(
          tmpDir,
          `output.${prevI.toString().padStart(5, "0")}`,
        )}`,
      );
    }
  }

  execSync(`pdfunite ${join(tmpDir, `output.*`)} ${process.argv[3]}`);
})().catch((error) => {
  throw error;
});
