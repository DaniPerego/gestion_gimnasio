# Implementación de Control de Acceso (Cerradura Magnética)

Este documento describe cómo integrar el sistema de gestión (GMS) con una cerradura magnética física de 12V para automatizar el ingreso de los socios.

## 1. Concepto General

Las aplicaciones web no pueden controlar electricidad directamente. Para lograrlo, necesitamos un dispositivo intermediario (Microcontrolador) conectado a la red WiFi del gimnasio.

**El flujo es el siguiente:**
1. El Socio ingresa su DNI en la "Ventana Socio" (PC/Tablet en el mostrador).
2. El Sistema verifica en la Base de Datos (Vercel) si el socio está activo y al día.
3. **Si el acceso es VÁLIDO:**
   - El navegador envía una señal por la red local al Microcontrolador.
   - El Microcontrolador activa un Relé.
   - El Relé corta la energía (12V) de la cerradura por unos segundos.
   - La puerta se abre.
4. **Si el acceso es DENEGADO:**
   - El sistema muestra un mensaje en pantalla: "Acceso Denegado. Diríjase a Administración".
   - La cerradura permanece magnetizada (cerrada).

## 2. Hardware Necesario

Para construir este puente entre el software y la puerta, necesitas:

1.  **Cerradura Electromagnética (12V):** La que ya tienes o planeas comprar.
2.  **Fuente de Alimentación 12V:** Para alimentar la cerradura.
3.  **Microcontrolador con WiFi (ESP32 o ESP8266/NodeMCU):** Es el "cerebro" que recibe la orden del sistema. Costo muy bajo (aprox $5-10 USD).
4.  **Módulo Relé (5V o 3.3V):** Funciona como un interruptor digital. El ESP32 le dice "apágate/préndete" y el relé maneja la corriente de 12V de la cerradura.

## 3. Diagrama de Conexión Simplificado

```text
[ Fuente 12V ] (+) ---------------------> [ COM del Relé ]
                                          [ NC del Relé  ] -----------------> [ (+) Cerradura ]
[ Fuente 12V ] (-) ---------------------------------------------------------> [ (-) Cerradura ]

[ ESP32 Pin D5 ] -----------------------> [ IN del Relé ]
[ ESP32 5V/3V3 ] -----------------------> [ VCC del Relé ]
[ ESP32 GND    ] -----------------------> [ GND del Relé ]
```

*Nota: Usamos el puerto **NC (Normalmente Cerrado)** del Relé. Esto significa que siempre pasa corriente (puerta cerrada). Cuando el ESP32 activa el relé, el circuito se abre, se corta la luz y la puerta se abre.*

## 4. Lógica del Software (Next.js)

En la página de la "Ventana Socio" (`src/app/kiosco/page.tsx` o donde se maneje el input del DNI), debemos agregar la lógica para llamar al dispositivo local.

### Ejemplo de lógica en el Frontend:

```typescript
// Esta función se ejecuta cuando la validación del socio es EXITOSA
async function abrirPuerta() {
  try {
    // IP del ESP32 en la red local del gimnasio
    const PUERTA_IP = "192.168.1.200"; 
    
    // Enviamos la orden de abrir
    await fetch(`http://${PUERTA_IP}/abrir`, { 
      method: 'POST',
      mode: 'no-cors' // Importante para peticiones locales desde el navegador
    });
    
    mostrarMensaje("¡Bienvenido! La puerta está abierta.");
  } catch (error) {
    console.error("Error al conectar con la puerta", error);
    mostrarMensaje("Bienvenido. (Error de conexión con puerta)");
  }
}
```

## 5. Código del Microcontrolador (Ejemplo para ESP32/Arduino)

Este código se carga en el aparatito que controla la puerta.

```cpp
#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "NOMBRE_WIFI_GIMNASIO";
const char* password = "CLAVE_WIFI";

WebServer server(80);
const int RELAY_PIN = 5; // Pin donde conectamos el Relé

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // HIGH mantiene el relé cerrado (Puerta Bloqueada)
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  
  // Ruta para abrir la puerta
  server.on("/abrir", HTTP_POST, []() {
    digitalWrite(RELAY_PIN, LOW); // Corta la corriente (Abre puerta)
    delay(3000);                  // Espera 3 segundos
    digitalWrite(RELAY_PIN, HIGH); // Vuelve a dar corriente (Cierra puerta)
    server.send(200, "text/plain", "Puerta Abierta");
  });

  server.begin();
}

void loop() {
  server.handleClient();
}
```

## 6. Resumen de Seguridad

1.  **Validación:** La decisión de abrir la puerta la toma SIEMPRE tu servidor Next.js después de verificar la base de datos.
2.  **Red Local:** La petición a la puerta se hace desde el navegador de la PC del mostrador hacia el ESP32 por la red local. Nadie desde internet puede abrir la puerta directamente.
