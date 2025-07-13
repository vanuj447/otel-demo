FROM alpine:latest
RUN apk add --no-cache curl
CMD sh -c 'while true; do curl -s app:8080/ > /dev/null; curl -s app:8080/slow > /dev/null; curl -s app:8080/error > /dev/null; sleep 0.2; done'
