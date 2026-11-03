# TAD-13

Proyecto de gestión y procesamiento de datos. Este repositorio reúne la propuesta,
la arquitectura, el diseño de la base de datos, el manual de usuario y el código
del proceso ETL.

> **Estado:** estructura inicial. Completa los detalles del caso de uso, las fuentes
> de datos y el esquema antes de ejecutar una carga real.

## Documentación

- [Propuesta](docs/01-propuesta.md): objetivo, alcance y usuarios.
- [Arquitectura](docs/02-arquitectura.md): componentes y flujo de datos.
- [Base de datos](docs/03-base-datos.md): modelo y esquema SQL.
- [Manual de usuario](docs/04-manual-usuario.md): instalación y operación.

## Código fuente

El punto de entrada previsto para el proceso de extracción, transformación y carga
se encuentra en `src/etl/cargar_datos.py`.

## Estructura

```text
tad13/
├── README.md
├── docs/
│   ├── 01-propuesta.md
│   ├── 02-arquitectura.md
│   ├── 03-base-datos.md
│   └── 04-manual-usuario.md
├── src/
│   └── etl/
│       └── cargar_datos.py
└── .gitignore
```

## Datos y configuración

No agregues datos crudos ni credenciales al repositorio. Consulta `.gitignore` para
ver las rutas excluidas y utiliza variables de entorno para la configuración
privada.