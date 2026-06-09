@REM Maven Wrapper script for Windows
@REM Downloads Maven if not already cached
@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_CMD_LINE_ARGS=%*

set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
set MAVEN_DIST_URL="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"

if not exist "%MAVEN_PROJECTBASEDIR%.mvn\wrapper" mkdir "%MAVEN_PROJECTBASEDIR%.mvn\wrapper"

@REM Check if wrapper jar exists, download if not
if not exist %WRAPPER_JAR% (
    echo Downloading Maven Wrapper...
    powershell -Command "Invoke-WebRequest -Uri %WRAPPER_URL% -OutFile %WRAPPER_JAR%"
)

@REM Use wrapper jar or fall back to direct Maven download
set MAVEN_HOME=%MAVEN_PROJECTBASEDIR%.mvn\maven
if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo Downloading Apache Maven 3.9.9...
    set MVN_ZIP="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven.zip"
    powershell -Command "Invoke-WebRequest -Uri %MAVEN_DIST_URL% -OutFile %MVN_ZIP%"
    powershell -Command "Expand-Archive -Path %MVN_ZIP% -DestinationPath '%MAVEN_PROJECTBASEDIR%.mvn' -Force"
    if exist "%MAVEN_PROJECTBASEDIR%.mvn\apache-maven-3.9.9" (
        rename "%MAVEN_PROJECTBASEDIR%.mvn\apache-maven-3.9.9" maven
    )
    del %MVN_ZIP% 2>nul
)

"%MAVEN_HOME%\bin\mvn.cmd" %MAVEN_CMD_LINE_ARGS%
