# Plag-Out — previsualización del rediseño

Copia local aislada de la landing. No publicada, sin backend y sin cambios en el repositorio de origen.

## Ejecutar

Desde esta carpeta:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Abrir http://127.0.0.1:4173. No necesita compilación ni dependencias de frontend.

## Recursos

- `assets/monitoreos-portada.webp`: fotograma del video 21.38.14, a los 11,5 s; recorte de barras del sistema y reducción a 648 px de ancho.
- `assets/demo.mp4`: video 21.42.28, desde 0,35 s durante 15,55 s; recorte a 576 × 1160, H.264, 30 fps, sin audio, faststart. Rótulos HTML sincronizados con la reproducción.
- `assets/demo-portada.webp`: fotograma del video de la demo a los 2,2 s.
- `assets/logo.png`: logo extraído del recurso incrustado en la landing original.

Los videos e imágenes originales siguen intactos en el repositorio fuente. Las fotos del equipo y los clips no seleccionados no se incluyen en esta copia.

## Antes de publicar (fuera de esta etapa)

Conectar el formulario a un servicio real, confirmar correo y WhatsApp, revisar los datos de demostración y retirar los avisos de previsualización y la metaetiqueta noindex. Confirmar el dominio antes de configurar DNS. No publicar directamente esta demostración.
