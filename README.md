# Date App

* Ejecutar los seed
```
npx prisma db seed       
```

* Crear migraciones
```
npx prisma migrate dev --name init
```
* Aplicar migraciones a producción
```
npx prisma migrate deploy
```
* Revertir migraciones
```
npx prisma migrate reset
```
* Revertir migraciones a producción
```
npx prisma migrate reset --force
```