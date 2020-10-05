## node-msi


To add the group to DB 

```
CREATE USER [msiadtest] FROM EXTERNAL PROVIDER;

SELECT * FROM SYS.DATABASE_PRINCIPALS;

EXEC sp_addrolemember 'db_datareader', 'msiadtest';
```


## K8S

```
az acr build --image node-msi --registry acraccess --resource-group aks-tests --file Dockerfile  . 

```