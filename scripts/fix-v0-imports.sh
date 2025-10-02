#!/bin/bash

# Fix v0 Import Paths Script
# Converts @/ imports to relative paths in packages/ui

echo "🔧 Fixing v0 import paths..."

cd packages/ui/src/components || exit 1

# Fix imports in all TypeScript files
find . -name "*.tsx" -o -name "*.ts" | while read -r file; do
  echo "Processing: $file"
  
  # Count directory depth
  depth=$(echo "$file" | tr -cd '/' | wc -c)
  
  # Build relative path prefix
  prefix=""
  for ((i=1; i<depth; i++)); do
    prefix="../$prefix"
  done
  
  # Replace @/components with relative path
  sed -i "s|@/components|${prefix}|g" "$file"
  
  # Replace @/lib with relative path to lib
  sed -i "s|@/lib|${prefix}../lib|g" "$file"
  
  # Replace @/hooks with relative path to hooks
  sed -i "s|@/hooks|${prefix}../hooks|g" "$file"
done

echo "✅ Import paths fixed!"
echo ""
echo "Next steps:"
echo "1. cd packages/ui"
echo "2. pnpm install"
echo "3. pnpm build"
