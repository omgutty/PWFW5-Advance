#!/usr/bin/env pwsh

# Playwright Framework - Commit and Push Script
# Usage: .\commit-and-push.ps1

param(
    [string]$Message = ""
)

$RepoPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoPath

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Git Commit and Push Script           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan

# Check git status
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "`n✓ Working tree is clean. Nothing to commit." -ForegroundColor Green
    exit 0
}

Write-Host "`n📝 Changes detected:" -ForegroundColor Yellow
Write-Host $status
Write-Host ""

# Get commit message
if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = Read-Host "Enter commit message"
}

if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Host "✗ Commit message cannot be empty. Aborting." -ForegroundColor Red
    exit 1
}

# Get current branch
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "`n📌 Current branch: $branch" -ForegroundColor Cyan

# Stage all changes
Write-Host "`n🔄 Staging changes..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "📦 Committing changes..." -ForegroundColor Yellow
git commit -m "$Message"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Commit failed!" -ForegroundColor Red
    exit 1
}

# Push
Write-Host "🚀 Pushing to remote..." -ForegroundColor Yellow
git push origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Successfully committed and pushed!" -ForegroundColor Green
    Write-Host "   Message: $Message" -ForegroundColor Green
} else {
    Write-Host "`n✗ Push failed!" -ForegroundColor Red
    exit 1
}
