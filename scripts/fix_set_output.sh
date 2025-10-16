#!/bin/bash

# Fix deprecated set-output commands in GitHub Actions workflows
# Replace ::set-output with GITHUB_OUTPUT environment file

echo "Fixing set-output commands in workflows..."

# Fix bash echo set-output
sed -i '' 's/echo "::set-output name=\([^:]*\)::\([^"]*\)"/echo "\1=\2" >> $GITHUB_OUTPUT/g' .github/workflows/*.yml

# Fix Node.js console.log set-output
sed -i '' "s/console.log('::set-output name=\([^:]*\)::' + \([^)]*\))/const fs = require('fs'); fs.appendFileSync(process.env.GITHUB_OUTPUT, \`\1=\${\2}\\\\n\`)/g" .github/workflows/*.yml

echo "✅ Fixed set-output commands"
echo "Note: Manual review recommended for complex cases"
