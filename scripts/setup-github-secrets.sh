#!/bin/bash

# Script para configurar os secrets do GitHub via CLI
# Requer: gh (GitHub CLI) instalado

echo "===== Configuração de Secrets do GitHub ====="
echo ""

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado."
    echo ""
    echo "Para instalar:"
    echo "  - Windows: winget install GitHub.cli"
    echo "  - macOS: brew install gh"
    echo "  - Linux: https://github.com/cli/cli#installation"
    echo ""
    exit 1
fi

# Verificar autenticação
if ! gh auth status &> /dev/null; then
    echo "❌ Você não está autenticado no GitHub CLI."
    echo ""
    echo "Execute: gh auth login"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI detectado e autenticado"
echo ""

# Solicitar informações
echo "Por favor, forneça as seguintes informações:"
echo ""

read -p "VPS Host [69.6.221.123]: " VPS_HOST
VPS_HOST=${VPS_HOST:-69.6.221.123}

read -p "VPS Port [22022]: " VPS_PORT
VPS_PORT=${VPS_PORT:-22022}

read -p "VPS Username [root]: " VPS_USERNAME
VPS_USERNAME=${VPS_USERNAME:-root}

read -sp "VPS Password: " VPS_PASSWORD
echo ""

if [ -z "$VPS_PASSWORD" ]; then
    echo "❌ Senha é obrigatória!"
    exit 1
fi

echo ""
echo "===== Resumo das Configurações ====="
echo "Host: $VPS_HOST"
echo "Port: $VPS_PORT"
echo "Username: $VPS_USERNAME"
echo "Password: ********"
echo ""

read -p "Confirma as informações acima? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo "Operação cancelada."
    exit 0
fi

echo ""
echo "Configurando secrets no GitHub..."
echo ""

# Configurar secrets
gh secret set VPS_HOST -b"$VPS_HOST"
echo "✅ VPS_HOST configurado"

gh secret set VPS_PORT -b"$VPS_PORT"
echo "✅ VPS_PORT configurado"

gh secret set VPS_USERNAME -b"$VPS_USERNAME"
echo "✅ VPS_USERNAME configurado"

gh secret set VPS_PASSWORD -b"$VPS_PASSWORD"
echo "✅ VPS_PASSWORD configurado"

echo ""
echo "===== Secrets Configurados com Sucesso! ====="
echo ""
echo "Próximos passos:"
echo "1. Execute o setup no VPS: bash scripts/setup-vps.sh"
echo "2. Faça push para o branch main: git push origin main"
echo "3. Acompanhe o deploy em: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
echo ""
