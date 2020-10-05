## node-msi


To add the group to DB 

```
CREATE USER [msiadtest] FROM EXTERNAL PROVIDER;

SELECT * FROM SYS.DATABASE_PRINCIPALS;

EXEC sp_addrolemember 'db_datareader', 'msiadtest';
```


## K8S

Update `k8s.yaml` the `aadpodidbinding: demoidentity` to point to azureidentity you have created, and environment variable to point to the SQL Database and SQL Server

```
az acr build --image node-msi --registry acraccess --resource-group aks-tests --file Dockerfile  . 

kubectl apply -f k8s.yaml

kubectl port-forward deployment/node-msi 8080:8080
```