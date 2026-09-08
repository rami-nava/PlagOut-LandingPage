# Plag-Out landing

Landing estática: HTML, CSS y JavaScript, sin compilación.

## Previsualización local

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

## Formulario del piloto

El formulario realiza un POST a FormSubmit para enviar las solicitudes a diegohcanetti@gmail.com. Incluye una respuesta automática al visitante con los próximos pasos del piloto Android. No se envían correos desde JavaScript ni se incluyen credenciales.

Antes de dar por operativo el formulario:
1. Enviar una solicitud de prueba desde la landing publicada.
2. Confirmar el correo de activación que FormSubmit enviará a diegohcanetti@gmail.com (revisar spam).
3. Enviar una nueva solicitud y verificar la recepción y la respuesta automática.

Se conserva el CAPTCHA de FormSubmit: la respuesta automática necesita envío nativo y CAPTCHA habilitado. Tras completar el envío, FormSubmit redirige a `inscripcion.html` en el mismo sitio mediante `_next`. El usuario confirmó haber activado el correo. La entrega real y la respuesta automática siguen pendientes de verificación.

Documentación: https://formsubmit.co/

## Recursos

La demo y sus portadas están en `assets/`. Los archivos originales de videos y presentación permanecen intactos. El recorrido de cinco pasos se recuperó de la versión original y se adaptó a español latinoamericano.
