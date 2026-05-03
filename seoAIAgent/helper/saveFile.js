import fs from "fs/promises";

async function saveResults(results, fileName) {
  try {
    await fs.writeFile(
      `data/${fileName}`,
      JSON.stringify(results, null, 2),
      "utf-8",
    );
    console.log(`Saved ${fileName}`);
  } catch (err) {
    console.error("Error saving file:", err);
  }
}
export default saveResults;
