FROM golang:1.19.2-alpine3.15

WORKDIR /clusterview
COPY clusterview clusterview
COPY build/ build/
CMD ./clusterview
