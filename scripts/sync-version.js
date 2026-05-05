import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function main() {
  const versionPath = path.join(root, 'VERSION');
  const version = (await fs.readFile(versionPath, 'utf8')).trim();

  // Update package.json
  const packageJsonPath = path.join(root, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  packageJson.version = version;
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  const packageLockPath = path.join(root, 'package-lock.json');
  try {
    const packageLock = JSON.parse(await fs.readFile(packageLockPath, 'utf8'));
    packageLock.version = version;
    if (packageLock.packages?.['']) {
      packageLock.packages[''].version = version;
    }
    await fs.writeFile(packageLockPath, JSON.stringify(packageLock, null, 2) + '\n');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const pyprojectPath = path.join(root, 'python', 'pyproject.toml');
  try {
    let pyproject = await fs.readFile(pyprojectPath, 'utf8');
    pyproject = pyproject.replace(/version = "[^"]+"/g, `version = "${version}"`);
    await fs.writeFile(pyprojectPath, pyproject);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  console.log(`Synced version ${version} to package.json, package-lock.json, and pyproject.toml`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
