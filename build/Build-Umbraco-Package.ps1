###############################################################
# DO THE UMBRACO PACKAGE BUILD 
###############################################################

$directorypath = Split-Path $MyInvocation.MyCommand.Path
$parentPath = Split-Path $directorypath -Parent
$ReleaseVersionNumber = "1.3.0"
$PackageManifest = "$directorypath\package.xml"
$CreatedPackagesConfig = "$directorypath\createdPackages.config"
$WebProjFolder = "$parentPath\GridMaps"

$destPathForZip = "$directorypath\UmbPackage"
$destPath = "$directorypath\UmbPackage\dd4ec23b-22e7-467d-9cf7-af4403d8775f"

if(Test-Path $destPath) {
}
else {
    md $destPath
}

# Load in the XML from the file
$CreatedPackagesConfigXML = [xml](Get-Content $CreatedPackagesConfig)
# Set the version number in createdPackages.config
$CreatedPackagesConfigXML.packages.package.version = "$ReleaseVersionNumber"
$CreatedPackagesConfigXML.Save($CreatedPackagesConfig)

#copy the orig manifest to temp location to be updated to be used for the package
#$PackageManifest = Join-Path -Path $BuildFolder -ChildPath "packageManifest.xml"
#New-Item -ItemType Directory -Path $TempFolder
#Copy-Item $PackageManifest "$TempFolder\package.xml"
#$PackageManifest = (Join-Path -Path $TempFolder -ChildPath "package.xml")

# Set the data in packageManifest.config
$PackageManifestXML = [xml](Get-Content $PackageManifest)
$PackageManifestXML.umbPackage.info.package.version = "$ReleaseVersionNumber"
$PackageManifestXML.umbPackage.info.package.name = $CreatedPackagesConfigXML.packages.package.name
$PackageManifestXML.umbPackage.info.package.license.set_InnerXML($CreatedPackagesConfigXML.packages.package.license.get_InnerXML())
$PackageManifestXML.umbPackage.info.package.license.url = $CreatedPackagesConfigXML.packages.package.license.url
$PackageManifestXML.umbPackage.info.package.url = $CreatedPackagesConfigXML.packages.package.url
$PackageManifestXML.umbPackage.info.author.name = $CreatedPackagesConfigXML.packages.package.author.get_InnerXML()
$PackageManifestXML.umbPackage.info.author.website = $CreatedPackagesConfigXML.packages.package.author.url

#clear the files from the manifest
$NewFilesXML = $PackageManifestXML.CreateElement("files")

#package the files ... This will lookup all files in the file system that need to be there and update
# the package manifest XML with the correct data along with copying these files to the  temp folder 
# so they can be zipped with the package

Function WritePackageFile ($f)
{
	Write-Host $f.FullName -foregroundcolor cyan
	$NewFileXML = $PackageManifestXML.CreateElement("file")
	$NewFileXML.set_InnerXML("<guid></guid><orgPath></orgPath><orgName></orgName>")
	#$GuidName = ([guid]::NewGuid()).ToString() + "_" + $f.Name
	$NewFileXML.guid = $f.Name	
	$NewFileXML.orgPath = ReverseMapPath $f
	$NewFileXML.orgName = $f.Name
	$NewFilesXML.AppendChild($NewFileXML)
	Copy-Item $f.FullName "$destPath\$($f.Name)"
}
Function ReverseMapPath ($f)
{
	$resultPath = "~"+ $f.Directory.FullName.Replace($WebProjFolder, "").Replace("\","/")	
	Return $resultPath
}
Function MapPath ($f)
{
	$resultPath = Join-Path -Path $WebProjFolder -ChildPath ($f.Replace("~", "").Replace("/", "\"))
	Return $resultPath
}
foreach($FileXML in $CreatedPackagesConfigXML.packages.package.files.file)
{
	$File = Get-Item (MapPath $FileXML)
    if ($File -is [System.IO.DirectoryInfo]) 
    {
        Get-ChildItem -path $File -Recurse `
			| Where-Object { $_ -isnot [System.IO.DirectoryInfo]} `
			| ForEach-Object { WritePackageFile($_) } `
		    | Out-Null	
    }
	else {
		WritePackageFile($File)| Out-Null	
	}
}
#$PackageManifestXML.umbPackage.ReplaceChild($NewFilesXML, $PackageManifestXML.SelectSingleNode("/umbPackage/files")) | Out-Null
#$PackageManifestXML.Save($PackageManifest)

#copy the package xml file to package it
Copy-Item $PackageManifest $destPath

#finally zip the package
$DestZIP = ".\GridMaps_$ReleaseVersionNumber.zip" 
Add-Type -assembly "system.io.compression.filesystem"
[io.compression.zipfile]::CreateFromDirectory($destPathForZip, $DestZIP) 

###############################################################
# Finished creating the Umbraco package format as a zip file
###############################################################