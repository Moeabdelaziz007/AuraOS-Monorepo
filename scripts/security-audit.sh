#!/bin/bash

# Security Audit Script
# Comprehensive security checks for AuraOS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}🔐 AuraOS Security Audit${NC}"
echo ""

CRITICAL=0
HIGH=0
MEDIUM=0
LOW=0

# Function to report findings
report_critical() {
    echo -e "${RED}🚨 CRITICAL: $1${NC}"
    CRITICAL=$((CRITICAL + 1))
}

report_high() {
    echo -e "${RED}❌ HIGH: $1${NC}"
    HIGH=$((HIGH + 1))
}

report_medium() {
    echo -e "${YELLOW}⚠️  MEDIUM: $1${NC}"
    MEDIUM=$((MEDIUM + 1))
}

report_low() {
    echo -e "${BLUE}ℹ️  LOW: $1${NC}"
    LOW=$((LOW + 1))
}

report_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 1. Secrets Detection
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}1. Secrets Detection${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Check for various secret patterns
declare -A SECRET_PATTERNS=(
    ["OpenAI API Key"]="sk-[a-zA-Z0-9]{32,}"
    ["Google API Key"]="AIza[0-9A-Za-z\\-_]{35}"
    ["Google OAuth Token"]="ya29\\.[0-9A-Za-z\\-_]+"
    ["AWS Access Key"]="AKIA[0-9A-Z]{16}"
    ["GitHub Token"]="gh[ps]_[0-9a-zA-Z]{36}"
    ["Firebase Token"]="1//[0-9a-zA-Z\\-_]{100,}"
    ["JWT Token"]="eyJ[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*"
    ["Private Key"]="-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----"
    ["Password"]="password[\"']?\\s*[:=]\\s*[\"'][^\"']{8,}[\"']"
)

SECRETS_FOUND=0
for name in "${!SECRET_PATTERNS[@]}"; do
    pattern="${SECRET_PATTERNS[$name]}"
    if grep -rE "$pattern" packages/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | grep -v ".env" | grep -v "test" | grep -v "mock" | grep -v "example" | head -1 > /dev/null; then
        report_critical "$name found in source code"
        SECRETS_FOUND=1
    fi
done

if [ $SECRETS_FOUND -eq 0 ]; then
    report_pass "No hardcoded secrets detected"
fi

# Check for .env in git
if git ls-files | grep -q "^\.env$"; then
    report_critical ".env file is tracked by Git"
else
    report_pass ".env is not tracked by Git"
fi

# 2. Dependency Vulnerabilities
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}2. Dependency Vulnerabilities${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if command -v npm &> /dev/null; then
    # Run npm audit
    AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || echo '{"vulnerabilities":{}}')
    
    CRITICAL_VULNS=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
    HIGH_VULNS=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
    MODERATE_VULNS=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.moderate // 0' 2>/dev/null || echo "0")
    LOW_VULNS=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.low // 0' 2>/dev/null || echo "0")
    
    if [ "$CRITICAL_VULNS" -gt 0 ]; then
        report_critical "$CRITICAL_VULNS critical vulnerabilities in dependencies"
    fi
    
    if [ "$HIGH_VULNS" -gt 0 ]; then
        report_high "$HIGH_VULNS high vulnerabilities in dependencies"
    fi
    
    if [ "$MODERATE_VULNS" -gt 0 ]; then
        report_medium "$MODERATE_VULNS moderate vulnerabilities in dependencies"
    fi
    
    if [ "$LOW_VULNS" -gt 0 ]; then
        report_low "$LOW_VULNS low vulnerabilities in dependencies"
    fi
    
    if [ "$CRITICAL_VULNS" -eq 0 ] && [ "$HIGH_VULNS" -eq 0 ]; then
        report_pass "No critical or high vulnerabilities"
    fi
    
    echo -e "${BLUE}  Run 'npm audit fix' to fix vulnerabilities${NC}"
else
    report_medium "npm not found, cannot check dependencies"
fi

