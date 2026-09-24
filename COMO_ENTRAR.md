# Cómo entrar y probar VirtualCasino (demo)

Esto es una demo que corre **en tu propia computadora**, no en internet. Nadie
más puede entrar a tu casino salvo que compartas tu red. Es para ver y probar
cómo funcionaría la plataforma, no para operar con dinero real (ver el
apartado "Importante" al final).

## Paso 1 — Instalar Node.js (una sola vez)

Node.js es el programa que hace correr el servidor. Si no lo tenés instalado:

1. Andá a **https://nodejs.org**
2. Descargá la versión que dice **"LTS"** (recomendada).
3. Instalala como cualquier programa (siguiente, siguiente, finalizar).

Para confirmar que quedó instalado, abrí la terminal:
- **Windows**: buscá "cmd" o "Símbolo del sistema" en el menú de inicio.
- **Mac**: buscá "Terminal" con Spotlight (Cmd + Espacio).

Y escribí:
```
node -v
```
Si te muestra algo como `v20.x.x` o `v22.x.x`, ya está instalado.

## Paso 2 — Ubicar la carpeta del proyecto

Descargá y descomprimí la carpeta `casino-demo` que te compartí (contiene
`server.js` y la carpeta `public`). Anotá dónde la guardaste, por ejemplo en
el Escritorio.

## Paso 3 — Prender el servidor

En la terminal, entrá a esa carpeta. Por ejemplo, si la pusiste en el
Escritorio:

**Windows:**
```
cd Desktop\casino-demo
node server.js
```

**Mac:**
```
cd ~/Desktop/casino-demo
node server.js
```

Si ves este mensaje, ¡ya está andando!
```
VirtualCasino corriendo ✅
Abrí tu navegador en: http://localhost:3000
```

No cierres esa ventana de la terminal — mientras esté abierta, el casino está
"prendido". Si la cerrás, se apaga.

## Paso 4 — Entrar al casino

Abrí tu navegador (Chrome, Firefox, el que uses) y andá a:

```
http://localhost:3000
```

Ya hay una cuenta de prueba cargada con $500 de saldo:
- **Email:** demo@casino.com
- **Contraseña:** demo1234

Los datos ya están puestos en el formulario — solo apretá "Ingresar". También
podés crear una cuenta nueva desde "Registrate" si querés probar ese flujo.

## Paso 5 — Jugar

Una vez adentro vas a ver el tragamonedas "Fortuna Triple": elegís cuánto
apostar con los botones `−` y `+`, apretás "Girar", y el saldo se actualiza
según lo que calcula el servidor (no el navegador) — igual que pasaría en un
casino real.

## Para apagarlo

Volvé a la ventana de la terminal y apretá `Ctrl + C`.

---

## ¿Qué es "real" acá y qué es solo demostrativo?

- El saldo, el login y el resultado del juego **sí los calcula el servidor** —
  no es una animación trucha del navegador. Si cerrás el navegador y volvés a
  entrar con la misma cuenta, tu saldo sigue donde lo dejaste (mientras el
  servidor siga prendido).
- Los datos se guardan **en la memoria del servidor**, no en un archivo. Si
  apagás el servidor (Ctrl+C) y lo volvés a prender, los saldos vuelven a
  empezar de cero (excepto la cuenta demo, que siempre arranca en $500).
- No hay dinero real ni pagos reales involucrados en ningún punto.

## Importante — antes de pensar en algo real

Para que esto funcione con dinero real y usuarios de verdad hace falta, como
mínimo:
- Una **licencia de juego** habilitada por el organismo correspondiente
  (en la provincia de Buenos Aires, por ejemplo, el IPLyC).
- Un **procesador de pagos** habilitado para casinos online.
- Un **RNG certificado** por un laboratorio acreditado (el de esta demo es
  solo para fines educativos).
- Alojar el servidor en internet de forma segura (esto hoy corre solo en tu
  computadora).

Si en algún momento te interesa dar ese paso, avisame y vemos qué necesitarías
concretamente para tu caso.
