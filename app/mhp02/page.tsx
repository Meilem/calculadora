// Arquivo: src/app/mhp02/page.tsx
export const dynamic = "force-dynamic";
import React from "react";
import Calculadora, { EmailPlan } from "../../components/Calculadora";

// Tipagens para o retorno da API do Notion
type NotionProperty = {
  title?: Array<{ plain_text: string }>;
  rich_text?: Array<{ plain_text: string }>;
  number?: number;
  select?: { name: string };
  date?: { start: string; end?: string };
  type?: string;
};

type NotionPage = {
  id: string;
  properties: Record<string, NotionProperty>;
};

// ==========================================
// 1. FUNÇÕES DE BUSCA NO NOTION (SERVER-SIDE)
// ==========================================

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
        cache: "no-store",
      },
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Falha na requisição do DB ${databaseId}:`, error);
    return [];
  }
}
async function getAllNotionData() {
  const token = process.env.NOTION_SECRET?.trim();
  if (!token) throw new Error("Faltou configurar NOTION_SECRET no .env.local");

  const dbBoxId = process.env.NOTION_DB_BOX?.trim();
  const dbSmtpId = process.env.NOTION_DB_SMTP?.trim();
  const dbExtrasId = process.env.NOTION_DB_EXTRAS?.trim();
  const dbUpgradesId = process.env.NOTION_DB_UPGRADES?.trim();
  const dbValidadeId = process.env.NOTION_DB_VALIDADE?.trim();

  // NOVO: Pegando a tabela de E-mails do MHP01
  const dbEmailId = process.env.NOTION_DB_EMAIL_02?.trim();

  // AQUI: Pegando a tabela de Valores Base
  const dbValoresBaseId = process.env.NOTION_DB_VALORES_BASE?.trim();

  // Busca os bancos em paralelo
  const [
    boxResults,
    smtpResults,
    extrasResults,
    upgradesResults,
    validadeResults,
    emailResults, // Resultado dos e-mails
    valoresBaseResults, // Resultado da matriz de Valores Base
  ] = await Promise.all([
    fetchNotionDb(dbBoxId, token),
    fetchNotionDb(dbSmtpId, token),
    fetchNotionDb(dbExtrasId, token),
    fetchNotionDb(dbUpgradesId, token),
    fetchNotionDb(dbValidadeId, token),
    fetchNotionDb(dbEmailId, token),
    fetchNotionDb(dbValoresBaseId, token), // Adicionado o fetch da nova tabela
  ]);

  // --- DEMAIS DADOS ---
  const boxData = boxResults.map((page: NotionPage) => ({
    id: page.id,
    capacidade: page.properties["Capacidade"]?.title?.[0]?.plain_text || "N/A",
    custoFixo: page.properties["Custo Unitário Fixo"]?.number || 0,
    baseSugerida: page.properties["Base Sugerida"]?.number || 0,
    puloSugerido: page.properties["Pulo Sugerido"]?.number || 0,
  }));

  const smtpData = smtpResults.map((page: NotionPage) => ({
    id: page.id,
    plano: page.properties["Plano / Volume"]?.title?.[0]?.plain_text || "N/A",
    categoria: page.properties["Categoria"]?.select?.name || "N/A",
    custoRevenda: page.properties["Custo Revenda"]?.number || 0,
    valorSugerido: page.properties["Valor Sugerido"]?.number || 0,
  }));

  const extrasData = extrasResults.map((page: NotionPage) => ({
    id: page.id,
    servico: page.properties["Serviço"]?.title?.[0]?.plain_text || "N/A",
    custoRevenda: page.properties["Custo Revenda"]?.number || 0,
    valorSugerido: page.properties["Valor Sugerido"]?.number || 0,
    tipoCobranca: page.properties["Tipo de Cobrança"]?.select?.name || "N/A",
  }));

  const upgradesData = upgradesResults.map((page: NotionPage) => ({
    id: page.id,
    tamanho: page.properties["Tamanho"]?.title?.[0]?.plain_text || "N/A",
    mes1: page.properties["1 Mês"]?.number || 0,
    meses3: page.properties["3 Meses"]?.number || 0,
    ano1: page.properties["1 Ano"]?.number || 0,
    anos2: page.properties["2 Anos"]?.number || 0,
    anos10: page.properties["10 Anos"]?.number || 0,
  }));

  // --- VALIDADE ---
  let textoValidade = "Valores Dinâmicos (Ao Vivo)";
  if (validadeResults && validadeResults.length > 0) {
    const page = validadeResults[0];
    const titlePropKey = Object.keys(page.properties).find(
      (key) => page.properties[key].type === "title",
    );
    const textoInicial =
      titlePropKey && page.properties[titlePropKey].title.length > 0
        ? page.properties[titlePropKey].title[0].plain_text
        : "Valores Válidos até";

    const datePropKey = Object.keys(page.properties).find(
      (key) => page.properties[key].type === "date",
    );
    const dataIso = datePropKey
      ? page.properties[datePropKey].date?.start
      : null;

    if (dataIso) {
      const [ano, mes, dia] = dataIso.split("-");
      textoValidade = `${textoInicial.trim()} ${dia}/${mes}/${ano}`;
    } else {
      textoValidade = textoInicial;
    }
  }

  // --- NOVO: PLANOS DE E-MAIL DINÂMICOS ---
  const emailData: EmailPlan[] = emailResults
    .map((page: NotionPage) => {
      // Tenta ler a coluna de arquivamento independente se for tipo "Select" ou "Texto"
      const archiveTimeRaw =
        page.properties["Arquivamento"]?.select?.name ||
        page.properties["Arquivamento"]?.rich_text?.[0]?.plain_text ||
        "1 Mês";

      return {
        id:
          page.properties["ID"]?.rich_text?.[0]?.plain_text ||
          Math.random().toString(36).substring(7),
        name:
          page.properties["Nome"]?.title?.[0]?.plain_text || "Plano Indefinido",
        baseCost: page.properties["Custo Base"]?.number || 0,
        jumpCost: page.properties["Custo Pulo"]?.number || 0,
        suggestedBase: page.properties["Base Sugerida"]?.number || 0,
        archiveTime: archiveTimeRaw,
      };
    })
    .sort((a: EmailPlan, b: EmailPlan) => a.jumpCost - b.jumpCost); // Ordena do mais barato para o mais caro

  // --- AQUI: MATRIZ DE VALORES BASE (F01 A F30) ---
  const matrizSugerida = (valoresBaseResults || [])
    .map((page: NotionPage) => {
      const props = page.properties;
      const linha: number[] = [];

      // Laço para puxar de F01 até F30
      for (let i = 1; i <= 30; i++) {
        const key = `F${i.toString().padStart(2, "0")}`;
        linha.push(props[key]?.number || 0);
      }

      return {
        ordem: props["Ordem"]?.number || 0,
        valores: linha,
      };
    })
    // Removendo os 'any' e tipando corretamente os objetos:
    .sort(
      (
        a: { ordem: number; valores: number[] },
        b: { ordem: number; valores: number[] },
      ) => a.ordem - b.ordem,
    )
    .map((i: { ordem: number; valores: number[] }) => i.valores);

  // Se o Notion estiver vazio ou falhar, mandamos um array vazio para não quebrar a tela
  return {
    boxData,
    smtpData,
    extrasData,
    upgradesData,
    textoValidade,
    emailData,
    matrizSugerida, // Adicionado no retorno
  };
}

// ==========================================
// 2. COMPONENTE DA PÁGINA (SERVER COMPONENT)
// ==========================================

export default async function PageMHP01() {
  const dadosNotion = await getAllNotionData();

  // Caso os dados de e-mail falhem, usamos um fallback vazio ou o app pode avisar que está carregando.
  const planosEmailParaCalculadora =
    dadosNotion.emailData && dadosNotion.emailData.length > 0
      ? dadosNotion.emailData
      : [];

  return (
    <Calculadora
      planosEmail={planosEmailParaCalculadora}
      // tituloRota="MHP02"
      dadosNotion={dadosNotion}
    />
  );
}
