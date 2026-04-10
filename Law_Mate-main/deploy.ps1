#!/usr/bin/env pwsh
# LawMate full deploy script
Set-Location "C:\Users\SamaaSenthil\OneDrive\Documents\GitHub\lawmate\Law_Mate-main"

Write-Host "=== Setting Vercel environment variables ===" -ForegroundColor Cyan

# Set env vars via Vercel CLI
$env_vars = @(
    @{ key = "MONGO_URI";            value = "mongodb+srv://Samaa:Samaa-12@cluster0.abcd1.mongodb.net/lawmate" },
    @{ key = "JWT_SECRET";           value = "lawmate_secret_key_2024" },
    @{ key = "ANTHROPIC_API_KEY";    value = "your_anthropic_api_key_here" },
    @{ key = "REACT_APP_API_URL";    value = "https://lawmate-wf6f.vercel.app" },
    @{ key = "DISABLE_ESLINT_PLUGIN"; value = "true" },
    @{ key = "GENERATE_SOURCEMAP";   value = "false" }
)

foreach ($ev in $env_vars) {
    Write-Host "Setting $($ev.key)..." -ForegroundColor Yellow
    echo $ev.value | vercel env add $ev.key production --force 2>$null
}

Write-Host "=== Pushing to GitHub ===" -ForegroundColor Cyan
git add -A
git commit -m "Deploy: final vercel config with api handler and env"
git push origin main

Write-Host "=== Done! Vercel will auto-deploy. ===" -ForegroundColor Green
Write-Host "Visit: https://lawmate-wf6f.vercel.app" -ForegroundColor Green
