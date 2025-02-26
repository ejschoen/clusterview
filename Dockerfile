FROM golang:1.24.0-alpine3.21 AS gobuilder

WORKDIR /clusterview
COPY go.* .
COPY *.go .
RUN go build .

FROM node:16-alpine3.15 AS jsbuilder

WORKDIR /clusterview
COPY ./ ./
RUN npm install -f package.json
RUN npm run build

FROM golang:1.19.2-alpine3.15
WORKDIR /clusterview
COPY --from=gobuilder /clusterview/clusterview clusterview
COPY --from=jsbuilder /clusterview/build/ ./build
CMD ./clusterview --host 0.0.0.0
