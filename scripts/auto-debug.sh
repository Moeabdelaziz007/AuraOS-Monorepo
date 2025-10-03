#!/bin/bash

# Automated Debugging System
# Attempts to automatically fix common issues

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 AuraOS Automated Debugging${NC}"
echo ""

FIXES_APPLIED=0

# Function to apply fix
apply_fix() {
    echo -e "${GREEN}✅ FIXED: $1${NC}"
    FIXES_APPLIED=$((FIXES_APPLIED + 1))
}

# Function to report issue
report_issue() {
    echo -e "${YELLOW}⚠️  ISSUE: $1${NC}"
}

# 1. Fix node_modules
echo -e "${BLUE}📚 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    report_issue "node_modules not found"
    echo "Installing dependencies..."
    npm install
    apply_fix "Installed dependencies"
fi

# 2. Fix .env file
echo -e "${BLUE}🔐 Checking .env file...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        report_issue ".env not found"
        cp .env.example .env
        apply_fix "Created .env from .env.example"
        echo -e "${YELLOW}⚠️  Please update .env with your actual values${NC}"
    else
        report_issue ".env.example not found, cannot create .env"
    fi
fi

# 3. Fix .gitignore
echo -e "${BLUE}📝 Checking .gitignore...${NC}"
if [ -f ".gitignore" ]; then
    if ! grep -q "^\.env$" .gitignore; then
        report_issue ".env not in .gitignore"
        echo ".env" >> .gitignore
        apply_fix "Added .env to .gitignore"
    fi
    
    if ! grep -q "^node_modules$" .gitignore; then
        report_issue "node_modules not in .gitignore"
        echo "node_modules" >> .gitignore
        apply_fix "Added node_modules to .gitignore"
    fi
    
    if ! grep -q "^dist$" .gitignore; then
        report_issue "dist not in .gitignore"
        echo "dist" >> .gitignore
        apply_fix "Added dist to .gitignore"
    fi
fi

# 4. Fix Firebase configuration
echo -e "${BLUE}🔥 Checking Firebase configuration...${NC}"
if [ -f "firebase.json" ]; then
    PUBLIC_DIR=$(jq -r '.hosting.public' firebase.json 2>/dev/null || echo "")
    if [ -n "$PUBLIC_DIR" ] && [ ! -d "$PUBLIC_DIR" ]; then
        report_issue "Hosting directory '$PUBLIC_DIR' does not exist"
        mkdir -p "$PUBLIC_DIR"
        apply_fix "Created hosting directory: $PUBLIC_DIR"
    fi
fi

# 5. Clean build artifacts
echo -e "${BLUE}🧹 Cleaning old build artifacts...${NC}"
if [ -d "packages/ui/dist" ]; then
    rm -rf packages/ui/dist
    apply_fix "Cleaned packages/ui/dist"
fi

# 6. Fix TypeScript issues
echo -e "${BLUE}🔤 Checking TypeScript configuration...${NC}"
if [ -f "tsconfig.json" ]; then
    # Check if tsconfig is valid JSON
    if ! jq empty tsconfig.json 2>/dev/null; then
        report_issue "Invalid tsconfig.json"
        echo -e "${RED}❌ Cannot auto-fix invalid JSON in tsconfig.json${NC}"
    fi
fi

# 7. Fix package.json scripts
echo -e "${BLUE}📦 Checking package.json...${NC}"
if [ -f "package.json" ]; then
    # Check if auto-check script exists
    if ! jq -e '.scripts["auto-check"]' package.json > /dev/null 2>&1; then
        report_issue "auto-check script not in package.json"
        jq '.scripts["auto-check"] = "./scripts/auto-check.sh"' package.json > package.json.tmp
        mv package.json.tmp package.json
        apply_fix "Added auto-check script to package.json"
    fi
    
    # Check if auto-debug script exists
    if ! jq -e '.scripts["auto-debug"]' package.json > /dev/null 2>&1; then
        report_issue "auto-debug script not in package.json"
        jq '.scripts["auto-debug"] = "./scripts/auto-debug.sh"' package.json > package.json.tmp
        mv package.json.tmp package.json
        apply_fix "Added auto-debug script to package.json"
    fi
fi

# 8. Fix Git issues
echo -e "${BLUE}📝 Checking Git configuration...${NC}"
if [ -d ".git" ]; then
    # Check if .env is tracked
    if git ls-files | grep -q "^\.env$"; then
        report_issue ".env is tracked by Git"
        git rm --cached .env 2>/dev/null || true
        apply_fix "Removed .env from Git tracking"
    fi
    
    # Check for large files
    LARGE_FILES=$(git ls-files | xargs -I{} sh -c 'if [ -f "{}" ]; then stat -f%z "{}" 2>/dev/null || stat -c%s "{}"; fi' | awk '$1 > 10485760 {print}' | wc -l)
    if [ "$LARGE_FILES" -gt 0 ]; then
        report_issue "Found $LARGE_FILES files larger than 10MB"
        echo -e "${YELLOW}⚠️  Consider using Git LFS for large files${NC}"
    fi
fi

# 9. Fix permissions
echo -e "${BLUE}🔒 Checking file permissions...${NC}"
for script in scripts/*.sh; do
    if [ -f "$script" ] && [ ! -x "$script" ]; then
        report_issue "$script is not executable"
        chmod +x "$script"
        apply_fix "Made $script executable"
    fi
done

# 10. Fix common code issues
echo -e "${BLUE}🔍 Checking for common code issues...${NC}"

# Remove console.log from production builds (optional)
if [ "$1" == "--remove-logs" ]; then
    echo "Removing console.log statements..."
    find packages/ui/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i.bak '/console\.log/d' {} \;
    find packages/ui/src -type f -name "*.bak" -delete
    apply_fix "Removed console.log statements"
fi

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}           DEBUG SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ $FIXES_APPLIED -eq 0 ]; then
    echo -e "${GREEN}✅ No issues found${NC}"
    echo -e "${GREEN}🎉 System is healthy${NC}"
else
    echo -e "${GREEN}✅ Applied $FIXES_APPLIED fix(es)${NC}"
    echo -e "${BLUE}💡 Run 'npm run auto-check' to verify${NC}"
fi

echo ""
echo -e "${BLUE}📚 Additional debugging options:${NC}"
echo -e "  ${YELLOW}--remove-logs${NC}  Remove all console.log statements"
echo -e "  ${YELLOW}--clean-all${NC}    Clean all build artifacts and node_modules"
echo ""

# Clean all option
if [ "$1" == "--clean-all" ]; then
    echo -e "${YELLOW}🧹 Deep cleaning...${NC}"
    rm -rf node_modules packages/*/node_modules packages/*/dist
    echo -e "${GREEN}✅ Cleaned all build artifacts${NC}"
    echo -e "${BLUE}💡 Run 'npm install' to reinstall dependencies${NC}"
fi

exit 0
