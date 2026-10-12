param(
    [string]$BaseUrl = 'https://bank.135-125-182-42.nip.io/api',
    [string]$Email = 'admin@bank.local',
    [string]$Password = 'Admin123!',
    [string]$OutputPath = 'docs/api-smoke-results.md'
)

$ErrorActionPreference = 'Stop'
$origin = 'https://ibankfront.vercel.app'
$results = [System.Collections.Generic.List[object]]::new()

function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Token = '',
        [string]$Expected = '2xx'
    )

    $headers = @{ Origin = $origin }
    if ($Token) { $headers.Authorization = "Bearer $Token" }
    $parameters = @{
        Uri = "$BaseUrl$Path"
        Method = $Method
        Headers = $headers
        ContentType = 'application/json'
        UseBasicParsing = $true
        TimeoutSec = 30
    }
    if ($null -ne $Body) { $parameters.Body = $Body | ConvertTo-Json -Depth 8 }

    $response = $null
    $content = ''
    try {
        $response = Invoke-WebRequest @parameters
        $status = [int]$response.StatusCode
        $content = $response.Content
    }
    catch {
        if ($null -eq $_.Exception.Response) { throw }
        $response = $_.Exception.Response
        $status = [int]$response.StatusCode
        if ($_.ErrorDetails.Message) { $content = $_.ErrorDetails.Message }
    }

    $cors = $response.Headers['Access-Control-Allow-Origin']
    if (-not $cors) { $cors = 'absent' }
    $ok = if ($Expected -eq '2xx') {
        $status -ge 200 -and $status -lt 300
    } elseif ($Expected -eq '4xx') {
        $status -ge 400 -and $status -lt 500
    } else {
        $status -eq [int]$Expected
    }

    $results.Add([pscustomobject]@{
        Method = $Method
        Path = $Path
        Expected = $Expected
        Actual = $status
        Cors = $cors
        Pass = $ok -and $status -lt 500
    })

    return [pscustomobject]@{ Status = $status; Content = $content }
}

$login = Invoke-ApiRequest -Method POST -Path '/Auth/login' -Body @{
    email = $Email
    password = $Password
}
if ($login.Status -ne 200) { throw "Login failed with HTTP $($login.Status)." }
$session = $login.Content | ConvertFrom-Json
$token = $session.token
if (-not $token) { throw 'Login response did not include a token.' }

$collections = @{}
foreach ($resource in @('Clients', 'Comptes', 'Guichets', 'TypesComptes')) {
    $response = Invoke-ApiRequest -Method GET -Path "/$resource" -Token $token
    $parsed = $response.Content | ConvertFrom-Json
    $collections[$resource] = @($parsed | Where-Object { $null -ne $_ })
}

Invoke-ApiRequest -Method GET -Path '/Health' | Out-Null
Invoke-ApiRequest -Method GET -Path '/Clients/search?term=__ibank_smoke_no_match__' -Token $token | Out-Null

foreach ($resource in @('Clients', 'Comptes', 'Guichets', 'TypesComptes')) {
    $id = if ($collections[$resource].Count -gt 0) { $collections[$resource][0].id } else { 0 }
    $expected = if ($id -eq 0) { '4xx' } else { '2xx' }
    Invoke-ApiRequest -Method GET -Path "/$resource/$id" -Token $token -Expected $expected | Out-Null
}

$compteId = if ($collections['Comptes'].Count -gt 0) { $collections['Comptes'][0].id } else { 0 }
Invoke-ApiRequest -Method GET -Path "/Transactions/compte/$compteId" -Token $token | Out-Null

$invalid = @{}
Invoke-ApiRequest -Method POST -Path '/Auth/agent' -Body $invalid -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method POST -Path '/Clients' -Body $invalid -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method PUT -Path '/Clients/0' -Body $invalid -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method DELETE -Path '/Clients/0' -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method POST -Path '/Comptes' -Body $invalid -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method PUT -Path '/Comptes/0' -Body @{ isActive = $false } -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method POST -Path '/Guichets' -Body $invalid -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method PUT -Path '/Guichets/0' -Body $invalid -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method DELETE -Path '/Guichets/0' -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method POST -Path '/TypesComptes' -Body $invalid -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method PUT -Path '/TypesComptes/0' -Body $invalid -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method DELETE -Path '/TypesComptes/0' -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method POST -Path '/Transactions/depot' -Body $invalid -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method POST -Path '/Transactions/retrait' -Body $invalid -Token $token -Expected '4xx' | Out-Null
Invoke-ApiRequest -Method POST -Path '/Transactions/virement' -Body $invalid -Token $token -Expected '4xx' | Out-Null

$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss K'
$lines = @(
    '# Résultats du smoke test API',
    '',
    "Exécution : $timestamp",
    '',
    'Ce test utilise le compte administrateur de formation. Les écritures emploient uniquement des charges invalides ou l’identifiant `0`; aucune donnée persistante n’est créée ou modifiée.',
    '',
    '| Méthode | Route | Attendu | HTTP | CORS | Résultat |',
    '|---|---|---:|---:|---|---|'
)
foreach ($item in $results) {
    $result = if ($item.Pass) { 'OK' } else { 'ÉCHEC' }
    $lines += "| $($item.Method) | ``$($item.Path)`` | $($item.Expected) | $($item.Actual) | ``$($item.Cors)`` | $result |"
}

$outputDirectory = Split-Path -Parent $OutputPath
if ($outputDirectory -and -not (Test-Path $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}
$lines | Set-Content -Path $OutputPath -Encoding utf8

$failed = @($results | Where-Object { -not $_.Pass })
Write-Host "API smoke test: $($results.Count - $failed.Count)/$($results.Count) routes conformes."
Write-Host "Rapport: $OutputPath"
if ($failed.Count -gt 0) {
    $failed | Format-Table Method, Path, Expected, Actual, Cors
    exit 1
}
