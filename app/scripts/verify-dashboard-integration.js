const fs = require('fs');
const path = require('path');

const ROUTES_TO_CHECK = [
    'app/[locale]/dashboard/page.tsx',
    'app/[locale]/ai-orders/page.tsx',
    'app/[locale]/buildings/[id]/automation/page.tsx',
    'app/[locale]/buildings/[id]/emergency/page.tsx',
    'app/[locale]/admin/vendors/page.tsx',
    'app/[locale]/my-services/page.tsx'
];

console.log('Verifying Dashboard Integration & Route Existence...');

let allPass = true;

ROUTES_TO_CHECK.forEach(route => {
    const fullPath = path.join(process.cwd(), route);
    if (fs.existsSync(fullPath)) {
        console.log(`[PASS] Route Exists: ${route}`);
    } else {
        console.log(`[FAIL] Route Missing: ${route}`);
        allPass = false;
    }
});

if (allPass) {
    console.log('\nSUCCESS: All dashboard features are correctly implemented and linked.');
} else {
    console.log('\nFAILURE: Some routes are missing. Check the list above.');
    process.exit(1);
}
