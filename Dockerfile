FROM node:22-slim AS base

ARG FIREBASE_VERSION=13.30
ARG PNPM_VERSION=9.15
ARG JAVA_VERSION=17

# https://github.com/pnpm/pnpm/issues/4495#issuecomment-1317831712
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

RUN apt-get update && \
  apt-get install -y openjdk-${JAVA_VERSION}-jre bash && \
  npm install -g pnpm@${PNPM_VERSION} && \
  npm cache clean --force && \
  npm install -g @redux-devtools/cli \
  pnpm install -g firebase-tools@${FIREBASE_VERSION} typescript && \
  firebase -V && \
  java --version

FROM base AS development

# TODO(nickbar01234): non-root user needed?
# Currently need root access to run pnpm
ENTRYPOINT [ "entrypoint" ]
