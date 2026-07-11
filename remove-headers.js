const fs = require('fs');

const files = [
  'app/about/page.tsx',
  'app/contact/page.tsx',
  'app/shipping/page.tsx',
  'app/terms-conditions/page.tsx',
  'app/privacy/page.tsx',
  'app/return-refund/page.tsx',
  'app/cookie-policy/page.tsx',
  'app/cancellation/page.tsx',
  'app/faq/page.tsx',
  'app/blog/page.tsx',
  'app/my-account/page.tsx',
  'app/track-order/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove the navigation/header block. 
    const headerRegex = /[ \t]*\{\/\* Navigation \*\/\}\n[ \t]*<header[\s\S]*?<\/header>\n/g;
    const headerRegex2 = /[ \t]*<header className="fixed top-0[\s\S]*?<\/header>\n/g;
    
    content = content.replace(headerRegex, '');
    content = content.replace(headerRegex2, '');
    
    // Adjust padding top for the first section
    // Most of them have <section className="pt-48...
    // Let's replace pt-48 with pt-28, and pt-32 with pt-28 for consistency
    content = content.replace(/className="pt-48/g, 'className="pt-28 md:pt-32');
    content = content.replace(/className="pt-32/g, 'className="pt-28 md:pt-32');
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
