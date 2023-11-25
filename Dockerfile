FROM public.ecr.aws/lambda/nodejs:20.2023.11.10.20 AS base

RUN dnf -y install \
    git \
    unzip \
    libatomic \
 && dnf clean all

RUN mkdir -p /var/task

WORKDIR /var/task

FROM base AS build

RUN dnf -y install \
    curl-minimal \
    which \
    tar \
    make \
    zip \
 && dnf clean all

RUN cd /tmp \
  && curl https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o awscliv2.zip \
  && unzip -q awscliv2.zip \
  && ./aws/install \
  && rm -rf aws awscliv2.zip

RUN mkdir -p /www

WORKDIR /www

ENTRYPOINT ["/bin/sh", "-c"]

