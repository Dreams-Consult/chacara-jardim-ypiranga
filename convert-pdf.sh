#!/bin/bash

# Script para converter PDF em imagem de alta qualidade para usar na plataforma

PDF_PATH="/home/maiasb/codes/dreams/teste-chacara-copilot/lot-mapping-platform/NOVO PROJETO REVISADO 02 IMAGEM -Model.pdf"
OUTPUT_DIR="./public/maps"
OUTPUT_NAME="chacara-mapa"

echo "🔄 Convertendo PDF para imagem..."

# Criar diretório se não existir
mkdir -p "$OUTPUT_DIR"

# Converter PDF para PNG de alta resolução
# -png: formato PNG
# -r 300: 300 DPI (alta qualidade)
# -singlefile: uma única imagem
pdftoppm -png -r 300 -singlefile "$PDF_PATH" "$OUTPUT_DIR/$OUTPUT_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Conversão concluída!"
    echo "📁 Arquivo salvo em: $OUTPUT_DIR/$OUTPUT_NAME.png"
    echo ""
    echo "📝 Próximo passo:"
    echo "   1. Acesse http://localhost:3000/admin/maps"
    echo "   2. Clique em 'Novo Mapa'"
    echo "   3. Faça upload do arquivo: $OUTPUT_DIR/$OUTPUT_NAME.png"
else
    echo "❌ Erro na conversão!"
    echo ""
    echo "💡 Alternativas:"
    echo "   1. Instale o pdftoppm: sudo apt install poppler-utils"
    echo "   2. Use uma ferramenta online para converter PDF → PNG"
    echo "   3. Tire um screenshot do PDF em alta resolução"
fi
