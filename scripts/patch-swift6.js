const fs = require('fs');
const path = require('path');

function patchDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '.git') patchDirectory(fullPath);
    } else if (entry.name.startsWith('Package.swift')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      // 1. Lower swift-tools-version to 6.0
      content = content.replace(/swift-tools-version:\s*6\.[12]/g, 'swift-tools-version: 6.0');
      // 2. Remove 6.2-only upcoming features
      content = content.replace(/.*enableUpcomingFeature.*\n?/g, '');
      // 3. Remove 6.2-only -Werror warning group flags
      content = content.replace(/.*"-Werror",\s*"(ImplicitStrongCapture|NoUsage)".*\n?/g, '');
      // 4. Remove trailing commas before closing parenthesis in function calls
      content = content.replace(/,\s*\)/g, '\n)');
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Successfully patched for Swift 6.0:', fullPath);
      }
    }
  }
}

patchDirectory(path.join(__dirname, '..', 'node_modules'));
console.log('Swift 6.0 compatibility patches applied successfully.');
