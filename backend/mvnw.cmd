@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM 
@REM      http://www.apache.org/licenses/LICENSE-2.0
@REM 
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script (UN*X)
@REM
@REM Required ENV vars:
@REM ------------------
@REM JAVA_HOME - location of a JDK home dir
@REM MAVEN_BATCH_ECHO - set to 'on' to enable batch echoing of Maven commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to pause the script at the end
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_TESTS - skip running tests when building
@REM MAVEN_TERMINATE_CMD - command to use for terminating spawned processes
@REM ----------------------------------------------------------------------------

@REM Begin all REM lines with '@' in case MAVEN_BATCH_ECHO is 'on'
@echo on
@setlocal enabledelayedexpansion

@REM set %HOME% to avoid wildcard expansion
set "HOME=%HOME%"

set "MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%"
if exist "%MAVEN_PROJECTBASEDIR%" (
    cd /d "%MAVEN_PROJECTBASEDIR%"
)

set EXEC_ERROR=0
set INIT_ERROR=0

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    set INIT_ERROR=1
)

if "%INIT_ERROR%" == "1" (
    echo ERROR: MAVEN_HOME is set to an invalid directory. >&2
    echo MAVEN_HOME = "%MAVEN_HOME%" >&2
    echo Please set the MAVEN_HOME variable in your environment to match the >&2
    echo location of the Maven installation >&2
    goto end
)

@REM -- XMX, XMS and other JVM options to be passed to Maven
set MAVEN_JVM=

@REM -- MAVEN_BATCH_ECHO is by default set to off
if "%MAVEN_BATCH_ECHO%" == "on" (
    echo %MAVEN_JVM% MAVEN_OPTS %MAVEN_CMD_LINE%
)

@REM -- MAVEN_OPTS is passed through to the JVM
set MAVEN_OPTS=%MAVEN_JVM%%MAVEN_OPTS%

@REM Start MAVEN
call "%MAVEN_HOME%\bin\mvn.cmd" %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & if "%MAVEN_TERMINATE_CMD%" == "exit" exit %ERROR_CODE% else exit /B %ERROR_CODE%
