#!/bin/bash

# Production Deployment Script for Student-Company Matching Platform
# This script handles the complete deployment process with zero-downtime

set -e  # Exit on any error

# Configuration
APP_NAME="student-matching-platform"
DOCKER_IMAGE="ghcr.io/your-org/${APP_NAME}"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/opt/backups"
LOG_FILE="/var/log/${APP_NAME}-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if user is in docker group
    if ! groups $USER | grep &> /dev/null '\bdocker\b'; then
        error "User $USER is not in the docker group"
    fi
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="${BACKUP_DIR}/${APP_NAME}_${TIMESTAMP}"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup database
    log "Backing up database..."
    docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U postgres student_matching_platform > "${BACKUP_PATH}/database.sql"
    
    # Backup uploaded files
    if [ -d "./uploads" ]; then
        log "Backing up uploaded files..."
        cp -r ./uploads "${BACKUP_PATH}/"
    fi
    
    # Backup configuration
    log "Backing up configuration..."
    cp .env "${BACKUP_PATH}/" 2>/dev/null || true
    cp "$COMPOSE_FILE" "${BACKUP_PATH}/"
    
    # Compress backup
    tar -czf "${BACKUP_PATH}.tar.gz" -C "$BACKUP_DIR" "${APP_NAME}_${TIMESTAMP}"
    rm -rf "$BACKUP_PATH"
    
    success "Backup created: ${BACKUP_PATH}.tar.gz"
}

# Pull latest images
pull_images() {
    log "Pulling latest Docker images..."
    
    # Get the latest tag or use provided tag
    TAG=${1:-latest}
    
    docker pull "${DOCKER_IMAGE}:${TAG}"
    
    success "Images pulled successfully"
}

# Health check function
health_check() {
    local service_url=$1
    local max_attempts=30
    local attempt=1
    
    log "Performing health check on $service_url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$service_url/health" > /dev/null; then
            success "Health check passed"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
}

# Deploy application
deploy() {
    local tag=${1:-latest}
    
    log "Starting deployment with tag: $tag"
    
    # Update image tag in compose file
    sed -i "s|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${tag}|g" "$COMPOSE_FILE"
    
    # Pull new images
    pull_images "$tag"
    
    # Start new containers
    log "Starting new containers..."
    docker-compose -f "$COMPOSE_FILE" up -d --no-deps --scale api=2 api
    
    # Wait for new containers to be healthy
    sleep 30
    health_check "http://localhost:3000/api/v1"
    
    # Stop old containers
    log "Stopping old containers..."
    docker-compose -f "$COMPOSE_FILE" up -d --no-deps --scale api=1 api
    
    # Update other services
    log "Updating other services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    success "Deployment completed successfully"
}

# Rollback function
rollback() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        error "Backup file not specified for rollback"
    fi
    
    if [ ! -f "$backup_file" ]; then
        error "Backup file not found: $backup_file"
    fi
    
    warning "Starting rollback process..."
    
    # Extract backup
    TEMP_DIR=$(mktemp -d)
    tar -xzf "$backup_file" -C "$TEMP_DIR"
    BACKUP_NAME=$(basename "$backup_file" .tar.gz)
    
    # Stop current services
    log "Stopping current services..."
    docker-compose -f "$COMPOSE_FILE" down
    
    # Restore database
    log "Restoring database..."
    docker-compose -f "$COMPOSE_FILE" up -d postgres
    sleep 10
    docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS student_matching_platform;"
    docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres -c "CREATE DATABASE student_matching_platform;"
    docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres student_matching_platform < "${TEMP_DIR}/${BACKUP_NAME}/database.sql"
    
    # Restore files
    if [ -d "${TEMP_DIR}/${BACKUP_NAME}/uploads" ]; then
        log "Restoring uploaded files..."
        rm -rf ./uploads
        cp -r "${TEMP_DIR}/${BACKUP_NAME}/uploads" ./
    fi
    
    # Restore configuration
    if [ -f "${TEMP_DIR}/${BACKUP_NAME}/.env" ]; then
        log "Restoring configuration..."
        cp "${TEMP_DIR}/${BACKUP_NAME}/.env" ./
    fi
    
    # Start services with previous version
    log "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Cleanup
    rm -rf "$TEMP_DIR"
    
    success "Rollback completed successfully"
}

# Cleanup old backups (keep last 10)
cleanup_backups() {
    log "Cleaning up old backups..."
    
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "${APP_NAME}_*.tar.gz" -type f | sort -r | tail -n +11 | xargs rm -f
        success "Old backups cleaned up"
    fi
}

# Main deployment process
main() {
    local command=${1:-deploy}
    local tag=${2:-latest}
    
    log "Starting deployment script for $APP_NAME"
    
    case $command in
        "deploy")
            check_root
            check_prerequisites
            create_backup
            deploy "$tag"
            cleanup_backups
            success "Deployment process completed successfully!"
            ;;
        "rollback")
            check_root
            check_prerequisites
            rollback "$tag"
            success "Rollback process completed successfully!"
            ;;
        "backup")
            check_root
            check_prerequisites
            create_backup
            success "Backup process completed successfully!"
            ;;
        "health")
            health_check "http://localhost:3000/api/v1"
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|backup|health} [tag|backup_file]"
            echo ""
            echo "Commands:"
            echo "  deploy [tag]     - Deploy application with specified tag (default: latest)"
            echo "  rollback <file>  - Rollback to specified backup file"
            echo "  backup          - Create backup only"
            echo "  health          - Perform health check"
            echo ""
            echo "Examples:"
            echo "  $0 deploy v1.2.3"
            echo "  $0 rollback /opt/backups/student-matching-platform_20240108_143022.tar.gz"
            echo "  $0 backup"
            echo "  $0 health"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"