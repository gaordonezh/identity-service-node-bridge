# TypeScript + Express

Este proyecto se usa como _Libreria para la verificación de tokens de *Identity Service*_

## Forma de uso

Colocar el nombre y la libreria apuntando al repositorio y al tag que se quiere consumir

```js
"dependencies": {
  "identity-service-node-bridge": "github:gaordonezh/identity-service-node-bridge#v1.0.0"
},
```

Expone:

- identityServiceMiddleware: Middleware con los parámetros de validación.
- types:
  - SSOJwtPayload
  - IdentityServiceConfigProps
  - Express > Request > auth
