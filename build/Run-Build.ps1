$msbuild = "C:\Program Files (x86)\MSBuild\14.0\Bin\MSBuild.exe"
$commonparams = "/p:WarningLevel=4;Configuration=Release", "/m:2", "/nologo", "/consoleloggerparameters:errorsOnly"
$cleanparams = "/t:Clean"
$buildparams = "/t:Build"

function Build-Project($project, $additionalbuildparams){
    & $msbuild $project $commonparams $buildparams $additionalbuildparams
}

function Clean-Project ($project){
    & $msbuild $project $commonparams $cleanparams
}

$projects = @("..\GridMaps.sln")

foreach($proj in $projects) {
    #Write-Progress -Activity "Building $($proj)" -PercentComplete ($projects.IndexOf($proj)/$projects.Length*100)
    Write-Host "Building $($proj)"

    Clean-Project $proj
    Build-Project $proj

    if($LASTEXITCODE -ne 0) {
        Clean-Project $proj
        Write-Error "Build $($proj) failed."
        continue
    }

    #Clean-Project $proj
}
Write-Host "Build complete"