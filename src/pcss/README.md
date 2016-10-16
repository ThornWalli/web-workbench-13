# PCSS

## PureCSS

PureCSS Task for generate custom grid.

Features:

- `visible/hidden` classes
- `wrapper` class for main wrapper
- `offset` classes
- media variables | _example:_ `--screen-xs`

Config `tasks.json`

```
{
  "purecss": {
    "prefix": "grid",
    "columnHasPrefix": true,
    "columns": 12,
    "gutterWidth" : "0.9375rem",
    "columnPrefix": "col",
    "wrapperBreakpoints": ["md", "lg"],
    "breakpoints": {
      "xs": "30em",
      "sm": "48em",
      "md": "62em",
      "lg": "75em"
    },
    "files": {
      "dest": "./generated/pcss/",
      "src": ["base", "grids-core"]
    }
  }
}
```

### prefix

Type: `String`

Sets prefix for all generated classes.

### columnHasPrefix

Type: `Boolean`

Indicates whether the column get a prefix.

### columns

Type: `Number`

Sets the number of columns.

### columnPrefix

Type: `String`

Sets the prefix of columns.

_Required one Prefix._

### breakpoints

Type: `Object`

Sets the breakpoints that are required to generate the grid classes and media querys vars.

Property      | Value
------------- | -------------------------------------------------------
`gutterWidth` | _optional_
`width`       | _optional_
`wrapper`     | available properties: `overflow`, `margin`, `max-width`

```
"breakpoints": {
  "default": {
    "gutterWidth": "0.9375rem",
    "wrapper": {
      "overflow": "hidden"
    }
  },
  "xs": {
    "width": "30rem",
    "wrapper": {
      "margin": "auto",
      "max-width": "30rem"
    }
  },
  "sm": {
    "width": "48rem",
    "wrapper": {
      "max-width": "48rem"
    }
  },
  "md": {
    "width": "62rem",
    "wrapper": {
      "max-width": "62rem"
    }
  },
  "lg": {
    "width": "75rem",
    "wrapper": {
      "max-width": "75rem"
    }
  }
}
```

### files

Type: `Object`

Sets PureCSS files and destination path for generated files.

```
{
  "dest": "./generated/pcss/",
  "src": ["base", "grids-core"]
}
```

#### dest

Type: `String`

Destination for generated files.

#### src

Type: `Array`

Gives the files to prefix. Files comes from `purecss` _node_modules_.
