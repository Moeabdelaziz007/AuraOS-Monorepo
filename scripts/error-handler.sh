#!/bin/bash

# Error Handler and Logger
# Provides comprehensive error handling and logging for all scripts

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Log directory
LOG_DIR=".logs"
mkdir -p "$LOG_DIR"

# Log file with timestamp
LOG_FILE="$LOG_DIR/auraos-$(date +%Y%m%d-%H%M%S).log"
ERROR_LOG="$LOG_DIR/errors.log"

# Function to log messages
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case $level in
        ERROR)
            echo "[$timestamp] [$level] $message" >> "$ERROR_LOG"
            echo -e "${RED}❌ ERROR: $message${NC}"
            ;;
        WARN)
            echo -e "${YELLOW}⚠️  WARNING: $message${NC}"
            ;;
        INFO)
            echo -e "${BLUE}ℹ️  INFO: $message${NC}"
            ;;
        SUCCESS)
            echo -e "${GREEN}✅ SUCCESS: $message${NC}"
            ;;
        DEBUG)
            if [ "${DEBUG:-0}" = "1" ]; then
                echo -e "${CYAN}🔍 DEBUG: $message${NC}"
            fi
            ;;
    esac
}

# Function to handle errors
handle_error() {
    local exit_code=$1
    local line_number=$2
    local command="$3"
    
    log ERROR "Command failed with exit code $exit_code at line $line_number"
    log ERROR "Failed command: $command"
    
    # Get stack trace
    local frame=0
    while caller $frame >> "$ERROR_LOG" 2>&1; do
        ((frame++))
    done
    
    # Suggest fixes based on error code
    case $exit_code in
        1)
            log WARN "General error. Check the command output above."
            ;;
        2)
            log WARN "Misuse of shell command. Check command syntax."
            ;;
        126)
            log WARN "Command cannot execute. Check file permissions."
            log INFO "Try: chmod +x <file>"
            ;;
        127)
            log WARN "Command not found. Check if the command is installed."
            ;;
        130)
            log WARN "Script terminated by Ctrl+C"
            ;;
        *)
            log WARN "Unknown error code: $exit_code"
            ;;
    esac
    
    # Show recent logs
    echo ""
    echo -e "${BLUE}Recent log entries:${NC}"
    tail -10 "$LOG_FILE"
    
    echo ""
    echo -e "${YELLOW}Full logs available at: $LOG_FILE${NC}"
    echo -e "${YELLOW}Error logs available at: $ERROR_LOG${NC}"
    
    return $exit_code
}

# Function to cleanup on exit
cleanup() {
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log SUCCESS "Script completed successfully"
    else
        log ERROR "Script exited with code $exit_code"
    fi
    
    # Keep only last 10 log files
    ls -t "$LOG_DIR"/auraos-*.log 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    
    return $exit_code
}

# Function to check prerequisites
check_prerequisites() {
    local missing=0
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log ERROR "Node.js is not installed"
        log INFO "Install from: https://nodejs.org/"
        missing=1
    else
        log DEBUG "Node.js version: $(node -v)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log ERROR "npm is not installed"
        missing=1
    else
        log DEBUG "npm version: $(npm -v)"
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        log ERROR "Git is not installed"
        log INFO "Install from: https://git-scm.com/"
        missing=1
    else
        log DEBUG "Git version: $(git --version)"
    fi
    
    if [ $missing -eq 1 ]; then
        log ERROR "Missing prerequisites. Please install required tools."
        return 1
    fi
    
    log SUCCESS "All prerequisites met"
    return 0
}

# Function to validate environment
validate_environment() {
    log INFO "Validating environment..."
    
    # Check if in project root
    if [ ! -f "package.json" ]; then
        log ERROR "Not in project root directory"
        log INFO "Run this script from the AuraOS-Monorepo directory"
        return 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log ERROR "Node.js version must be >= 18 (current: $NODE_VERSION)"
        return 1
    fi
    
    # Check for node_modules
    if [ ! -d "node_modules" ]; then
        log WARN "node_modules not found"
        log INFO "Run: npm install"
        return 1
    fi
    
    log SUCCESS "Environment validated"
    return 0
}

# Function to retry command
retry_command() {
    local max_attempts=$1
    shift
    local command="$@"
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log INFO "Attempt $attempt/$max_attempts: $command"
        
        if eval "$command"; then
            log SUCCESS "Command succeeded on attempt $attempt"
            return 0
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            local wait_time=$((attempt * 2))
            log WARN "Command failed, retrying in ${wait_time}s..."
            sleep $wait_time
        fi
        
        ((attempt++))
    done
    
    log ERROR "Command failed after $max_attempts attempts"
    return 1
}

# Function to run with timeout
run_with_timeout() {
    local timeout=$1
    shift
    local command="$@"
    
    log INFO "Running with ${timeout}s timeout: $command"
    
    timeout "$timeout" bash -c "$command"
    local exit_code=$?
    
    if [ $exit_code -eq 124 ]; then
        log ERROR "Command timed out after ${timeout}s"
        return 124
    elif [ $exit_code -ne 0 ]; then
        log ERROR "Command failed with exit code $exit_code"
        return $exit_code
    fi
    
    log SUCCESS "Command completed successfully"
    return 0
}

# Function to backup file
backup_file() {
    local file=$1
    
    if [ ! -f "$file" ]; then
        log WARN "File not found: $file"
        return 1
    fi
    
    local backup_dir=".backups"
    mkdir -p "$backup_dir"
    
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_file="$backup_dir/$(basename $file).$timestamp.bak"
    
    cp "$file" "$backup_file"
    log SUCCESS "Backed up $file to $backup_file"
    
    # Keep only last 5 backups per file
    ls -t "$backup_dir"/$(basename $file).*.bak 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    
    return 0
}

# Function to restore backup
restore_backup() {
    local file=$1
    local backup_dir=".backups"
    
    # Find most recent backup
    local backup_file=$(ls -t "$backup_dir"/$(basename $file).*.bak 2>/dev/null | head -1)
    
    if [ -z "$backup_file" ]; then
        log ERROR "No backup found for $file"
        return 1
    fi
    
    cp "$backup_file" "$file"
    log SUCCESS "Restored $file from $backup_file"
    
    return 0
}

# Function to show help
show_error_help() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}        Error Handler Help${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo ""
    echo "Available functions:"
    echo "  log LEVEL MESSAGE          - Log a message"
    echo "  handle_error CODE LINE CMD - Handle an error"
    echo "  check_prerequisites        - Check required tools"
    echo "  validate_environment       - Validate project environment"
    echo "  retry_command N CMD        - Retry command N times"
    echo "  run_with_timeout SEC CMD   - Run command with timeout"
    echo "  backup_file FILE           - Backup a file"
    echo "  restore_backup FILE        - Restore latest backup"
    echo ""
    echo "Log levels: ERROR, WARN, INFO, SUCCESS, DEBUG"
    echo ""
    echo "Logs are stored in: $LOG_DIR/"
    echo "  - auraos-*.log: All logs"
    echo "  - errors.log: Error logs only"
    echo ""
}

# Export functions for use in other scripts
export -f log
export -f handle_error
export -f cleanup
export -f check_prerequisites
export -f validate_environment
export -f retry_command
export -f run_with_timeout
export -f backup_file
export -f restore_backup

# If script is run directly, show help
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    show_error_help
fi
