### deployment

```bash

docker pull ghcr.io/puppeteer/puppeteer:16.2.0 # pulls the image that contains Puppeteer v16.2.0
```

```bash
docker run -i --init --cap-add=SYS_ADMIN --rm ghcr.io/puppeteer/puppeteer:16.2.0 node -e "$(cat index.js)"
```
