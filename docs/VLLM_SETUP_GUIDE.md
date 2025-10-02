# vLLM Setup Guide

## Overview

This guide explains how to set up and use vLLM for self-hosted AI in AuraOS. vLLM provides a fast, memory-efficient inference engine for running open-source LLMs locally.

## Benefits of vLLM

- ✅ **No API Costs** - Run models locally without paying per request
- ✅ **Privacy** - All data stays on your infrastructure
- ✅ **Offline Capable** - Works without internet connection
- ✅ **Customizable** - Fine-tune models for your specific needs
- ✅ **High Performance** - Optimized inference with PagedAttention
- ✅ **OpenAI Compatible** - Drop-in replacement for OpenAI API

## Prerequisites

### Hardware Requirements

**Minimum:**
- NVIDIA GPU with 8GB+ VRAM (e.g., RTX 3060, RTX 4060)
- 16GB System RAM
- 50GB free disk space

**Recommended:**
- NVIDIA GPU with 16GB+ VRAM (e.g., RTX 4080, RTX 4090, A100)
- 32GB System RAM
- 100GB free disk space (for multiple models)

**For Production:**
- NVIDIA A100 (40GB or 80GB)
- 64GB+ System RAM
- 500GB+ NVMe SSD

### Software Requirements

- Docker with NVIDIA Container Toolkit
- NVIDIA GPU drivers (version 525.60.13 or later)
- Docker Compose v2.0+

## Installation

### 1. Install NVIDIA Container Toolkit

**Ubuntu/Debian:**
```bash
# Add NVIDIA package repositories
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

# Install nvidia-container-toolkit
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# Restart Docker
sudo systemctl restart docker
```

**Verify Installation:**
```bash
# Test GPU access in Docker
docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and set:
```bash
# Use vLLM provider
AI_PROVIDER=vllm

# vLLM configuration
VLLM_URL=http://localhost:8000/v1
VLLM_MODEL=meta-llama/Llama-3.1-8B-Instruct

# Optional: For gated models
# HUGGING_FACE_HUB_TOKEN=your_token_here
```

### 3. Start vLLM Service

```bash
# Start vLLM in background
docker compose -f docker-compose.vllm.yml up -d

# View logs
docker compose -f docker-compose.vllm.yml logs -f

# Check status
docker compose -f docker-compose.vllm.yml ps
```

**First Run:** The first time you start vLLM, it will download the model (8-10GB for Llama 3.1 8B). This may take 10-30 minutes depending on your internet speed.

### 4. Verify vLLM is Running

```bash
# Check health endpoint
curl http://localhost:8000/health

# List available models
curl http://localhost:8000/v1/models

# Test completion
curl http://localhost:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-3.1-8B-Instruct",
    "prompt": "Hello, world!",
    "max_tokens": 50
  }'
```

### 5. Start AuraOS

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build

# Start UI
cd packages/ui
pnpm dev
```

The UI will automatically connect to vLLM at `http://localhost:8000/v1`.

## Supported Models

### Recommended Models

#### Llama 3.1 8B Instruct (Default)
- **Model:** `meta-llama/Llama-3.1-8B-Instruct`
- **VRAM:** 8-10GB
- **Quality:** Excellent
- **Speed:** Fast
- **Best for:** General purpose, balanced performance

#### Mistral 7B Instruct
- **Model:** `mistralai/Mistral-7B-Instruct-v0.3`
- **VRAM:** 7-9GB
- **Quality:** Very Good
- **Speed:** Very Fast
- **Best for:** Quick responses, resource-constrained systems

#### Qwen 2.5 7B Instruct
- **Model:** `Qwen/Qwen2.5-7B-Instruct`
- **VRAM:** 7-9GB
- **Quality:** Excellent for coding
- **Speed:** Fast
- **Best for:** Code generation, technical tasks

#### Phi-3 Mini
- **Model:** `microsoft/Phi-3-mini-4k-instruct`
- **VRAM:** 4-5GB
- **Quality:** Good
- **Speed:** Very Fast
- **Best for:** Low-resource systems, quick tasks

### Large Models (Requires More VRAM)

#### Llama 3.1 70B Instruct
- **Model:** `meta-llama/Llama-3.1-70B-Instruct`
- **VRAM:** 40-80GB (requires A100 or multiple GPUs)
- **Quality:** Excellent
- **Speed:** Moderate
- **Best for:** Complex reasoning, production deployments

## Changing Models

### Method 1: Edit docker-compose.vllm.yml

```yaml
command:
  - --model
  - mistralai/Mistral-7B-Instruct-v0.3  # Change this line
  # ... rest of config
```

Then restart:
```bash
docker compose -f docker-compose.vllm.yml restart
```

### Method 2: Environment Variable

Edit `.env`:
```bash
VLLM_MODEL=mistralai/Mistral-7B-Instruct-v0.3
```

Restart vLLM:
```bash
docker compose -f docker-compose.vllm.yml down
docker compose -f docker-compose.vllm.yml up -d
```

## Performance Tuning

### GPU Memory Utilization

Adjust in `docker-compose.vllm.yml`:
```yaml
command:
  - --gpu-memory-utilization
  - "0.9"  # Use 90% of GPU memory (default)
```

Lower values (0.7-0.8) leave more memory for other processes.

### Max Model Length

