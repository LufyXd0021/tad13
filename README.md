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
├── requirements.txt
├── docs/                       # Documentación preliminar
├── src/
│   ├── etl/cargar_datos.py     # ETL aún no implementado
│   ├── server/main.py          # Servidor web y puente a Gemini
│   └── web/                    # Páginas, gráficos y datos sintéticos
└── tests/                      # Pruebas del servidor
```

Se prevén `data/raw/` para entradas locales, `data/processed/` para resultados,
`src/analytics/` para análisis y `dashboards/` para Power BI. Estas carpetas aún
no forman parte del repositorio. La documentación de arquitectura, base de datos y
uso es preliminar y deberá actualizarse al aprobar el diseño.

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

## Prototipo web y asistente

El nombre y el logo están por definir. La aplicación tiene páginas independientes
para vista general, asistente, descargas, documentación y proyecto. Los filtros se
conservan durante la sesión del navegador y se aplican al tablero, a las descargas
y a la siguiente consulta del asistente.

**Todos los datos son sintéticos**: no son cifras reales ni provienen de SIEDCO.
La muestra territorial y las categorías son ilustrativas; 2026 también es simulado.

El servidor ofrece `POST /api/chat` y solicita respuestas a Gemini usando la
selección sintética calculada en el servidor. La pregunta y la selección se envían
a Google; no envíes información personal o sensible. Cada pregunta se procesa por
separado, sin historial conversacional. La IA puede equivocarse: revisa sus
respuestas y no las uses como evidencia sobre criminalidad real.

### Ejecución local (PowerShell)

Instala las dependencias y ejecuta el servidor desde la raíz del repositorio:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn src.server.main:app --host 127.0.0.1 --port 8000
```

Abre `http://localhost:8000/`. Para detenerlo, pulsa `Ctrl+C`. Sin configuración,
las páginas y descargas funcionan, pero el asistente informa que no está configurado.
Para habilitar Gemini, configura de forma segura la variable de entorno
`GEMINI_API_KEY` en el proceso servidor; no pegues la clave en el chat ni la subas al
repositorio. Opcionalmente, `GEMINI_MODEL` selecciona un modelo compatible; el valor
predeterminado es `gemini-2.5-flash`. La clave debe tener acceso a la API y puede
estar sujeta a cuotas o costos. No se requiere crear un archivo `.env`.

### Publicación y seguridad

GitHub Pages solo sirve archivos estáticos y **no puede ejecutar el backend**. Para
que el asistente funcione públicamente, aloja esta aplicación Python y la web en el
mismo servicio HTTPS, instala `requirements.txt`, configura `GEMINI_API_KEY` como
secreto del proveedor y arranca Uvicorn en `0.0.0.0` y el puerto que indique ese
proveedor. El navegador llama a `/api/chat` en el mismo origen; no recibe la clave.
La cuenta de alojamiento, el secreto y el despliegue aún no se han configurado.

El límite en memoria (8 solicitudes por minuto por cliente y 300 por día por
proceso) es solo una protección básica: se reinicia al reiniciar y no se comparte
entre réplicas; detrás de un proxy varios usuarios pueden compartir una dirección.
Antes de abrirlo al público, configura límites de cuota y facturación en Google,
control de acceso o protección contra abuso en el alojamiento, límites de tamaño
de petición y supervisión. No expongas datos reales sin revisar privacidad,
licencias y la política de tratamiento del proveedor.

### Pruebas

```powershell
python -m unittest discover -s tests -v
node --test src/web/tests/data.test.mjs
```

Las pruebas del servidor simulan Gemini; no verifican la clave ni la conectividad
real con Google.

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
