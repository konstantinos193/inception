const { exec } = require('child_process');
const path = require('path');

function processImage(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`Processing ${inputPath}...`);
    const scriptPath = path.join(__dirname, 'remove_bg.py');
    const command = `py "${scriptPath}" "${inputPath}" "${outputPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      console.log(stdout);
      resolve();
    });
  });
}

async function main() {
  const lightModeInput = path.join(__dirname, 'public', 'hero-bg.png');
  const lightModeOutput = path.join(__dirname, 'public', 'hero-bg-no-bg.png');
  
  const darkModeInput = path.join(__dirname, 'public', 'hero-bg-dark.png');
  const darkModeOutput = path.join(__dirname, 'public', 'hero-bg-dark-no-bg.png');

  await processImage(lightModeInput, lightModeOutput);
  await processImage(darkModeInput, darkModeOutput);
}

main();
