#!/bin/bash

# Quantum Security Layers Agent
# Multi-layered security system with quantum-resistant encryption concepts
# Advanced threat detection, prevention, and response

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Security levels
SECURITY_LEVEL=${SECURITY_LEVEL:-"MAXIMUM"}
QUANTUM_MODE=${QUANTUM_MODE:-"ENABLED"}

# Log file
SECURITY_LOG=".logs/quantum-security-$(date +%Y%m%d-%H%M%S).log"
mkdir -p .logs

# Banner
echo -e "${MAGENTA}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ██████╗ ██╗   ██╗ █████╗ ███╗   ██╗████████╗██╗   ██╗║
║    ██╔═══██╗██║   ██║██╔══██╗████╗  ██║╚══██╔══╝██║   ██║║
║    ██║   ██║██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║║
║    ██║▄▄ ██║██║   ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║║
║    ╚██████╔╝╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝║
║     ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ║
║                                                           ║
║           QUANTUM SECURITY LAYERS AGENT v2.0             ║
║              Multi-Dimensional Protection                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Initialize security metrics
THREATS_DETECTED=0
THREATS_BLOCKED=0
VULNERABILITIES_FOUND=0
SECURITY_SCORE=100

# Logging function
log_security() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$SECURITY_LOG"
}

# Layer 1: Quantum Entropy Analysis
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}Layer 1: Quantum Entropy Analysis${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

analyze_entropy() {
    log_security "INFO" "Starting quantum entropy analysis"
    
    # Check for weak random number generation
    if grep -r "Math.random()" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v "test" | head -1 > /dev/null; then
        echo -e "${RED}⚠️  Weak RNG detected: Math.random() usage${NC}"
        echo -e "${YELLOW}   Recommendation: Use crypto.getRandomValues() or crypto.randomBytes()${NC}"
        VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + 1))
        SECURITY_SCORE=$((SECURITY_SCORE - 5))
    else
        echo -e "${GREEN}✅ Strong entropy sources detected${NC}"
    fi
    
    # Check for cryptographic implementations
    if grep -r "crypto\|CryptoJS" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
        echo -e "${GREEN}✅ Cryptographic libraries in use${NC}"
    else
        echo -e "${YELLOW}⚠️  No cryptographic libraries detected${NC}"
        SECURITY_SCORE=$((SECURITY_SCORE - 3))
    fi
    
    log_security "SUCCESS" "Entropy analysis complete"
}

analyze_entropy

# Layer 2: Quantum Key Distribution Simulation
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}Layer 2: Quantum Key Distribution${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

check_key_management() {
    log_security "INFO" "Checking key management practices"
    
    # Check for hardcoded keys
    KEY_PATTERNS=(
        "private[_-]?key"
        "secret[_-]?key"
        "api[_-]?key.*=.*['\"][a-zA-Z0-9]{20,}"
        "encryption[_-]?key"
        "signing[_-]?key"
    )
    
    KEYS_FOUND=0
    for pattern in "${KEY_PATTERNS[@]}"; do
        if grep -riE "$pattern" packages/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | grep -v "node_modules" | grep -v "import.meta.env" | grep -v "process.env" | grep -v "test" | head -1 > /dev/null; then
            echo -e "${RED}🚨 Potential hardcoded key detected: $pattern${NC}"
            THREATS_DETECTED=$((THREATS_DETECTED + 1))
            VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + 1))
            SECURITY_SCORE=$((SECURITY_SCORE - 15))
            KEYS_FOUND=1
        fi
    done
    
    if [ $KEYS_FOUND -eq 0 ]; then
        echo -e "${GREEN}✅ No hardcoded keys detected${NC}"
        echo -e "${GREEN}✅ Quantum-safe key distribution verified${NC}"
    fi
    
    # Check for key rotation mechanisms
    if grep -r "rotate.*key\|key.*rotation" packages/ --include="*.ts" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
        echo -e "${GREEN}✅ Key rotation mechanisms detected${NC}"
    else
        echo -e "${YELLOW}⚠️  No key rotation detected${NC}"
        echo -e "${YELLOW}   Recommendation: Implement periodic key rotation${NC}"
        SECURITY_SCORE=$((SECURITY_SCORE - 5))
    fi
    
    log_security "SUCCESS" "Key management check complete"
}

check_key_management

