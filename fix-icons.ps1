# PowerShell script to replace all glasses-icon.png references with glasses.svg

$files = @(
    "rvised\src\components\email-verification-page.tsx",
    "rvised\src\components\email-collection-flow.tsx", 
    "rvised\src\components\extension-demo.tsx",
    "rvised\src\components\email-verification-flow.tsx",
    "rvised\src\components\extension-demo-enhanced.tsx",
    "rvised\src\components\loading-screen.tsx",
    "rvised\src\components\subscription-screen.tsx",
    "rvised\src\components\sign-in-page.tsx"
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

Write-Host "`nAll files updated successfully!" -ForegroundColor Cyan