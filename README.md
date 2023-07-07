### deployment

```bash

docker pull ghcr.io/puppeteer/puppeteer:16.2.0 # pulls the image that contains Puppeteer v16.2.0
```

```bash
docker run -d -i --name yt_pptr  --init --cap-add=SYS_ADMIN  -p 8581:8581 --restart unless-stopped  ghcr.io/puppeteer/puppeteer:16.2.0 node -e "$(cat index.js)"
```
