# PowerShell script to replace all glasses-icon.png references in root level folders

$files = @(
    "components\header.tsx",
    "components\email-verification-page.tsx",
    "components\email-collection-flow.tsx",
    "components\chrome-extension-overlay.tsx",
    "components\email-verification-flow.tsx",
    "components\hero-section.tsx",
    "components\loading-screen.tsx",
    "components\sign-in-page.tsx",
    "components\subscription-screen.tsx",
    "app\error.tsx"
)

foreach ($file in $files) {
    $fullPath = "C:\Users\User\RVISED3\$file"
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $newContent = $content -replace '/images/glasses-icon\.png', '/glasses.svg'
        $newContent = $newContent -replace '/glasses-icon\.png', '/glasses.svg'
        Set-Content -Path $fullPath -Value $newContent -NoNewline
        Write-Host "Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nAll root-level files updated successfully!" -ForegroundColor Cyan