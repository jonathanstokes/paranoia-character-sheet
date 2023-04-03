import fs from 'fs';

const compileHtml = async () => {
  const characterSheetHtml = Bun.file('./src/html/paranoia-rce.html');
  const html = await characterSheetHtml.text();

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

compile().catch(err => {
  console.error('Error compiling character sheets:', err);
  process.exit(1);
});
