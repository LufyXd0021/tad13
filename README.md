# TAD-13

Proyecto de análisis de tendencias delictivas en Colombia a partir de datos abiertos
del Sistema de Información Estadístico, Delincuencial, Contravencional y Operativo
(SIEDCO), para el periodo **2020–2026**. La propuesta contempla integrar, validar y
analizar los datos para apoyar su exploración territorial y temporal.

> **Estado:** fase inicial de documentación. El ETL es un punto de entrada de
> ejemplo y no realiza cargas; el esquema de base de datos, los análisis y los
> tableros definitivos aún están pendientes. Existe un prototipo web con datos
> sintéticos, sin conexión a SIEDCO. Las fuentes concretas, sus permisos y sus versiones
> deben verificarse antes de utilizar los datos.

## Objetivos

- Organizar las fuentes disponibles y documentar su procedencia y cobertura.
- Diseñar un proceso reproducible de extracción, validación, transformación y carga.
- Explorar cambios en los registros por periodo, territorio y categoría de delito,
  según la disponibilidad y calidad de los datos.
- Facilitar la consulta y la comunicación de resultados, indicando sus limitaciones.

Consulta la [propuesta](docs/01-propuesta.md) para conocer el alcance, la
metodología, los riesgos y los criterios de aceptación propuestos.

## Tecnologías previstas

| Área | Herramientas previstas |
|---|---|
| Procesamiento y carga | Python, pandas y SQLAlchemy |
| Almacenamiento y análisis espacial | PostgreSQL y PostGIS |
| Análisis | R y Python |
| Visualización | Streamlit o Dash; Power BI |

Son decisiones previstas, no funcionalidades instaladas ni implementadas. Las
versiones, dependencias y la elección de la aplicación web están por definir.

## Estructura actual

```text
tad13/
├── README.md
├── .gitignore
├── docs/
│   ├── 01-propuesta.md
│   ├── 02-arquitectura.md
│   ├── 03-base-datos.md
│   └── 04-manual-usuario.md
└── src/
    ├── etl/
    │   └── cargar_datos.py
    └── web/
        ├── index.html
        ├── styles.css
        ├── data.js
        ├── app.js
        └── tests/
            └── data.test.mjs
```

Se prevén `data/raw/` para entradas locales, `data/processed/` para resultados,
`src/analytics/` para análisis y `dashboards/` para Power BI. Estas carpetas aún
no forman parte del repositorio; `src/web/` contiene el prototipo. La documentación de
arquitectura, base de datos y uso también es preliminar y deberá actualizarse al
aprobar el diseño.

## Fuentes y manejo de datos

La fuente prevista son datos abiertos SIEDCO publicados por la Policía Nacional u
otras entidades oficiales, por ejemplo a través del [portal de datos abiertos de
Colombia](https://www.datos.gov.co/). Antes de incorporarlos se deben identificar
los conjuntos exactos y registrar sus enlaces, fechas de consulta, cobertura,
licencias y posibles revisiones. La existencia y el número de archivos locales no
se han verificado en este repositorio.

Mantén los datos originales en `data/raw/` fuera de Git; toda esa carpeta está
excluida por `.gitignore`. No publiques credenciales ni archivos `.env`. Revisa la
sensibilidad, licencia y tamaño de cualquier dato procesado antes de compartirlo.
Las cifras registradas no equivalen necesariamente a todos los delitos ocurridos:
su interpretación depende, entre otros factores, de la denuncia y del registro.

## Prototipo web

El nombre y el logo están por definir. El tablero presenta **datos sintéticos**:
no son cifras reales y no permiten sacar conclusiones sobre la criminalidad.
Incluye filtros por año, departamento y categoría, indicadores y porcentajes,
descargas CSV de la selección simulada, documentación resumida y una sección sobre
el proyecto. La muestra territorial y las categorías son ilustrativas; 2026 también
es simulado. El asistente funciona localmente con respuestas predefinidas basadas
en los filtros: **no es una IA conectada**, no consulta fuentes externas y no envía
mensajes a ningún servidor. Una integración real requeriría diseño, configuración
y protección de datos adicionales.

Desde la raíz del repositorio, ejecuta en PowerShell:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abre `http://localhost:8000/src/web/` en tu navegador. Para detener el servidor,
pulsa `Ctrl+C`. No requiere instalar dependencias para el prototipo.

Para comprobar los cálculos, filtros y descargas con Node.js, ejecuta:

```powershell
node --test src/web/tests/data.test.mjs
```

## Ejecución del ETL

El archivo `src/etl/cargar_datos.py` todavía no implementa el procesamiento y termina
con un mensaje que indica que falta configuración. No hay instrucciones de carga
operativa ni dependencias fijadas por ahora. Consulta el
[manual de usuario](docs/04-manual-usuario.md) para el estado de la operación.

## Documentación

- [Propuesta](docs/01-propuesta.md): objetivos, alcance y metodología.
- [Arquitectura](docs/02-arquitectura.md): diseño preliminar del flujo.
- [Base de datos](docs/03-base-datos.md): diseño pendiente de aprobación.
- [Manual de usuario](docs/04-manual-usuario.md): preparación y operación pendientes.
