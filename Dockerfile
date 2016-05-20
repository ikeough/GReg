FROM debian:jessie
MAINTAINER dynamo@autodesk.com

# Install curl to enable installing nodejs
RUN apt-get update -y && apt-get install -y curl && curl -sL https://deb.nodesource.com/setup_5.x | bash - && rm -rf /var/lib/apt/lists/*

# Install nodejs
RUN apt-get update -y && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

# Copy the npm setup file and run it.
RUN mkdir /Package-Service
WORKDIR /Package-Service/
COPY /package.json .
RUN npm install

# Copy the rest of the code.
COPY / . 

# Create the user to run the command
RUN useradd -ms /bin/bash node
RUN cd && cp -R .bashrc .profile /home/node
RUN chown -R node:node /home/node
RUN chown node:node .
RUN chown node:node /packages
USER node

# Create a volume to use to access the SSL Certificates from the Docker host
VOLUME /ssl

# Set the entrypoint executable, can be overridden on
# the command line with --entrypoint foo
ENTRYPOINT ["/usr/bin/node", "bin/www"]

# Label contains the information about the git commit used to build this file
ARG git_info
ARG build_agent_info=manual
LABEL git_info=$git_info build_agent_info=$build_agent_info