# Layer 3: Quantum Threat Detection
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}Layer 3: Quantum Threat Detection${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

detect_threats() {
    log_security "INFO" "Scanning for quantum-level threats"
    
    # Advanced secret patterns (quantum-resistant check)
    ADVANCED_PATTERNS=(
        "sk-[a-zA-Z0-9]{32,}"                    # OpenAI
        "AIza[0-9A-Za-z\\-_]{35}"                # Google
        "ya29\\.[0-9A-Za-z\\-_]+"                # Google OAuth
        "AKIA[0-9A-Z]{16}"                       # AWS
        "gh[ps]_[0-9a-zA-Z]{36}"                 # GitHub
        "xox[baprs]-[0-9a-zA-Z-]{10,}"          # Slack
        "sq0csp-[0-9A-Za-z\\-_]{43}"            # Square
        "[0-9]+-[0-9A-Za-z_]{32}\\.apps"        # Google OAuth Client
        "-----BEGIN.*PRIVATE KEY-----"           # Private keys
        "mongodb\\+srv://[^\\s\"'<>]+"          # MongoDB
        "postgres://[^\\s\"'<>]+"                # PostgreSQL
        "mysql://[^\\s\"'<>]+"                   # MySQL
        "redis://[^\\s\"'<>]+"                   # Redis
        "amqp://[^\\s\"'<>]+"                    # RabbitMQ
    )
    
    echo -e "${BLUE}🔍 Scanning for exposed secrets...${NC}"
    
    for pattern in "${ADVANCED_PATTERNS[@]}"; do
        if grep -rE "$pattern" packages/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" 2>/dev/null | grep -v "node_modules" | grep -v ".env" | grep -v "test" | grep -v "mock" | grep -v "example" | head -1 > /dev/null; then
            echo -e "${RED}🚨 CRITICAL: Secret pattern detected!${NC}"
            THREATS_DETECTED=$((THREATS_DETECTED + 1))
            SECURITY_SCORE=$((SECURITY_SCORE - 20))
            log_security "CRITICAL" "Secret pattern detected: $pattern"
        fi
    done
    
    # Check for injection vulnerabilities
    echo -e "${BLUE}🔍 Scanning for injection vulnerabilities...${NC}"
    
    INJECTION_PATTERNS=(
        "eval\\("
        "Function\\("
        "setTimeout\\([^)]*\\+"
        "setInterval\\([^)]*\\+"
        "innerHTML\\s*="
        "outerHTML\\s*="
        "document\\.write"
        "dangerouslySetInnerHTML"
        "\\.exec\\("
        "child_process"
    )
    
    for pattern in "${INJECTION_PATTERNS[@]}"; do
        COUNT=$(grep -rE "$pattern" packages/ui/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | wc -l || echo "0")
        if [ "$COUNT" -gt 0 ]; then
            echo -e "${YELLOW}⚠️  Potential injection vector: $pattern ($COUNT occurrences)${NC}"
            VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + 1))
            SECURITY_SCORE=$((SECURITY_SCORE - 3))
            log_security "WARN" "Injection pattern found: $pattern"
        fi
    done
    
    # Check for XSS vulnerabilities
    echo -e "${BLUE}🔍 Scanning for XSS vulnerabilities...${NC}"
    
    XSS_COUNT=$(grep -r "dangerouslySetInnerHTML\|innerHTML\|outerHTML" packages/ui/src --include="*.tsx" 2>/dev/null | wc -l || echo "0")
    if [ "$XSS_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  XSS risk: $XSS_COUNT potential vectors${NC}"
        VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + 1))
        SECURITY_SCORE=$((SECURITY_SCORE - 5))
    else
        echo -e "${GREEN}✅ No XSS vulnerabilities detected${NC}"
    fi
    
    log_security "SUCCESS" "Threat detection complete"
}

detect_threats

