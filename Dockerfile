# ─────────────────────────────────────────────
#  Personal Dev Environment
#  Base  : Kali Linux (Rolling)
#  Stack : Node.js (LTS) + Python 3
#  Shell : Bash (with a nice prompt)
#  Tools : git, gh CLI, curl, wget, jq
# ─────────────────────────────────────────────
FROM kalilinux/kali-rolling

# Avoid interactive prompts during package install
ENV DEBIAN_FRONTEND=noninteractive

# ── 1. System packages ────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core utilities
    curl \
    wget \
    jq \
    git \
    ca-certificates \
    gnupg \
    # Python
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    # Build essentials (useful for pip packages with C extensions)
    build-essential \
    # Quality of life
    bash-completion \
    nano \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# ── 2. Node.js (LTS via NodeSource) ──────────
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# ── 3. GitHub CLI (gh) ────────────────────────
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
        | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] \
        https://cli.github.com/packages stable main" \
        > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update \
    && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# ── 4. Global npm packages ────────────────────
RUN npm install -g \
    npm@latest \
    # Useful JS dev tools
    nodemon \
    typescript \
    ts-node \
    prettier

# ── 5. Python global packages ─────────────────
RUN pip3 install --no-cache-dir --break-system-packages \
    ipython \
    black \
    ruff \
    httpx \
    requests

# ── 6. Create a non-root user (best practice) ─
ARG USERNAME=kalidev
ARG USER_UID=1000
ARG USER_GID=1000

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m -s /bin/bash $USERNAME

# ── 7. Nice Bash prompt (Kali-style red/purple) ─
RUN echo '\n\
# ── Prompt: user@host:dir (git branch) ──\n\
parse_git_branch() {\n\
  git branch 2>/dev/null | sed -n "s/* //p" | awk "{print \" (\"$0\")"}"\n\
}\n\
export PS1="\\[\\e[1;31m\\]\\u@\\h\\[\\e[0m\\]:\\[\\e[1;35m\\]\\w\\[\\e[1;33m\\]\\$(parse_git_branch)\\[\\e[0m\\]\\$ "\n\
\n\
# ── Handy aliases ──\n\
alias ll="ls -lah --color=auto"\n\
alias gs="git status"\n\
alias gl="git log --oneline --graph --all"\n\
alias py="python3"\n\
alias ipy="ipython"\n\
' >> /etc/bash.bashrc

# ── 8. Switch to non-root user ────────────────
USER $USERNAME
WORKDIR /home/$USERNAME/workspace

# ── 9. Verify installed versions at build time ─
RUN echo "=== Version Check ===" \
    && node --version \
    && npm --version \
    && python3 --version \
    && pip3 --version \
    && git --version \
    && gh --version \
    && curl --version | head -1 \
    && jq --version

# ── Default command: interactive bash ─────────
CMD ["bash"]
