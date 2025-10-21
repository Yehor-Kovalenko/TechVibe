# DEVELOPMENT

## Global requirements:
- Python 3.10+
- Docker
- Azure Functions Core (start azure functions)

follow instructions to install:
[Azurite-Margarite](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=linux%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-python)
- Azurite (local cloud - storage and queue) - mount on docker

```bash
docker pull mcr.microsoft.com/azure-storage/azurite
```

- Azure Storage Explorer (peek view for storage and queue)

follow instructions to install:
[Another Azury linky](https://azure.microsoft.com/en-us/products/storage/storage-explorer/#Download-4)

Then connect locally: "Attach to a local emulator" on default values.

---
## Run in Docker
1. Navigate to the root folder
2. Run with frontend service: `docker-compose --profile frontend up --build`
3. run without the frontend service: `docker-compose up --build`

Everything is expose nicely, ports:
> - Frontend 8080
> - Backend 7071

---

## Run locally

### Run azurite

```bash
docker run -p 10000:10000 -p 10001:10001 -p 10002:10002 mcr.microsoft.com/azure-storage/azurite
```

### Run functions

```bash
cd functions
python3 -m venv .venv
chmod a+x ./.venv/bin/activate
source ./.venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
func start
```

### Test storage and queue
```bash
curl -X POST http://localhost:7071/api/downloader -d @body.json -v
```
After this you should see new file in Storage Explorer: local-1/BlobContainer/results
