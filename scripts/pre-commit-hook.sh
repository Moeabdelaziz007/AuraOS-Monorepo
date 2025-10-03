#!/bin/bash

# Pre-commit Hook for Security and Quality Checks
# Prevents commits with security issues or errors

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Running pre-commit checks...${NC}"

ERRORS=0

# 1. Check for secrets in staged files
echo -e "${BLUE}Checking for secrets...${NC}"
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|json)$' || true)

if [ -n "$STAGED_FILES" ]; then
    SECRET_PATTERNS=(
        "sk-[a-zA-Z0-9]{32,}"
        "AIza[0-9A-Za-z\\-_]{35}"
        "ya29\\.[0-9A-Za-z\\-_]+"
        "AKIA[0-9A-Z]{16}"
        "gh[ps]_[0-9a-zA-Z]{36}"
        "1//[0-9a-zA-Z\\-_]{100,}"
        "-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----"
    )
    
    for file in $STAGED_FILES; do
        for pattern in "${SECRET_PATTERNS[@]}"; do
            if grep -qE "$pattern" "$file" 2>/dev/null; then
                echo -e "${RED}❌ Potential secret found in: $file${NC}"
                echo -e "${YELLOW}   Pattern: $pattern${NC}"
                ERRORS=$((ERRORS + 1))
                break
            fi
        done
    done
fi

# 2. Check if .env is being committed
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo -e "${RED}❌ Attempting to commit .env file${NC}"
    echo -e "${YELLOW}   .env should never be committed${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check for console.log in staged files
if [ -n "$STAGED_FILES" ]; then
    for file in $STAGED_FILES; do
        if echo "$file" | grep -qE 'packages/ui/src/.*\.(ts|tsx)$'; then
            LOG_COUNT=$(grep -c "console\.log" "$file" 2>/dev/null || echo "0")
            if [ "$LOG_COUNT" -gt 2 ]; then
                echo -e "${YELLOW}⚠️  Warning: $file has $LOG_COUNT console.log statements${NC}"
            fi
        fi
    done
fi

# 4. Check for debugger statements
if [ -n "$STAGED_FILES" ]; then
    for file in $STAGED_FILES; do
        if grep -q "debugger" "$file" 2>/dev/null; then
            echo -e "${RED}❌ debugger statement found in: $file${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    done
fi

# 5. Check for TODO/FIXME in critical files
if [ -n "$STAGED_FILES" ]; then
    for file in $STAGED_FILES; do
        if echo "$file" | grep -qE '(auth|security|payment|billing)'; then
            if grep -qE "TODO|FIXME" "$file" 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Warning: TODO/FIXME in critical file: $file${NC}"
            fi
        fi
    done
fi

# 6. Check TypeScript errors in staged files
if [ -n "$STAGED_FILES" ]; then
    TS_FILES=$(echo "$STAGED_FILES" | grep -E '\.(ts|tsx)$' || true)
    if [ -n "$TS_FILES" ]; then
        echo -e "${BLUE}Checking TypeScript...${NC}"
        if ! npx tsc --noEmit 2>&1 | head -20; then
            echo -e "${RED}❌ TypeScript errors found${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    fi
fi

# 7. Check for large files
LARGE_FILES=$(git diff --cached --name-only | while read file; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file" 2>/dev/null || echo "0")
        if [ "$size" -gt 1048576 ]; then  # 1MB
            echo "$file ($((size / 1024))KB)"
        fi
    fi
done)

if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  Warning: Large files being committed:${NC}"
    echo "$LARGE_FILES"
    echo -e "${YELLOW}   Consider using Git LFS for large files${NC}"
fi

# 8. Check for merge conflict markers
if [ -n "$STAGED_FILES" ]; then
    for file in $STAGED_FILES; do
        if grep -qE "^(<<<<<<<|=======|>>>>>>>)" "$file" 2>/dev/null; then
            echo -e "${RED}❌ Merge conflict markers found in: $file${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    done
fi

# 9. Check for hardcoded URLs
if [ -n "$STAGED_FILES" ]; then
    for file in $STAGED_FILES; do
        if grep -qE "http://[^localhost]" "$file" 2>/dev/null; then
            if ! grep -q "example.com\|test" "$file"; then
                echo -e "${YELLOW}⚠️  Warning: HTTP URL found in: $file${NC}"
                echo -e "${YELLOW}   Consider using HTTPS${NC}"
            fi
        fi
    done
fi

# 10. Run ESLint on staged files (if available)
if command -v eslint &> /dev/null && [ -n "$STAGED_FILES" ]; then
    JS_TS_FILES=$(echo "$STAGED_FILES" | grep -E '\.(js|jsx|ts|tsx)$' || true)
    if [ -n "$JS_TS_FILES" ]; then
        echo -e "${BLUE}Running ESLint...${NC}"
        if ! npx eslint $JS_TS_FILES 2>&1 | head -20; then
            echo -e "${YELLOW}⚠️  ESLint warnings found${NC}"
        fi
    fi
fi

# Summary
echo ""
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}═══════════════════════════════════════${NC}"
    echo -e "${RED}❌ Pre-commit checks failed: $ERRORS error(s)${NC}"
    echo -e "${RED}═══════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Fix the issues above and try again.${NC}"
    echo -e "${YELLOW}Or use 'git commit --no-verify' to skip checks (not recommended)${NC}"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ All pre-commit checks passed!${NC}"
    exit 0
fi
