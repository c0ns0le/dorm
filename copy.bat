@echo ���ȹر������
@echo 1.�������ļ���������ǰ�ļ���,����u�̴���
@echo 2.�������ļ��ָ���chrome������洢�ռ���ȥ
@echo �������˳�
@echo off
set /p a=������1��2���س�:
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
