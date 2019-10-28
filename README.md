# Marketing API

Create your own email marketing API like Mailchimp of MarketHero but you don't have to pay!

This email marketing service has basic functionality of a email marketing service such as sending HTML and text emails using flows.

## Getting Started

### Using Docker Compose

---

> NOTE: Make sure that port `5000` is open on your host machine or you can change the port in the `docker-compose.yml` file

---

Before you can start the service using docker compose you must replace the values `${SMTP_USER}` and `${SMTP_PASSWORD}` with the email and password for your SMTP server in the `docker-compose.yml` file.

To start the marketing API using docker compose, simply run the following commands

```
git clone https://github.com/noahchalifour/marketing-api
cd marketing-api
docker-compose up -d
```

## API Documentation

You can find the API documentation [here](https://documenter.getpostman.com/view/7752677/SVzz1deN?version=latest)

## Author

Noah Chalifour (chalifournoah@gmail.com)