import React from "react";

// Função auxiliar genérica para buscar dados de QUALQUER banco do Notion
async function fetchNotionDb(databaseId: string | undefined, token: string) {
  if (!databaseId) return [];

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        // cache: 'no-store' // Remova o comentário se quiser atualizar na mesma hora sem cache do Next.js
      },
    );

    if (!response.ok) {
      console.error(`Erro no DB ${databaseId}:`, await response.text());
      return [];
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Falha na requisição do DB ${databaseId}:`, error);
    return [];
  }
}

// A função Mestra que coordena todas as buscas
async function getAllNotionData() {
  const token = process.env.NOTION_SECRET?.trim();

  if (!token) {
    throw new Error("Faltou configurar NOTION_SECRET no .env.local");
  }

  // 1. Pegamos os 4 IDs do .env.local
  const dbBoxId = process.env.NOTION_DB_BOX?.trim();
  const dbSmtpId = process.env.NOTION_DB_SMTP?.trim();
  const dbExtrasId = process.env.NOTION_DB_EXTRAS?.trim();
  const dbUpgradesId = process.env.NOTION_DB_UPGRADES?.trim();

  // 2. Fazemos as 4 requisições em PARALELO (muito mais rápido que uma por uma)
  const [boxResults, smtpResults, extrasResults, upgradesResults] =
    await Promise.all([
      fetchNotionDb(dbBoxId, token),
      fetchNotionDb(dbSmtpId, token),
      fetchNotionDb(dbExtrasId, token),
      fetchNotionDb(dbUpgradesId, token),
    ]);

  // 3. Formatamos o MEILE BOX
  const boxData = boxResults.map((page: any) => ({
    id: page.id,
    capacidade: page.properties["Capacidade"]?.title[0]?.plain_text || "N/A",
    custoFixo: page.properties["Custo Unitário Fixo"]?.number || 0,
    baseSugerida: page.properties["Base Sugerida"]?.number || 0,
    puloSugerido: page.properties["Pulo Sugerido"]?.number || 0,
  }));

  // 4. Formatamos o SMTP & MKT
  const smtpData = smtpResults.map((page: any) => ({
    id: page.id,
    plano: page.properties["Plano / Volume"]?.title[0]?.plain_text || "N/A",
    categoria: page.properties["Categoria"]?.select?.name || "N/A",
    custoRevenda: page.properties["Custo Revenda"]?.number || 0,
    valorSugerido: page.properties["Valor Sugerido"]?.number || 0,
  }));

  // 5. Formatamos os RECURSOS EXTRAS
  const extrasData = extrasResults.map((page: any) => ({
    id: page.id,
    servico: page.properties["Serviço"]?.title[0]?.plain_text || "N/A",
    custoRevenda: page.properties["Custo Revenda"]?.number || 0,
    valorSugerido: page.properties["Valor Sugerido"]?.number || 0,
    tipoCobranca: page.properties["Tipo de Cobrança"]?.select?.name || "N/A",
  }));

  // 6. Formatamos os UPGRADES (Lendo as colunas de tempo)
  const upgradesData = upgradesResults.map((page: any) => ({
    id: page.id,
    tamanho: page.properties["Tamanho"]?.title[0]?.plain_text || "N/A",
    mes1: page.properties["1 Mês"]?.number || 0,
    meses3: page.properties["3 Meses"]?.number || 0,
    ano1: page.properties["1 Ano"]?.number || 0,
    anos2: page.properties["2 Anos"]?.number || 0,
    anos10: page.properties["10 Anos"]?.number || 0,
  }));

  return { boxData, smtpData, extrasData, upgradesData };
}

// ==========================================
// COMPONENTE DA PÁGINA (UI)
// ==========================================
export default async function TesteNotionSandbox() {
  const { boxData, smtpData, extrasData, upgradesData } =
    await getAllNotionData();

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold mb-2">🧪 Multi-Bancos: Notion</h1>
          <p className="text-slate-500">
            Lendo os 4 bancos de dados em tempo real da Revenda Meile.
          </p>
        </header>

        {/* TABELA 1: MEILE BOX */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 text-white p-4 font-bold flex justify-between">
            <span>📦 Dados: Meile Box</span>
            <span className="text-indigo-200 text-sm font-normal">
              {boxData.length} itens
            </span>
          </div>
          {boxData.length === 0 ? (
            <p className="p-4 text-red-500">
              Verifique o NOTION_DB_BOX e as conexões da página.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-sm">
                    <th className="p-4 font-semibold">Capacidade</th>
                    <th className="p-4 font-semibold">Custo Fixo</th>
                    <th className="p-4 font-semibold">Base Sugerida</th>
                    <th className="p-4 font-semibold">Pulo Sugerido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {boxData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium">{item.capacidade}</td>
                      <td className="p-4 text-emerald-600">
                        R$ {item.custoFixo.toFixed(2)}
                      </td>
                      <td className="p-4 text-blue-600">
                        R$ {item.baseSugerida.toFixed(2)}
                      </td>
                      <td className="p-4 text-purple-600">
                        R$ {item.puloSugerido.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* TABELA 2: SMTP & MKT */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 text-white p-4 font-bold flex justify-between">
            <span>📧 Dados: SMTP & Marketing</span>
            <span className="text-indigo-200 text-sm font-normal">
              {smtpData.length} itens
            </span>
          </div>
          {smtpData.length === 0 ? (
            <p className="p-4 text-red-500">
              Verifique o NOTION_DB_SMTP e as conexões da página.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-sm">
                    <th className="p-4 font-semibold">Plano / Volume</th>
                    <th className="p-4 font-semibold">Categoria</th>
                    <th className="p-4 font-semibold">Custo Revenda</th>
                    <th className="p-4 font-semibold">Valor Sugerido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {smtpData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium">{item.plano}</td>
                      <td className="p-4">
                        <span className="bg-slate-200 px-2 py-1 rounded text-xs">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="p-4 text-emerald-600">
                        R$ {item.custoRevenda.toFixed(2)}
                      </td>
                      <td className="p-4 text-blue-600">
                        R$ {item.valorSugerido.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* TABELA 3: RECURSOS EXTRAS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 text-white p-4 font-bold flex justify-between">
            <span>✨ Dados: Recursos Extras</span>
            <span className="text-indigo-200 text-sm font-normal">
              {extrasData.length} itens
            </span>
          </div>
          {extrasData.length === 0 ? (
            <p className="p-4 text-red-500">
              Verifique o NOTION_DB_EXTRAS e as conexões da página.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-sm">
                    <th className="p-4 font-semibold">Serviço</th>
                    <th className="p-4 font-semibold">Custo Revenda</th>
                    <th className="p-4 font-semibold">Valor Sugerido</th>
                    <th className="p-4 font-semibold">Tipo de Cobrança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {extrasData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium">{item.servico}</td>
                      <td className="p-4 text-emerald-600">
                        R$ {item.custoRevenda.toFixed(2)}
                      </td>
                      <td className="p-4 text-blue-600">
                        R$ {item.valorSugerido.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded text-xs font-semibold">
                          {item.tipoCobranca}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* TABELA 4: UPGRADES */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 text-white p-4 font-bold flex justify-between">
            <span>⬆️ Dados: Upgrades de Caixa Postal</span>
            <span className="text-indigo-200 text-sm font-normal">
              {upgradesData.length} itens
            </span>
          </div>
          {upgradesData.length === 0 ? (
            <p className="p-4 text-red-500">
              Verifique o NOTION_DB_UPGRADES e as conexões da página.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-sm">
                    <th className="p-4 font-semibold text-left">Tamanho</th>
                    <th className="p-4 font-semibold">1 Mês</th>
                    <th className="p-4 font-semibold">3 Meses</th>
                    <th className="p-4 font-semibold">1 Ano</th>
                    <th className="p-4 font-semibold">2 Anos</th>
                    <th className="p-4 font-semibold">10 Anos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {upgradesData.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 text-emerald-600"
                    >
                      <td className="p-4 font-bold text-slate-800 text-left">
                        {item.tamanho}
                      </td>
                      <td className="p-4">R$ {item.mes1.toFixed(2)}</td>
                      <td className="p-4">R$ {item.meses3.toFixed(2)}</td>
                      <td className="p-4">R$ {item.ano1.toFixed(2)}</td>
                      <td className="p-4">R$ {item.anos2.toFixed(2)}</td>
                      <td className="p-4">R$ {item.anos10.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
