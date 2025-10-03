#!/bin/bash

# Automated Error Checking and Debugging System
# Runs comprehensive checks before deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 AuraOS Automated Error Checking${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Function to report error
report_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Function to report warning
report_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# Function to report success
report_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 1. Check Node.js version
echo -e "${BLUE}📦 Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    report_error "Node.js version must be >= 18 (current: $NODE_VERSION)"
else
    report_success "Node.js version: $(node -v)"
fi

# 2. Check for required environment variables
echo -e "${BLUE}🔐 Checking environment variables...${NC}"
if [ -z "$FIREBASE_TOKEN" ]; then
    report_warning "FIREBASE_TOKEN not set (required for deployment)"
else
    report_success "FIREBASE_TOKEN is set"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    report_warning ".env file not found"
else
    report_success ".env file exists"
fi

# 3. Check package.json files
echo -e "${BLUE}📋 Checking package.json files...${NC}"
for pkg in packages/*/package.json; do
    if [ -f "$pkg" ]; then
        if ! jq empty "$pkg" 2>/dev/null; then
            report_error "Invalid JSON in $pkg"
        else
            report_success "Valid: $pkg"
        fi
    fi
done

# 4. Check for node_modules
echo -e "${BLUE}📚 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    report_error "node_modules not found. Run: npm install"
else
    report_success "node_modules exists"
fi

# 5. TypeScript type checking
echo -e "${BLUE}🔤 Running TypeScript type check...${NC}"
if command -v tsc &> /dev/null; then
    if npm run typecheck 2>&1 | grep -q "error TS"; then
        report_error "TypeScript errors found"
    else
        report_success "No TypeScript errors"
    fi
else
    report_warning "TypeScript not found, skipping type check"
fi

# 6. Check Firebase configuration
echo -e "${BLUE}🔥 Checking Firebase configuration...${NC}"
if [ ! -f "firebase.json" ]; then
    report_error "firebase.json not found"
else
    if ! jq empty firebase.json 2>/dev/null; then
        report_error "Invalid JSON in firebase.json"
    else
        report_success "firebase.json is valid"
        
        # Check hosting public directory
        PUBLIC_DIR=$(jq -r '.hosting.public' firebase.json)
        if [ ! -d "$PUBLIC_DIR" ]; then
            report_warning "Hosting directory '$PUBLIC_DIR' does not exist (will be created on build)"
        else
            report_success "Hosting directory exists: $PUBLIC_DIR"
        fi
    fi
fi

if [ ! -f ".firebaserc" ]; then
    report_error ".firebaserc not found"
else
    report_success ".firebaserc exists"
fi

if [ ! -f "firestore.rules" ]; then
    report_error "firestore.rules not found"
else
    report_success "firestore.rules exists"
fi

# 7. Check Git status
echo -e "${BLUE}📝 Checking Git status...${NC}"
if [ -d ".git" ]; then
    BRANCH=$(git branch --show-current)
    report_success "Current branch: $BRANCH"
    
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        report_warning "Uncommitted changes detected"
        git status -s | head -10
    else
        report_success "No uncommitted changes"
    fi
    
    # Check if branch is up to date
    git fetch origin "$BRANCH" 2>/dev/null || true
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
    if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
        report_warning "Branch is not up to date with remote"
    else
        report_success "Branch is up to date"
    fi
else
    report_error "Not a Git repository"
fi

# 8. Check build output
echo -e "${BLUE}🏗️  Checking build configuration...${NC}"
if [ -f "packages/ui/vite.config.ts" ]; then
    report_success "Vite config found"
else
    report_error "packages/ui/vite.config.ts not found"
fi

# 9. Check for common issues
echo -e "${BLUE}🔍 Checking for common issues...${NC}"

# Check for hardcoded secrets (comprehensive patterns)
SECRET_PATTERNS=(
    "sk-[a-zA-Z0-9]{32,}"           # OpenAI keys
    "AIza[0-9A-Za-z\\-_]{35}"       # Google API keys
    "ya29\\.[0-9A-Za-z\\-_]+"       # Google OAuth tokens
    "[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com"  # Google OAuth client
    "AKIA[0-9A-Z]{16}"              # AWS access key
    "[0-9a-zA-Z/+]{40}"             # AWS secret key pattern
    "ghp_[0-9a-zA-Z]{36}"           # GitHub personal access token
    "gho_[0-9a-zA-Z]{36}"           # GitHub OAuth token
    "mongodb\\+srv://[^\"'\\s]+"    # MongoDB connection string
    "postgres://[^\"'\\s]+"         # PostgreSQL connection string
    "mysql://[^\"'\\s]+"            # MySQL connection string
    "Bearer [a-zA-Z0-9\\-._~+/]+"   # Bearer tokens
    "password[\"']?\\s*[:=]\\s*[\"'][^\"']{8,}[\"']"  # Hardcoded passwords
)

SECRETS_FOUND=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -rE "$pattern" packages/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | grep -v ".env" | grep -v "test" | grep -v "mock" | head -1 > /dev/null; then
        SECRETS_FOUND=1
        break
    fi
done

if [ $SECRETS_FOUND -eq 1 ]; then
    report_error "Potential hardcoded secrets found"
    echo -e "${YELLOW}  Run: grep -rE 'sk-|AIza|AKIA' packages/ --include='*.ts' --include='*.tsx'${NC}"
else
    report_success "No hardcoded secrets detected"
fi

# Check for console.log in production code
LOG_COUNT=$(grep -r "console.log" packages/ui/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l || echo "0")
if [ "$LOG_COUNT" -gt 10 ]; then
    report_warning "Found $LOG_COUNT console.log statements (consider removing for production)"
else
    report_success "Console.log usage is acceptable"
fi

# Check for eval() usage (security risk)
if grep -r "eval(" packages/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
    report_error "eval() usage found (security risk)"
else
    report_success "No eval() usage detected"
fi

# Check for dangerouslySetInnerHTML
DANGEROUS_HTML=$(grep -r "dangerouslySetInnerHTML" packages/ui/src --include="*.tsx" 2>/dev/null | wc -l || echo "0")
if [ "$DANGEROUS_HTML" -gt 0 ]; then
    report_warning "Found $DANGEROUS_HTML uses of dangerouslySetInnerHTML (potential XSS risk)"
else
    report_success "No dangerouslySetInnerHTML usage"
fi

# Check for TODO/FIXME comments
TODO_COUNT=$(grep -r "TODO\|FIXME" packages/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | wc -l || echo "0")
if [ "$TODO_COUNT" -gt 0 ]; then
    report_warning "Found $TODO_COUNT TODO/FIXME comments"
fi

# 10. Security checks
echo -e "${BLUE}🔒 Running security checks...${NC}"

# Check for .env in git
if git ls-files | grep -q "^\.env$"; then
    report_error ".env file is tracked by Git (should be in .gitignore)"
else
    report_success ".env is not tracked by Git"
fi

# Check .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore; then
        report_success ".env is in .gitignore"
    else
        report_warning ".env not found in .gitignore"
    fi
    
    # Check for other sensitive files in .gitignore
    SENSITIVE_FILES=("*.key" "*.pem" "*.p12" "*.pfx" ".DS_Store" "*.log" "npm-debug.log*" "yarn-debug.log*" "yarn-error.log*")
    for file in "${SENSITIVE_FILES[@]}"; do
        if ! grep -q "$file" .gitignore; then
            report_warning "$file not in .gitignore"
        fi
    done
else
    report_error ".gitignore not found"
fi

# Check for exposed Firebase config
if grep -r "apiKey.*AIza" packages/ui/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "import.meta.env" | head -1 > /dev/null; then
    report_error "Firebase config may be hardcoded (should use environment variables)"
else
    report_success "Firebase config uses environment variables"
fi

# Check for weak dependencies (known vulnerabilities)
if command -v npm &> /dev/null; then
    echo -e "${BLUE}  Checking for vulnerable dependencies...${NC}"
    if npm audit --audit-level=high 2>&1 | grep -q "found.*vulnerabilities"; then
        report_warning "Vulnerable dependencies found (run: npm audit fix)"
    else
        report_success "No high-severity vulnerabilities"
    fi
fi

# Check CORS configuration
if grep -r "cors.*origin.*\*" packages/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
    report_warning "CORS configured to allow all origins (security risk in production)"
fi

# Check for HTTP URLs in production code
if grep -r "http://" packages/ui/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "localhost" | grep -v "127.0.0.1" | head -1 > /dev/null; then
    report_warning "HTTP URLs found (should use HTTPS in production)"
fi

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}           CHECK SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo -e "${GREEN}🚀 Ready to deploy${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo -e "${YELLOW}⚠️  Review warnings before deploying${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo -e "${RED}❌ Fix errors before deploying${NC}"
    exit 1
fi
