# 01. Propuesta: análisis de tendencias delictivas en Colombia

## Resumen

TAD-13 propone organizar y analizar datos abiertos de registros delictivos del
Sistema de Información Estadístico, Delincuencial, Contravencional y Operativo
(SIEDCO) en Colombia durante 2020–2026. Mediante un flujo reproducible de datos y
herramientas de análisis y visualización, el proyecto busca facilitar la exploración
de patrones temporales y territoriales, sin atribuirles causas automáticamente.

## Problema u oportunidad

La información publicada en archivos separados puede presentar diferencias de
estructura, denominación, cobertura y calidad. Esto dificulta compararla entre
periodos y territorios. Una preparación documentada y validada permitiría reunir
fuentes compatibles y hacer explícitos los límites de las comparaciones.

## Objetivo general

Diseñar e implementar un flujo reproducible para integrar, validar y analizar
registros abiertos SIEDCO de 2020–2026, y comunicar tendencias descriptivas de
forma trazable y accesible.

### Objetivos específicos

1. Identificar los conjuntos publicados, sus condiciones de uso y su cobertura.
2. Documentar y aplicar reglas de validación, normalización y carga.
3. Explorar los registros por año, territorio y categoría disponible, explicando
   cambios en la cobertura y en las definiciones que afecten la comparación.
4. Diseñar visualizaciones y documentación para interpretar y reproducir resultados.

## Fuentes de información

La fuente prevista son registros abiertos SIEDCO publicados por la Policía Nacional
u otras entidades oficiales. El [portal de datos abiertos de Colombia](https://www.datos.gov.co/)
es un punto de partida para localizar los conjuntos pertinentes. Los enlaces
específicos, los archivos, sus versiones y licencias están **pendientes de
verificación**; se registrarán junto con la fecha de consulta, la cobertura temporal
y geográfica, el diccionario de datos y cualquier cambio o revisión conocido.

La pizarra del proyecto menciona 34 delitos y 238 archivos XLS; estas cifras y la
disponibilidad de los archivos locales aún no se han verificado.
Los archivos originales se conservarán localmente en `data/raw/` y no se subirán a
Git. Cualquier fuente complementaria, por ejemplo para calcular tasas de población,
requiere aprobación y documentación independiente.

## Alcance

### Incluye

- Registros disponibles correspondientes a Colombia y al periodo 2020–2026,
  sujetos a la cobertura real de las fuentes seleccionadas.
- Inventario y trazabilidad de fuentes, validación de calidad y transformación
  documentada de los campos que resulten comparables.
- Diseño de una carga a PostgreSQL con PostGIS cuando se aprueben el modelo y las
  necesidades espaciales.
- Análisis descriptivo por periodos, territorios y categorías disponibles; diseño
  de visualizaciones y documentación de resultados y limitaciones.

### Fuera de alcance inicial

- Datos fuera de 2020–2026, fuentes o integraciones adicionales no aprobadas.
- Predicción, inferencia causal, identificación de personas o recomendaciones
  operativas automatizadas.
- Comparaciones o tasas que requieran denominadores o definiciones no verificados.

## Metodología propuesta

1. **Inventario:** localizar fuentes oficiales y registrar procedencia, licencias,
   versiones, cobertura y estructura de cada archivo.
2. **Exploración:** revisar hojas, columnas, tipos, valores faltantes, duplicados y
   diferencias de codificación o clasificación entre archivos.
3. **Preparación:** definir reglas de normalización y validación, conservar la
   trazabilidad al origen y registrar errores y exclusiones por archivo.
4. **Carga:** acordar el modelo y la estrategia de actualización, y cargar los
   registros válidos mediante un proceso verificable y repetible.
5. **Análisis:** producir indicadores descriptivos y comparaciones compatibles;
   documentar supuestos, cobertura, calidad y posibles cambios de registro.
6. **Comunicación:** presentar resultados mediante informes o visualizaciones,
   acompañados de metodología, fecha de actualización y limitaciones.

El stack previsto incluye Python con pandas y SQLAlchemy, PostgreSQL con PostGIS,
R y Python para análisis, y Streamlit o Dash y Power BI para visualización. La
implementación, las versiones y las decisiones finales están pendientes.

## Usuarios y beneficiarios

- Equipo de datos: preparación, validación, administración y análisis.
- Investigadores y responsables de consulta: exploración y revisión de resultados.
- Público interesado, si se habilita la publicación y se cumplen las condiciones
  de uso y privacidad de las fuentes.

## Equipo y responsabilidades

Los nombres y asignaciones están pendientes de confirmación. Se proponen los
siguientes roles; una persona puede asumir más de uno:

| Rol | Responsabilidad propuesta |
|---|---|
| Coordinación | Definir prioridades, alcance y aprobación de entregables. |
| Ingeniería de datos | Inventariar fuentes e implementar y documentar el ETL. |
| Análisis | Validar indicadores, analizar tendencias e interpretar limitaciones. |
| Visualización | Diseñar y verificar tableros o informes. |
| Revisión | Comprobar calidad, reproducibilidad, seguridad y condiciones de uso. |

## Criterios de aceptación propuestos

- Existe un inventario de las fuentes usadas con procedencia, fecha de consulta,
  cobertura y condiciones de uso verificadas.
- El proceso documenta sus dependencias y configuración, y registra resultados y
  errores sin exponer credenciales ni datos sensibles.
- Las reglas de validación, las exclusiones y los conteos de entrada y salida son
  verificables para cada carga; se explica cualquier diferencia.
- Los análisis y visualizaciones indican periodo, cobertura, definiciones y
  limitaciones; las comparaciones se hacen solo cuando los datos son compatibles.
- Una persona del equipo puede reproducir los resultados con las fuentes y la
  configuración autorizadas, siguiendo la documentación aprobada.

Estos criterios describen el objetivo de la implementación; no implican que ya se
hayan cumplido.

## Supuestos, riesgos y mitigaciones

| Riesgo o supuesto | Mitigación propuesta |
|---|---|
| Fuentes incompletas, revisadas o con cambios de estructura. | Registrar versiones y cobertura; validar cada archivo y documentar exclusiones. |
| Diferencias en categorías o territorios entre periodos. | Mantener reglas de homologación revisadas y limitar comparaciones no compatibles. |
| Subregistro o cambios en denuncia y registro. | Describir los datos como registros conocidos, no como el total de delitos ocurridos. |
| Datos sensibles o restricciones de uso. | Revisar contenido y licencias; minimizar datos y no publicar archivos no autorizados. |
| Duplicados o cargas repetidas. | Acordar identificadores y reglas de deduplicación y actualización antes de cargar. |
| Recursos y responsables aún no definidos. | Confirmar equipo, infraestructura y planificación antes de comprometer entregas. |

## Estado y próximos pasos

La documentación de arquitectura, base de datos y operación es preliminar; el
script ETL existente aún no realiza una carga. Existe un prototipo web con datos
sintéticos, nombre provisional y logo por definir; no representa cifras reales. Los siguientes pasos son confirmar
el equipo y las fuentes exactas, revisar una muestra autorizada, acordar reglas y
modelo de datos, y solo entonces implementar y probar el flujo.
