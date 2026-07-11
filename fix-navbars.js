const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') && !file.includes('app/layout.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('<Navbar')) {
    content = content.replace(/^[ \t]*<Navbar[\s\S]*?\/>\n/gm, '');
    changed = true;
  }
  
  if (content.includes('import Navbar')) {
    content = content.replace(/^import Navbar.*?\n/gm, '');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  }
});