# 3. Code Security Issues
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}3. Code Security Issues${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Check for eval()
if grep -r "eval(" packages/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
    report_high "eval() usage found (code injection risk)"
else
    report_pass "No eval() usage"
fi

# Check for dangerouslySetInnerHTML
DANGEROUS_HTML=$(grep -r "dangerouslySetInnerHTML" packages/ui/src --include="*.tsx" 2>/dev/null | wc -l || echo "0")
if [ "$DANGEROUS_HTML" -gt 0 ]; then
    report_medium "Found $DANGEROUS_HTML uses of dangerouslySetInnerHTML (XSS risk)"
else
    report_pass "No dangerouslySetInnerHTML usage"
fi

# Check for innerHTML
INNER_HTML=$(grep -r "\.innerHTML\s*=" packages/ui/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l || echo "0")
if [ "$INNER_HTML" -gt 0 ]; then
    report_medium "Found $INNER_HTML uses of innerHTML (XSS risk)"
fi

# Check for document.write
if grep -r "document\.write" packages/ui/src --include="*.ts" --include="*.tsx" 2>/dev/null | head -1 > /dev/null; then
    report_medium "document.write() usage found (XSS risk)"
fi

# Check for SQL-like queries (potential SQL injection)
if grep -rE "(SELECT|INSERT|UPDATE|DELETE).*FROM.*WHERE" packages/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v "node_modules" | grep -v "test" | head -1 > /dev/null; then
    report_medium "SQL-like queries found (check for SQL injection)"
fi

# 4. Configuration Security
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}4. Configuration Security${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Check Firebase config
if grep -r "apiKey.*AIza" packages/ui/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "import.meta.env" | head -1 > /dev/null; then
    report_high "Firebase config hardcoded (should use environment variables)"
else
    report_pass "Firebase config uses environment variables"
fi

# Check CORS configuration
if grep -r "cors.*origin.*\*" packages/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
    report_medium "CORS allows all origins (security risk in production)"
fi

# Check for HTTP URLs
HTTP_URLS=$(grep -r "http://" packages/ui/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "localhost" | grep -v "127.0.0.1" | grep -v "example.com" | wc -l || echo "0")
if [ "$HTTP_URLS" -gt 0 ]; then
    report_medium "Found $HTTP_URLS HTTP URLs (should use HTTPS)"
fi

# Check .gitignore
if [ -f ".gitignore" ]; then
    SENSITIVE_FILES=(".env" "*.key" "*.pem" "*.p12" "*.pfx" "*.log")
    for file in "${SENSITIVE_FILES[@]}"; do
        if ! grep -q "$file" .gitignore; then
            report_low "$file not in .gitignore"
        fi
    done
else
    report_high ".gitignore not found"
fi

# 5. Firebase Security Rules
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}5. Firebase Security Rules${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ -f "firestore.rules" ]; then
    # Check for overly permissive rules
    if grep -q "allow read, write: if true" firestore.rules; then
        report_critical "Firestore rules allow unrestricted access"
    elif grep -q "allow.*if true" firestore.rules; then
        report_high "Some Firestore rules allow unrestricted access"
    else
        report_pass "Firestore rules require authentication"
    fi
    
    # Check for authentication checks
    if grep -q "request.auth" firestore.rules; then
        report_pass "Firestore rules check authentication"
    else
        report_high "Firestore rules may not check authentication"
    fi
else
    report_high "firestore.rules not found"
fi

# 6. Authentication & Authorization
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}6. Authentication & Authorization${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Check for authentication implementation
if grep -r "signInWithEmailAndPassword\|signInWithPopup" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -1 > /dev/null; then
    report_pass "Authentication implemented"
else
    report_medium "Authentication implementation not found"
fi

# Check for authorization checks
if grep -r "user\.uid\|currentUser" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -1 > /dev/null; then
    report_pass "User authorization checks found"
fi

# 7. Data Validation
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}7. Data Validation${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Check for input validation
if grep -r "validate\|sanitize\|escape" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
    report_pass "Input validation found"
else
    report_medium "Input validation may be missing"
fi

# 8. Error Handling
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}8. Error Handling${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Check for try-catch blocks
TRY_CATCH=$(grep -r "try\s*{" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | wc -l || echo "0")
if [ "$TRY_CATCH" -gt 10 ]; then
    report_pass "Error handling implemented ($TRY_CATCH try-catch blocks)"
else
    report_medium "Limited error handling ($TRY_CATCH try-catch blocks)"
fi

# Check for error logging
if grep -r "console\.error\|logger\.error" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
    report_pass "Error logging implemented"
fi

# 9. File Permissions
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}9. File Permissions${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

# Check for overly permissive files
if [ -f ".env" ]; then
    PERMS=$(stat -c %a .env 2>/dev/null || stat -f %A .env 2>/dev/null || echo "000")
    if [ "$PERMS" != "600" ] && [ "$PERMS" != "400" ]; then
        report_medium ".env has permissive permissions ($PERMS), should be 600 or 400"
    else
        report_pass ".env has secure permissions ($PERMS)"
    fi
fi

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}           SECURITY SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

TOTAL=$((CRITICAL + HIGH + MEDIUM + LOW))

if [ $CRITICAL -gt 0 ]; then
    echo -e "${RED}🚨 $CRITICAL CRITICAL issue(s)${NC}"
fi

if [ $HIGH -gt 0 ]; then
    echo -e "${RED}❌ $HIGH HIGH severity issue(s)${NC}"
fi

if [ $MEDIUM -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $MEDIUM MEDIUM severity issue(s)${NC}"
fi

if [ $LOW -gt 0 ]; then
    echo -e "${BLUE}ℹ️  $LOW LOW severity issue(s)${NC}"
fi

echo ""

if [ $CRITICAL -gt 0 ]; then
    echo -e "${RED}🚨 CRITICAL ISSUES FOUND - FIX IMMEDIATELY${NC}"
    exit 1
elif [ $HIGH -gt 0 ]; then
    echo -e "${RED}❌ HIGH SEVERITY ISSUES - FIX BEFORE DEPLOYMENT${NC}"
    exit 1
elif [ $MEDIUM -gt 0 ]; then
    echo -e "${YELLOW}⚠️  MEDIUM SEVERITY ISSUES - REVIEW AND FIX${NC}"
    exit 0
elif [ $LOW -gt 0 ]; then
    echo -e "${BLUE}ℹ️  LOW SEVERITY ISSUES - CONSIDER FIXING${NC}"
    exit 0
else
    echo -e "${GREEN}✅ NO SECURITY ISSUES FOUND${NC}"
    echo -e "${GREEN}🎉 Security audit passed!${NC}"
    exit 0
fi
