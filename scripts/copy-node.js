const fs = require('fs-extra');
const path = require('path');

async function copyNodeFiles() {
  const sourceDir = path.join(__dirname, '../build/Debug');
  const targetDir = path.join(__dirname, '../packages/node-release/dist');

  try {
    await fs.mkdirp(targetDir);

    // 查找所有 .node 文件
    const files = await fs.readdir(sourceDir);
    const nodeFiles = files.filter(file => file.endsWith('.node'));

    // 复制每个 .node 文件
    for (const file of nodeFiles) {
      const sourceFile = path.join(sourceDir, file);
      const targetFile = path.join(targetDir, file);

      console.log(`Copying ${file} to ${targetDir}`);
      await fs.copy(sourceFile, targetFile);
    }

    console.log('✅ .node files copied successfully!');
  } catch (err) {
    console.error('❌ Error copying .node files:', err);
    process.exit(1);
  }
}

copyNodeFiles();