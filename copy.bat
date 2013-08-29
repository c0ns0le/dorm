@echo 请先关闭浏览器
@echo 1.将数据文件备份至当前文件夹,方便u盘带走
@echo 2.将数据文件恢复到chrome浏览器存储空间中去
@echo 其他键退出
@echo off
set /p a=请输入1或2按回车:
if "%a%" == "1" goto copy
if "%a%" == "2" goto backup 
exit
:copy
@echo on
copy "%localappdata%\Google\Chrome\User Data\Default\Local Storage\__0.localstorage" %cd%
@echo off
goto p

:backup
@echo on
copy %cd%\__0.localstorage "%localappdata%\Google\Chrome\User Data\Default\Local Storage\" 
@echo off
goto p

:p
pause