Control context window size:
```yaml
command:
  - --max-model-len
  - "8192"  # Maximum tokens (default: model's max)
```

Smaller values use less memory but limit context.

### Tensor Parallelism

For multiple GPUs:
```yaml
command:
  - --tensor-parallel-size
  - "2"  # Number of GPUs to use
```

### Quantization

Use quantized models for lower memory usage:
```yaml
command:
  - --model
  - TheBloke/Llama-2-7B-Chat-GPTQ  # Quantized model
  - --quantization
  - gptq
```

## Troubleshooting

### Issue: "CUDA out of memory"

**Solutions:**
1. Reduce GPU memory utilization:
   ```yaml
   - --gpu-memory-utilization
   - "0.7"
   ```

2. Reduce max model length:
   ```yaml
   - --max-model-len
   - "4096"
   ```

3. Use a smaller model (e.g., Phi-3 Mini)

4. Use quantized models

### Issue: "Model download is slow"

**Solutions:**
1. Use a mirror:
   ```bash
   export HF_ENDPOINT=https://hf-mirror.com
   ```

2. Download model manually:
   ```bash
   huggingface-cli download meta-llama/Llama-3.1-8B-Instruct
   ```

### Issue: "vLLM container won't start"

**Check:**
1. GPU drivers:
   ```bash
   nvidia-smi
   ```

2. Docker GPU access:
   ```bash
   docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi
   ```

3. Container logs:
   ```bash
   docker compose -f docker-compose.vllm.yml logs
   ```

### Issue: "Connection refused to localhost:8000"

**Solutions:**
1. Check if vLLM is running:
   ```bash
   docker compose -f docker-compose.vllm.yml ps
   ```

2. Wait for initialization (first run takes time)

3. Check health endpoint:
   ```bash
   curl http://localhost:8000/health
   ```

### Issue: "Tool calling not working"

**Ensure these flags are set:**
```yaml
command:
  - --enable-auto-tool-choice
  - --tool-call-parser
  - hermes
```

## Advanced Configuration

### Custom System Prompt

Edit in `packages/ai/src/vllm-assistant.ts`:
```typescript
this.systemPrompt = `Your custom system prompt here...`;
```

### Multiple vLLM Instances

Run different models on different ports:

**docker-compose.vllm-small.yml:**
```yaml
services:
  vllm-small:
    # ... config
    ports:
      - "8001:8000"
    command:
      - --model
      - microsoft/Phi-3-mini-4k-instruct
```

**docker-compose.vllm-large.yml:**
```yaml
services:
  vllm-large:
    # ... config
    ports:
      - "8002:8000"
    command:
      - --model
      - meta-llama/Llama-3.1-70B-Instruct
```

Then configure different assistants:
```typescript
const smallAssistant = new VLLMAIAssistant(gateway, 'http://localhost:8001/v1');
const largeAssistant = new VLLMAIAssistant(gateway, 'http://localhost:8002/v1');
```

### Load Balancing

Use nginx to load balance across multiple vLLM instances:

**nginx.conf:**
```nginx
upstream vllm_backend {
    server localhost:8001;
    server localhost:8002;
    server localhost:8003;
}

server {
    listen 8000;
    location / {
        proxy_pass http://vllm_backend;
    }
}
```

## Monitoring

### Check GPU Usage

```bash
# Real-time monitoring
watch -n 1 nvidia-smi

# Or use nvtop
sudo apt install nvtop
nvtop
```

### Check vLLM Metrics

```bash
# Request statistics
curl http://localhost:8000/metrics

# Model info
curl http://localhost:8000/v1/models
```

### Docker Stats

```bash
docker stats auraos-vllm
```

## Production Deployment

### 1. Use Docker Swarm or Kubernetes

**Docker Swarm:**
```bash
docker stack deploy -c docker-compose.vllm.yml auraos
```

**Kubernetes:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: vllm
        image: vllm/vllm-openai:latest
        resources:
          limits:
            nvidia.com/gpu: 1
```

### 2. Add Monitoring

Use Prometheus + Grafana:
```yaml
services:
  vllm:
    # ... existing config
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=8000"
      - "prometheus.path=/metrics"
```

### 3. Add Load Balancer

Use Traefik or nginx for load balancing and SSL.

### 4. Set Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '8'
      memory: 32G
    reservations:
      cpus: '4'
      memory: 16G
```

## Cost Comparison

### Anthropic Claude (Cloud)

- **Cost:** $3-15 per million tokens
- **Monthly (1M tokens):** $3-15
- **Annual:** $36-180

### vLLM (Self-Hosted)

- **Hardware:** $500-2000 (one-time, GPU)
- **Electricity:** ~$20-50/month (24/7 operation)
- **Annual:** $240-600 (after hardware)

**Break-even:** 2-6 months for moderate usage

## Next Steps

- [AI Integration Guide](./AI_INTEGRATION_GUIDE.md) - Using AI in your code
- [MCP Usage Guide](./MCP_USAGE_GUIDE.md) - Working with MCP tools
- [UI Integration Guide](./UI_INTEGRATION_GUIDE.md) - Building UI components

## Support

For issues or questions:
- GitHub Issues: https://github.com/Moeabdelaziz007/AuraOS-Monorepo/issues
- vLLM Documentation: https://docs.vllm.ai
- vLLM GitHub: https://github.com/vllm-project/vllm