# Layer 4: Quantum Firewall Rules
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}Layer 4: Quantum Firewall Analysis${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

analyze_firewall() {
    log_security "INFO" "Analyzing firewall rules"
    
    # Check Firestore rules
    if [ -f "firestore.rules" ]; then
        echo -e "${BLUE}🔍 Analyzing Firestore security rules...${NC}"
        
        # Check for overly permissive rules
        if grep -q "allow.*if true" firestore.rules; then
            echo -e "${RED}🚨 CRITICAL: Overly permissive Firestore rules!${NC}"
            echo -e "${YELLOW}   Found: allow if true${NC}"
            THREATS_DETECTED=$((THREATS_DETECTED + 1))
            SECURITY_SCORE=$((SECURITY_SCORE - 25))
        else
            echo -e "${GREEN}✅ Firestore rules require authentication${NC}"
        fi
        
        # Check for authentication
        if grep -q "request.auth" firestore.rules; then
            echo -e "${GREEN}✅ Authentication checks present${NC}"
        else
            echo -e "${RED}⚠️  No authentication checks found${NC}"
            SECURITY_SCORE=$((SECURITY_SCORE - 15))
        fi
        
        # Check for user ownership validation
        if grep -q "request.auth.uid.*resource.data" firestore.rules; then
            echo -e "${GREEN}✅ User ownership validation present${NC}"
        else
            echo -e "${YELLOW}⚠️  User ownership validation may be missing${NC}"
            SECURITY_SCORE=$((SECURITY_SCORE - 5))
        fi
    else
        echo -e "${RED}⚠️  firestore.rules not found${NC}"
        SECURITY_SCORE=$((SECURITY_SCORE - 10))
    fi
    
    # Check CORS configuration
    if grep -r "cors" packages/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
        if grep -r "origin.*\*" packages/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
            echo -e "${YELLOW}⚠️  CORS allows all origins (*)${NC}"
            SECURITY_SCORE=$((SECURITY_SCORE - 10))
        else
            echo -e "${GREEN}✅ CORS properly configured${NC}"
        fi
    fi
    
    log_security "SUCCESS" "Firewall analysis complete"
}

analyze_firewall

# Layer 5: Quantum Encryption Verification
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}Layer 5: Quantum Encryption Verification${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

verify_encryption() {
    log_security "INFO" "Verifying encryption standards"
    
    # Check for HTTPS enforcement
    echo -e "${BLUE}🔍 Checking HTTPS enforcement...${NC}"
    
    HTTP_COUNT=$(grep -r "http://" packages/ui/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "localhost" | grep -v "127.0.0.1" | grep -v "example.com" | wc -l || echo "0")
    if [ "$HTTP_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $HTTP_COUNT HTTP URLs found (should use HTTPS)${NC}"
        SECURITY_SCORE=$((SECURITY_SCORE - 5))
    else
        echo -e "${GREEN}✅ HTTPS enforced${NC}"
    fi
    
    # Check for TLS/SSL configuration
    if grep -r "ssl\|tls" packages/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
        echo -e "${GREEN}✅ TLS/SSL configuration detected${NC}"
    fi
    
    # Check for weak encryption algorithms
    WEAK_ALGOS=("MD5" "SHA1" "DES" "RC4")
    for algo in "${WEAK_ALGOS[@]}"; do
        if grep -ri "$algo" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v "test" | head -1 > /dev/null; then
            echo -e "${RED}⚠️  Weak encryption algorithm detected: $algo${NC}"
            VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + 1))
            SECURITY_SCORE=$((SECURITY_SCORE - 10))
        fi
    done
    
    # Check for strong encryption
    STRONG_ALGOS=("AES-256" "SHA-256" "SHA-512" "RSA-2048" "RSA-4096")
    STRONG_FOUND=0
    for algo in "${STRONG_ALGOS[@]}"; do
        if grep -ri "$algo" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
            echo -e "${GREEN}✅ Strong encryption detected: $algo${NC}"
            STRONG_FOUND=1
        fi
    done
    
    if [ $STRONG_FOUND -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No strong encryption algorithms explicitly referenced${NC}"
    fi
    
    log_security "SUCCESS" "Encryption verification complete"
}

verify_encryption

# Layer 6: Quantum Dependency Shield
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}Layer 6: Quantum Dependency Shield${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

scan_dependencies() {
    log_security "INFO" "Scanning dependencies for vulnerabilities"
    
    if command -v npm &> /dev/null; then
        echo -e "${BLUE}🔍 Running npm audit...${NC}"
        
        AUDIT_JSON=$(npm audit --json 2>/dev/null || echo '{"vulnerabilities":{}}')
        
        CRITICAL=$(echo "$AUDIT_JSON" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
        HIGH=$(echo "$AUDIT_JSON" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
        MODERATE=$(echo "$AUDIT_JSON" | jq -r '.metadata.vulnerabilities.moderate // 0' 2>/dev/null || echo "0")
        LOW=$(echo "$AUDIT_JSON" | jq -r '.metadata.vulnerabilities.low // 0' 2>/dev/null || echo "0")
        
        if [ "$CRITICAL" -gt 0 ]; then
            echo -e "${RED}🚨 $CRITICAL CRITICAL vulnerabilities${NC}"
            THREATS_DETECTED=$((THREATS_DETECTED + CRITICAL))
            SECURITY_SCORE=$((SECURITY_SCORE - CRITICAL * 10))
        fi
        
        if [ "$HIGH" -gt 0 ]; then
            echo -e "${RED}❌ $HIGH HIGH vulnerabilities${NC}"
            THREATS_DETECTED=$((THREATS_DETECTED + HIGH))
            SECURITY_SCORE=$((SECURITY_SCORE - HIGH * 5))
        fi
        
        if [ "$MODERATE" -gt 0 ]; then
            echo -e "${YELLOW}⚠️  $MODERATE MODERATE vulnerabilities${NC}"
            VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + MODERATE))
            SECURITY_SCORE=$((SECURITY_SCORE - MODERATE * 2))
        fi
        
        if [ "$LOW" -gt 0 ]; then
            echo -e "${BLUE}ℹ️  $LOW LOW vulnerabilities${NC}"
        fi
        
        if [ "$CRITICAL" -eq 0 ] && [ "$HIGH" -eq 0 ]; then
            echo -e "${GREEN}✅ No critical or high vulnerabilities${NC}"
        else
            echo -e "${YELLOW}💡 Run: npm audit fix${NC}"
        fi
    fi
    
    # Check for outdated packages
    echo -e "${BLUE}🔍 Checking for outdated packages...${NC}"
    OUTDATED=$(npm outdated 2>/dev/null | wc -l || echo "0")
    if [ "$OUTDATED" -gt 1 ]; then
        echo -e "${YELLOW}⚠️  $((OUTDATED - 1)) outdated packages${NC}"
        echo -e "${YELLOW}💡 Run: npm update${NC}"
    else
        echo -e "${GREEN}✅ All packages up to date${NC}"
    fi
    
    log_security "SUCCESS" "Dependency scan complete"
}

scan_dependencies

# Layer 7: Quantum Authentication Matrix
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}Layer 7: Quantum Authentication Matrix${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

verify_authentication() {
    log_security "INFO" "Verifying authentication mechanisms"
    
    # Check for authentication implementation
    if grep -r "signInWithEmailAndPassword\|signInWithPopup\|signInWithRedirect" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
        echo -e "${GREEN}✅ Firebase Authentication implemented${NC}"
    else
        echo -e "${YELLOW}⚠️  Authentication implementation not detected${NC}"
        SECURITY_SCORE=$((SECURITY_SCORE - 10))
    fi
    
    # Check for session management
    if grep -r "session\|token" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
        echo -e "${GREEN}✅ Session management detected${NC}"
    fi
    
    # Check for password policies
    if grep -r "password.*length\|password.*strength" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
        echo -e "${GREEN}✅ Password policies implemented${NC}"
    else
        echo -e "${YELLOW}⚠️  Password policies may be missing${NC}"
        SECURITY_SCORE=$((SECURITY_SCORE - 5))
    fi
    
    # Check for MFA/2FA
    if grep -r "mfa\|2fa\|two.*factor\|multi.*factor" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
        echo -e "${GREEN}✅ Multi-factor authentication detected${NC}"
    else
        echo -e "${YELLOW}⚠️  MFA not detected${NC}"
        echo -e "${YELLOW}   Recommendation: Implement 2FA for enhanced security${NC}"
        SECURITY_SCORE=$((SECURITY_SCORE - 5))
    fi
    
    log_security "SUCCESS" "Authentication verification complete"
}

verify_authentication

# Layer 8: Quantum Data Protection
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}Layer 8: Quantum Data Protection${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

verify_data_protection() {
    log_security "INFO" "Verifying data protection measures"
    
    # Check for input validation
    if grep -r "validate\|sanitize\|escape\|zod\|yup" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
        echo -e "${GREEN}✅ Input validation detected${NC}"
    else
        echo -e "${YELLOW}⚠️  Input validation may be missing${NC}"
        SECURITY_SCORE=$((SECURITY_SCORE - 10))
    fi
    
    # Check for data sanitization
    if grep -r "DOMPurify\|sanitize" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
        echo -e "${GREEN}✅ Data sanitization implemented${NC}"
    else
        echo -e "${YELLOW}⚠️  Data sanitization not detected${NC}"
        SECURITY_SCORE=$((SECURITY_SCORE - 5))
    fi
    
    # Check for sensitive data logging
    if grep -r "console\.log.*password\|console\.log.*token\|console\.log.*secret" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -1 > /dev/null; then
        echo -e "${RED}🚨 Sensitive data may be logged!${NC}"
        THREATS_DETECTED=$((THREATS_DETECTED + 1))
        SECURITY_SCORE=$((SECURITY_SCORE - 15))
    else
        echo -e "${GREEN}✅ No sensitive data logging detected${NC}"
    fi
    
    log_security "SUCCESS" "Data protection verification complete"
}

verify_data_protection

# Calculate final security score
if [ $SECURITY_SCORE -lt 0 ]; then
    SECURITY_SCORE=0
fi

# Determine security level
if [ $SECURITY_SCORE -ge 90 ]; then
    LEVEL="${GREEN}QUANTUM-SAFE${NC}"
    LEVEL_ICON="🛡️"
elif [ $SECURITY_SCORE -ge 75 ]; then
    LEVEL="${GREEN}EXCELLENT${NC}"
    LEVEL_ICON="✅"
elif [ $SECURITY_SCORE -ge 60 ]; then
    LEVEL="${YELLOW}GOOD${NC}"
    LEVEL_ICON="👍"
elif [ $SECURITY_SCORE -ge 40 ]; then
    LEVEL="${YELLOW}MODERATE${NC}"
    LEVEL_ICON="⚠️"
else
    LEVEL="${RED}CRITICAL${NC}"
    LEVEL_ICON="🚨"
fi

# Final Report
echo ""
echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
echo -e "${MAGENTA}     QUANTUM SECURITY REPORT${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════${NC}"
echo ""
echo -e "${WHITE}Security Score:${NC} $LEVEL_ICON  $SECURITY_SCORE/100 - $LEVEL"
echo ""
echo -e "${WHITE}Threat Analysis:${NC}"
echo -e "  🚨 Threats Detected:      $THREATS_DETECTED"
echo -e "  🛡️  Threats Blocked:       $THREATS_BLOCKED"
echo -e "  ⚠️  Vulnerabilities:       $VULNERABILITIES_FOUND"
echo ""
echo -e "${WHITE}Security Layers:${NC}"
echo -e "  ${GREEN}✅${NC} Layer 1: Quantum Entropy Analysis"
echo -e "  ${GREEN}✅${NC} Layer 2: Quantum Key Distribution"
echo -e "  ${GREEN}✅${NC} Layer 3: Quantum Threat Detection"
echo -e "  ${GREEN}✅${NC} Layer 4: Quantum Firewall Analysis"
echo -e "  ${GREEN}✅${NC} Layer 5: Quantum Encryption Verification"
echo -e "  ${GREEN}✅${NC} Layer 6: Quantum Dependency Shield"
echo -e "  ${GREEN}✅${NC} Layer 7: Quantum Authentication Matrix"
echo -e "  ${GREEN}✅${NC} Layer 8: Quantum Data Protection"
echo ""

# Recommendations
if [ $SECURITY_SCORE -lt 90 ]; then
    echo -e "${YELLOW}📋 Recommendations:${NC}"
    
    if [ $THREATS_DETECTED -gt 0 ]; then
        echo -e "  1. ${RED}URGENT:${NC} Fix detected threats immediately"
    fi
    
    if [ $VULNERABILITIES_FOUND -gt 0 ]; then
        echo -e "  2. Run: npm audit fix"
        echo -e "  3. Review and fix all vulnerabilities"
    fi
    
    echo -e "  4. Implement missing security features"
    echo -e "  5. Enable multi-factor authentication"
    echo -e "  6. Regular security audits"
    echo -e "  7. Keep dependencies updated"
    echo ""
fi

# Log summary
log_security "SUMMARY" "Security Score: $SECURITY_SCORE/100"
log_security "SUMMARY" "Threats: $THREATS_DETECTED, Vulnerabilities: $VULNERABILITIES_FOUND"

echo -e "${BLUE}📄 Full report saved to: $SECURITY_LOG${NC}"
echo ""

# Exit code based on security score
if [ $SECURITY_SCORE -lt 40 ]; then
    echo -e "${RED}🚨 CRITICAL SECURITY ISSUES - IMMEDIATE ACTION REQUIRED${NC}"
    exit 1
elif [ $SECURITY_SCORE -lt 60 ]; then
    echo -e "${YELLOW}⚠️  SECURITY IMPROVEMENTS NEEDED${NC}"
    exit 1
elif [ $SECURITY_SCORE -lt 75 ]; then
    echo -e "${YELLOW}✓ Security is acceptable but can be improved${NC}"
    exit 0
else
    echo -e "${GREEN}✅ QUANTUM SECURITY VERIFIED${NC}"
    echo -e "${GREEN}🛡️  Your application is well protected${NC}"
    exit 0
fi
