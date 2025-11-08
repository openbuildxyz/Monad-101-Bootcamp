 Monad DevNet on Apple Silicon (M1/M2/M3/M4)

This guide shows how to build and run **Monad DevNet** on macOS with Apple Silicon using Docker (amd64 emulation), so developers can test locally before deploying to Linux servers.

 Requirements
- macOS 13+ on Apple Silicon
- Docker Desktop for Mac
- Homebrew

 1) Install prerequisites
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install git make cmake llvm

(Ensure Docker Desktop is installed and running.)

2) Clone sources

git clone https://github.com/monad-crypto/protocols.git
cd protocols

3) Build with Docker (amd64)

docker buildx create --use --name monad-builder || true
docker buildx build \
  --platform linux/amd64 \
  -t monad/devnet:amd64 \
  -f Dockerfile .

4) Run DevNet

docker run --rm -it \
  -p 8545:8545 \
  -p 26657:26657 \
  -p 26656:26656 \
  monad/devnet:amd64

  When the container is up, JSON-RPC should be reachable at http://localhost:8545.

  5) Troubleshooting

QEMU emulation slow? Enable Docker “Use Rosetta for x86/amd64 emulation” and allocate more RAM/CPU.

Port already in use? Change exposed ports in docker run or stop other chains.

Homebrew LLVM path issues? Export CC/CXX to brewed clang if native build is attempted.

Notes

For production RPC we recommend Ubuntu 24.04 LTS on a dedicated server (see our separate Monitoring & Auto-Heal guide).

This guide focuses on a developer DevNet on macOS, not on public RPC.
