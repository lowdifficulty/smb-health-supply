$ErrorActionPreference = "Stop"
$BaseUrl = "https://smbhealthsupply.com"
$Root = "c:\Users\Admin\SMB Web\site"

$Pages = @(
    @{ Path = "/"; File = "index.html" },
    @{ Path = "/about/"; File = "about/index.html" },
    @{ Path = "/products/"; File = "products/index.html" },
    @{ Path = "/partner-with-us/"; File = "partner-with-us/index.html" },
    @{ Path = "/contact/"; File = "contact/index.html" },
    @{ Path = "/privacy-policy/"; File = "privacy-policy/index.html" },
    @{ Path = "/terms-of-service/"; File = "terms-of-service/index.html" }
)

function Ensure-Dir($path) {
    $dir = Split-Path $path -Parent
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

function Download-File($url, $dest) {
    Ensure-Dir $dest
    try {
        curl.exe -sL $url -o $dest --max-time 120 --fail
        return $true
    } catch {
        Write-Warning "Failed: $url"
        return $false
    }
}

Write-Host "Downloading pages..."
foreach ($page in $Pages) {
    $dest = Join-Path $Root $page.File
    Ensure-Dir $dest
    $url = "$BaseUrl$($page.Path)"
    Write-Host "  $url"
    curl.exe -sL $url -o $dest --max-time 120
}

Write-Host "Downloading Elementor plugin..."
$zipPath = Join-Path $Root "..\elementor.zip"
curl.exe -sL "https://downloads.wordpress.org/plugin/elementor.latest-stable.zip" -o $zipPath --max-time 300
Expand-Archive -Path $zipPath -DestinationPath (Join-Path $Root "..\elementor-tmp") -Force
$pluginDest = Join-Path $Root "wp-content\plugins\elementor"
if (Test-Path $pluginDest) { Remove-Item $pluginDest -Recurse -Force }
Copy-Item (Join-Path $Root "..\elementor-tmp\elementor") $pluginDest -Recurse
Remove-Item (Join-Path $Root "..\elementor-tmp") -Recurse -Force
Remove-Item $zipPath -Force

Write-Host "Extracting asset URLs from pages..."
$assetUrls = New-Object System.Collections.Generic.HashSet[string]
$htmlFiles = Get-ChildItem -Path $Root -Filter "*.html" -Recurse
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $matches = [regex]::Matches($content, '(?:href|src)=''([^'']+)''|(?:href|src)="([^"]+)"')
    foreach ($m in $matches) {
        $url = if ($m.Groups[1].Value) { $m.Groups[1].Value } else { $m.Groups[2].Value }
        if ($url -match '^https://smbhealthsupply\.com/(.+)$') {
            [void]$assetUrls.Add($Matches[1])
        }
    }
}

Write-Host "Downloading $($assetUrls.Count) referenced assets..."
$downloaded = 0
$failed = 0
foreach ($path in ($assetUrls | Sort-Object)) {
    if ($path -match '^(wp-admin|wp-json|xmlrpc|feed|comments)/') { continue }
    $dest = Join-Path $Root ($path -replace '\?.*$', '')
    if (Test-Path $dest) { continue }
    $url = "$BaseUrl/$path"
    $ok = Download-File $url $dest
    if ($ok) { $downloaded++ } else { $failed++ }
}
Write-Host "Downloaded $downloaded assets, failed $failed"

Write-Host "Rewriting URLs to relative paths..."
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace 'https://smbhealthsupply\.com/', '/'
    $content = $content -replace 'href=''/','href="/'
    $content = $content -replace 'href=''//','href="/'
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Done."
