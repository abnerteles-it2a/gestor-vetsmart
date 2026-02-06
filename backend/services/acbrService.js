import net from 'net';

class AcbrService {
    constructor(host = '127.0.0.1', port = 3434) {
        this.host = host;
        this.port = port;
    }

    /**
     * Envia um comando para o ACBrMonitorPLUS e aguarda a resposta
     * @param {string} command - Ex: NFE.StatusServico
     * @returns {Promise<string>}
     */
    async sendCommand(command) {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            let response = '';

            // Conecta ao ACBrMonitor
            client.connect(this.port, this.host, () => {
                console.log(`📡 Enviando comando ao ACBr: ${command}`);
                // Adiciona quebra de linha (CRLF) que o ACBr exige
                client.write(command + '\r\n.\r\n');
            });

            client.on('data', (data) => {
                response += data.toString();
                // O ACBr geralmente termina a resposta com algo identificável, 
                // mas para simplificar, vamos fechar após receber dados neste MVP
                client.end();
            });

            client.on('close', () => {
                console.log('✅ Resposta ACBr recebida');
                resolve(this.parseResponse(response));
            });

            client.on('error', (err) => {
                console.error('❌ Erro na conexão com ACBr:', err.message);
                reject(err);
            });
        });
    }

    parseResponse(rawResponse) {
        // Limpa a resposta crua do ACBr para pegar apenas o conteúdo útil
        // Exemplo de resposta: "OK: Serviço em Operação"
        return rawResponse.trim();
    }

    // --- Métodos de Negócio ---

    async verificarStatusServico() {
        return this.sendCommand('NFE.StatusServico');
    }

    async emitirNFe(venda, tutor, produtos) {
        // 1. Monta o INI (Formato de comando do ACBr)
        // Isso é muito mais simples que montar XML
        const iniCommand = `
NFE.CriarEnviarNFe("
[Identificacao]
NaturezaOperacao=Venda de Mercadorias
Modelo=55
Serie=1
Codigo=${venda.id}
Numero=${venda.id}
Emissao=${new Date().toLocaleDateString('pt-BR')}
Saida=${new Date().toLocaleDateString('pt-BR')}
Tipo=1
Finalidade=1

[Destinatario]
CNPJCPF=${tutor.cpf}
Nome=${tutor.name}
Endereco=${tutor.address || 'Rua nao informada'}
; ... outros campos ...

[Produto001]
Codigo=123
Descricao=Vacina V10
NCM=30023090
CFOP=5102
Unidade=UN
Quantidade=1
ValorUnitario=80.00
ValorTotal=80.00
")`;

        return this.sendCommand(iniCommand);
    }
}

export const acbrService = new AcbrService();
