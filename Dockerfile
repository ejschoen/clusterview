FROM golang:1.19.2-alpine3.15 AS builder

WORKDIR /clusterview
COPY clusterview clusterview
COPY go.* .
COPY *.go .
RUN go build .


FROM golang:1.19.2-alpine3.15
WORKDIR /clusterview
COPY --from=builder /clusterview/clusterview clusterview
COPY build/ ./build
CMD ./clusterview
