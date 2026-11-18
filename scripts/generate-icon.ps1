#Requires -Version 5.1
param(
    [string]$OutPath = ''
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$Root = Split-Path -Parent $PSScriptRoot
if (-not $OutPath) {
    $assetsDir = Join-Path $Root 'assets'
    if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null }
    $OutPath = Join-Path $assetsDir 'app.ico'
}

$sizes = @(16, 32, 48, 64, 128, 256)
$images = [System.Collections.Generic.List[byte[]]]::new()

foreach ($sz in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($sz, $sz, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = [float]$sz / 64.0
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $rad = [float](16.0 * $scale)
    $rect = New-Object System.Drawing.RectangleF(0, 0, [float]$sz, [float]$sz)
    $path.AddArc($rect.X, $rect.Y, [float]($rad * 2), [float]($rad * 2), 180, 90)
    $path.AddArc([float]($rect.Right - $rad * 2), $rect.Y, [float]($rad * 2), [float]($rad * 2), 270, 90)
    $path.AddArc([float]($rect.Right - $rad * 2), [float]($rect.Bottom - $rad * 2), [float]($rad * 2), [float]($rad * 2), 0, 90)
    $path.AddArc($rect.X, [float]($rect.Bottom - $rad * 2), [float]($rad * 2), [float]($rad * 2), 90, 90)
    $path.CloseFigure()

    $p1 = New-Object System.Drawing.PointF([float](8.0 * $scale), [float](8.0 * $scale))
    $p2 = New-Object System.Drawing.PointF([float](56.0 * $scale), [float](56.0 * $scale))
    $c1 = [System.Drawing.Color]::FromArgb(255, 0x5b, 0x7c, 0xff)
    $c2 = [System.Drawing.Color]::FromArgb(255, 0x91, 0xb3, 0xff)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($p1, $p2, $c1, $c2)
    $g.FillPath($brush, $path)

    # Baseline
    $basePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(89, 255, 255, 255), [float](2.0 * $scale))
    $basePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $basePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($basePen, [float](18.0 * $scale), [float](46.0 * $scale), [float](46.0 * $scale), [float](46.0 * $scale))

    # Wave
    $wavePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(242, 255, 255, 255), [float](3.5 * $scale))
    $wavePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $wavePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $wavePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $pts = @(
        (New-Object System.Drawing.PointF([float](14.0 * $scale), [float](42.0 * $scale))),
        (New-Object System.Drawing.PointF([float](24.0 * $scale), [float](34.0 * $scale))),
        (New-Object System.Drawing.PointF([float](34.0 * $scale), [float](38.0 * $scale))),
        (New-Object System.Drawing.PointF([float](44.0 * $scale), [float](26.0 * $scale))),
        (New-Object System.Drawing.PointF([float](50.0 * $scale), [float](30.0 * $scale)))
    )
    $g.DrawLines($wavePen, $pts)

    # Circle
    $circleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $cRad = [float](3.5 * $scale)
    $g.FillEllipse($circleBrush, [float](50.0 * $scale - $cRad), [float](30.0 * $scale - $cRad), [float]($cRad * 2), [float]($cRad * 2))

    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $images.Add($ms.ToArray())

    $g.Dispose()
    $bmp.Dispose()
    $path.Dispose()
    $brush.Dispose()
    $basePen.Dispose()
    $wavePen.Dispose()
    $circleBrush.Dispose()
}

$fs = [System.IO.File]::Create($OutPath)
$bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([uint16]0)
$bw.Write([uint16]1)
$bw.Write([uint16]$sizes.Count)

$offset = 6 + ($sizes.Count * 16)
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $s = $sizes[$i]
    $w = if ($s -ge 256) { [byte]0 } else { [byte]$s }
    $h = if ($s -ge 256) { [byte]0 } else { [byte]$s }
    $bw.Write($w)
    $bw.Write($h)
    $bw.Write([byte]0)
    $bw.Write([byte]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]32)
    $bw.Write([uint32]$images[$i].Length)
    $bw.Write([uint32]$offset)
    $offset += $images[$i].Length
}

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $bw.Write($images[$i])
}

$bw.Close()
$fs.Close()
Write-Host "Multi-resolution icon created at: $OutPath" -ForegroundColor Green
