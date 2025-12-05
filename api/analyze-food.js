// Serverless Function - Proxy para N8N
// Isso evita problemas de CORS

export default async function handler(req, res) {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1121163.hstgr.cloud/webhook/analyze-food';
        
        console.log('Enviando para N8N:', N8N_WEBHOOK_URL);
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro N8N:', response.status, errorText);
            return res.status(response.status).json({ 
                error: 'N8N error', 
                status: response.status,
                details: errorText 
            });
        }

        const data = await response.json();
        console.log('Resposta N8N:', JSON.stringify(data).substring(0, 200));
        
        return res.status(200).json(data);
        
    } catch (error) {
        console.error('Erro no proxy:', error);
        return res.status(500).json({ 
            error: 'Proxy error', 
            message: error.message 
        });
    }
}
