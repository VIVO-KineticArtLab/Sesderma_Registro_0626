# Sesderma Registro 0626

Landing page de registro para participantes de un evento Sesderma. El flujo esta pensado para abrirse desde un codigo QR en celular:

1. Inicio
2. Datos de registro
3. Confirmacion
4. Instrucciones

Los registros se guardan en Cloud Firestore dentro de la coleccion `registros`.

## Estructura

- `index.html`: estructura de las pantallas y formulario.
- `styles.css`: estilos, fondos, campos y zonas clicables transparentes.
- `script.js`: navegacion del flujo, validacion y guardado en Firebase.
- `firebase-config.js`: configuracion del proyecto Firebase.
- `firebase.json`: configuracion de Firebase Hosting.
- `Images/`: imagenes de cada pantalla del flujo.

## Correr localmente

Por usar modulos de JavaScript y Firebase por CDN, conviene abrir el proyecto con un servidor local:

```powershell
python -m http.server 8080
```

Luego abrir:

```text
http://localhost:8080/index.html
```

Para detener el servidor:

```text
Ctrl + C
```

## Desplegar en Firebase Hosting

Desde la carpeta del proyecto:

```powershell
npx.cmd firebase-tools deploy --only hosting
```

Si cambian los campos del formulario, tambien despliega las reglas de Firestore:

```powershell
npx.cmd firebase-tools deploy --only firestore:rules
```

URL publica:

```text
https://sesderma-5b661.web.app
```

## Firebase

Proyecto configurado:

```text
sesderma-5b661
```

Coleccion de Firestore:

```text
registros
```

Campos principales:

- `fullName`
- `phone`
- `email`
- `city`
- `specialty`
- `privacyConsent`
- `marketingConsent`
- `consentAcceptedAt`
- `privacyNoticeVersion`
- `registeredAt`
- `createdAt`
- `source`

## Flujo de Git

```powershell
git status
git add .
git commit -m "Describe el cambio"
git push
```
