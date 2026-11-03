# 02. Arquitectura

## Visión general

El diseño previsto separa la extracción, la transformación y la carga para que
cada etapa pueda validarse de forma independiente. La tecnología de origen y
destino está pendiente de definición.

## Flujo de datos

1. **Extracción:** leer datos desde la fuente autorizada.
2. **Validación y transformación:** comprobar estructura y reglas de calidad;
   normalizar los valores acordados.
3. **Carga:** guardar los datos válidos en el destino definido.
4. **Registro:** informar el resultado y los errores sin exponer credenciales ni
   datos sensibles.

## Componentes

| Componente | Responsabilidad |
|---|---|
| `src/etl/cargar_datos.py` | Punto de entrada del proceso ETL. |
| Fuente de datos | Pendiente de especificación. |
| Destino de datos | Pendiente de especificación. |

## Configuración y seguridad

- Mantener credenciales fuera del código y del control de versiones.
- Usar `.env` local solo si la implementación lo requiere; no compartirlo.
- Limitar el acceso a los datos según las responsabilidades de cada usuario.
- Definir manejo de errores, reintentos y auditoría antes de operar en producción.

## Decisiones pendientes

- Formato, ubicación y frecuencia de la fuente.
- Motor, esquema y estrategia de actualización del destino.
- Reglas de transformación, validación y tratamiento de duplicados.
- Entorno de ejecución y mecanismo de programación de cargas.