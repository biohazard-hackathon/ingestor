Biohazard Ingestor
--------------

Takes care of XLSX document parsing and conversion.

## Requirements
- Docker

Both installation and running is recommended to do inside docker container.
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Test

```bash
docker compose run ingestor npm test
```
