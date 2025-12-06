Param(
    [switch]$Rebuild,
    [switch]$Dev,
    [switch]$SkipNeo4j,
    [switch]$Watch,
    [int]$WatchIntervalSeconds = 5
)

Write-Host "Starting Knowledge Graph Studio with Docker..." -ForegroundColor Cyan

$composeFiles = @("docker-compose.yml")
if ($Dev) {
    $composeFiles += "docker-compose.dev.yml"
}
$composeArgs = @()
foreach ($f in $composeFiles) { $composeArgs += @("-f", $f) }

function Is-Running($name) {
    $id = docker ps -q -f "name=$name"
    return -not [string]::IsNullOrEmpty($id)
}

if ($Rebuild) {
    Write-Host "Rebuilding web image..." -ForegroundColor Yellow
    # ensure web is stopped before rebuild
    docker compose @composeArgs stop web | Out-Null
    docker compose @composeArgs build --no-cache web
}

# Only start Neo4j if it's not already running (unless explicitly skipped)
if (-not $SkipNeo4j -and -not (Is-Running "kg-neo4j")) {
    Write-Host "Starting Neo4j..." -ForegroundColor Yellow
    docker compose @composeArgs up -d neo4j
} elseif ($SkipNeo4j) {
    Write-Host "Skipping Neo4j start (per flag)." -ForegroundColor Yellow
}

Write-Host "Starting web..." -ForegroundColor Yellow
docker compose @composeArgs stop web | Out-Null
docker compose @composeArgs up -d web

if ($Dev) {
    Write-Host "Dev mode: code is bind-mounted; changes auto-reload. Web: http://localhost:3000  Neo4j: http://localhost:7474" -ForegroundColor Green
} else {
    Write-Host "Services started. Web: http://localhost:3000  Neo4j Browser: http://localhost:7474" -ForegroundColor Green
}

if ($Watch) {
    Write-Host "Watch mode enabled. Monitoring containers every $WatchIntervalSeconds seconds. Press Ctrl+C to stop." -ForegroundColor Yellow
    while ($true) {
        Start-Sleep -Seconds $WatchIntervalSeconds

        if (-not (Is-Running "kg-web")) {
            Write-Host "kg-web is not running; restarting..." -ForegroundColor Yellow
            docker compose @composeArgs up -d web
        }

        if (-not $SkipNeo4j -and -not (Is-Running "kg-neo4j")) {
            Write-Host "kg-neo4j is not running; restarting..." -ForegroundColor Yellow
            docker compose @composeArgs up -d neo4j
        }
    }
}
