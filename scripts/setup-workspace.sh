#!/bin/bash

# Unified Workspace Setup Script
# Works with VS Code, IntelliJ IDEA, Cursor, and other IDEs

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 AuraOS Workspace Setup${NC}"
echo ""

# Function to report step
report_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

# Function to report success
report_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to report warning
report_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Check Node.js version
report_step "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be >= 18 (current: $NODE_VERSION)${NC}"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi
report_success "Node.js version: $(node -v)"

# 2. Check npm/pnpm
report_step "Checking package manager..."
if command -v pnpm &> /dev/null; then
    report_success "pnpm found: $(pnpm -v)"
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    report_success "npm found: $(npm -v)"
    PKG_MANAGER="npm"
else
    echo -e "${RED}❌ No package manager found${NC}"
    exit 1
fi

# 3. Install dependencies
report_step "Installing dependencies..."
if [ ! -d "node_modules" ]; then
    $PKG_MANAGER install
    report_success "Dependencies installed"
else
    report_warning "node_modules already exists, skipping install"
    echo "Run '$PKG_MANAGER install' manually if needed"
fi

# 4. Setup environment file
report_step "Setting up environment file..."
if [ ! -f ".env" ]; then
    if [ -f ".env.template" ]; then
        cp .env.template .env
        report_success "Created .env from template"
        echo -e "${YELLOW}⚠️  Please update .env with your actual values${NC}"
    else
        report_warning ".env.template not found"
    fi
else
    report_success ".env already exists"
fi

# 5. Setup Git hooks
report_step "Setting up Git hooks..."
if [ -d ".git" ]; then
    # Pre-commit hook
    if [ -f "scripts/pre-commit-hook.sh" ]; then
        cp scripts/pre-commit-hook.sh .git/hooks/pre-commit
        chmod +x .git/hooks/pre-commit
        report_success "Git pre-commit hook installed"
    else
        # Fallback to simple hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."
npm run auto-check
if [ $? -ne 0 ]; then
    echo "❌ Pre-commit checks failed. Fix errors before committing."
    echo "Use 'git commit --no-verify' to skip (not recommended)"
    exit 1
fi
EOF
        chmod +x .git/hooks/pre-commit
        report_success "Git pre-commit hook installed (basic)"
    fi
    
    # Pre-push hook
    cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
echo "Running pre-push security audit..."
if [ -f "scripts/security-audit.sh" ]; then
    ./scripts/security-audit.sh
    if [ $? -ne 0 ]; then
        echo "❌ Security audit failed. Fix issues before pushing."
        echo "Use 'git push --no-verify' to skip (not recommended)"
        exit 1
    fi
fi
EOF
    chmod +x .git/hooks/pre-push
    report_success "Git pre-push hook installed"
else
    report_warning "Not a Git repository, skipping hooks"
fi

# 6. Make scripts executable
report_step "Making scripts executable..."
chmod +x scripts/*.sh 2>/dev/null || true
report_success "Scripts are executable"

# 7. Detect IDE and provide specific instructions
report_step "Detecting IDE..."
IDE_DETECTED=false

if [ -d ".vscode" ] || command -v code &> /dev/null; then
    echo -e "${GREEN}✅ VS Code detected${NC}"
    echo "  - Extensions recommended in .vscode/extensions.json"
    echo "  - Settings configured in .vscode/settings.json"
    echo "  - Run: code ."
    IDE_DETECTED=true
fi

if [ -d ".idea" ] || command -v idea &> /dev/null; then
    echo -e "${GREEN}✅ IntelliJ IDEA detected${NC}"
    echo "  - See .idea/workspace-setup.md for configuration"
    echo "  - Install recommended plugins"
    IDE_DETECTED=true
fi

if command -v cursor &> /dev/null; then
    echo -e "${GREEN}✅ Cursor detected${NC}"
    echo "  - Uses VS Code configuration"
    echo "  - Run: cursor ."
    IDE_DETECTED=true
fi

if [ "$IDE_DETECTED" = false ]; then
    report_warning "No IDE detected, but workspace is configured for:"
    echo "  - VS Code / Cursor"
    echo "  - IntelliJ IDEA / WebStorm"
fi

# 8. Setup Firebase (if token provided)
report_step "Checking Firebase configuration..."
if [ -n "$FIREBASE_TOKEN" ]; then
    report_success "FIREBASE_TOKEN is set"
else
    report_warning "FIREBASE_TOKEN not set"
    echo "  To enable deployment, set FIREBASE_TOKEN:"
    echo "  1. Run: firebase login:ci"
    echo "  2. Copy the token"
    echo "  3. Add to .env: FIREBASE_TOKEN=your_token"
    echo "  4. Or export: export FIREBASE_TOKEN=your_token"
fi

# 9. Verify Firebase files
if [ -f "firebase.json" ] && [ -f ".firebaserc" ]; then
    report_success "Firebase configuration found"
else
    report_warning "Firebase configuration incomplete"
fi

# 10. Run initial checks
report_step "Running initial checks..."
if ./scripts/auto-check.sh; then
    report_success "All checks passed"
else
    report_warning "Some checks failed, run 'npm run auto-debug' to fix"
fi

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}        SETUP COMPLETE${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ Workspace is ready!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Update .env with your API keys"
echo "  2. Run: npm run dev:desktop"
echo "  3. Open: http://localhost:3000"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  npm run dev:desktop    - Start development server"
echo "  npm run build:desktop  - Build for production"
echo "  npm run auto-check     - Check for errors"
echo "  npm run auto-debug     - Fix common issues"
echo "  npm run auto-deploy    - Deploy to Firebase"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  - VS Code: .vscode/settings.json"
echo "  - IntelliJ: .idea/workspace-setup.md"
echo "  - Environment: .env.template"
echo "  - Automation: docs/AUTOMATION.md"
echo ""
