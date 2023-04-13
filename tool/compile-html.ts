import fs from 'fs';
import path from 'path';

const compileHtml = async () => {
  const baseDir = './src/html';
  const characterSheetHtml = Bun.file(`${baseDir}/character-sheet.html`);
  const rawHtml = await characterSheetHtml.text();
  const html = await processHtmlIncludes(baseDir, rawHtml);

  const characterSheetCompiledScript = Bun.file('./build/js/index.js');
  const script = await characterSheetCompiledScript.text();

  // There's probably a tsconfig way to fix this, but for now we'll modify the code to remove the export statement.
  const revisedScript = script.replace(/export\s+\{};/g, '');

  const output = `${html}\n<script type="text/worker">\n${revisedScript}\n</script>\n`;
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
  }
  await Bun.write('./dist/custom-character-sheet.html', output);
};

const compileCss = async () => {
  const characterSheetCss = Bun.file('./build/css/paranoia-rce.css');
  const css = await characterSheetCss.text();
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
  }
  await Bun.write('./dist/custom-character-sheet.css', css);
}

const compile = async () => {
  await Promise.all([compileHtml(), compileCss()]);
}

const SERVER_SIDE_INCLUDE_MATCHER = /<!--#include\s+file\s*=\s*("([^"]+)"|'([^"]+)')\s*-->/;

const loadIncludedHtml = async (baseDirectory: string, includeFile: string): Promise<string> => {
  const filePath = path.resolve(baseDirectory, includeFile);
  const loadedFile = Bun.file(filePath);
  const html = await loadedFile.text();
  const newBaseDirectory = path.dirname(filePath);
  return await processHtmlIncludes(newBaseDirectory, html);
};

const processHtmlIncludes = async (baseDirectory: string, html: string): Promise<string> => {
  let outputHtml = html;
  let match: RegExpExecArray | null;
  do {
    match = SERVER_SIDE_INCLUDE_MATCHER.exec(outputHtml);
    if (match) {
      const includeTag = match[0];
      const includeFile = match[2];
      const includedHtml = await loadIncludedHtml(baseDirectory, includeFile);
      outputHtml = outputHtml.replace(includeTag, includedHtml);
    }
  } while (match);
  return outputHtml;
};

compile().catch(err => {
  console.error('Error compiling character sheets:', err);
  process.exit(1);
});
