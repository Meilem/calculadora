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
        cache: "no-store", // Busca ao vivo
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

  // VARIÁVEIS EXCLUSIVAS DO MHP02
  const dbValidadeId = process.env.NOTION_DB_VALIDADE_02?.trim();
  const dbEmailId = process.env.NOTION_DB_EMAIL_02?.trim();
  const dbValoresBaseId = process.env.NOTION_DB_VALORES_BASE?.trim();

  // Busca os bancos em paralelo
  const [
    boxResults,
    smtpResults,
    extrasResults,
    upgradesResults,
    validadeResults,
    emailResults,
    valoresBaseResults,
  ] = await Promise.all([
    fetchNotionDb(dbBoxId, token),
    fetchNotionDb(dbSmtpId, token),
    fetchNotionDb(dbExtrasId, token),
    fetchNotionDb(dbUpgradesId, token),
    fetchNotionDb(dbValidadeId, token),
    fetchNotionDb(dbEmailId, token),
    fetchNotionDb(dbValoresBaseId, token),
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

  // --- VALIDADE E TÍTULO DINÂMICO ---
  let textoValidade = "Valores Dinâmicos (Ao Vivo)";
  let tituloPagina = "MHP02";

  if (validadeResults && validadeResults.length > 0) {
    const page = validadeResults[0] as NotionPage;

    // CORREÇÃO AQUI: O tipo no Notion API é "title", não "titulo"
    const titlePropKey = Object.keys(page.properties).find(
      (key) => page.properties[key].type === "title",
    );

    tituloPagina =
      titlePropKey && page.properties[titlePropKey]?.title?.[0]?.plain_text
        ? page.properties[titlePropKey].title[0].plain_text
        : "MHP02";

    // Extrai a Data (O tipo "date" está correto)
    const datePropKey = Object.keys(page.properties).find(
      (key) => page.properties[key].type === "date",
    );

    const dataIso = datePropKey
      ? page.properties[datePropKey]?.date?.start
      : null;

    if (dataIso) {
      const [ano, mes, dia] = dataIso.split("-");
      textoValidade = `Valores Válidos até ${dia}/${mes}/${ano}`;
    } else {
      textoValidade = "Data não definida";
    }
  }

  // --- PLANOS DE E-MAIL DINÂMICOS ---
  const emailData: EmailPlan[] = emailResults
    .map((page: NotionPage) => {
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
    .sort((a: EmailPlan, b: EmailPlan) => a.jumpCost - b.jumpCost);

  // --- MATRIZ DE VALORES BASE ---
  const matrizSugerida = (valoresBaseResults || [])
    .map((page: NotionPage) => {
      const props = page.properties;
      const linha: number[] = [];
      for (let i = 1; i <= 30; i++) {
        const key = `F${i.toString().padStart(2, "0")}`;
        linha.push(props[key]?.number || 0);
      }
      return {
        ordem: props["Ordem"]?.number || 0,
        valores: linha,
      };
    })
    .sort(
      (
        a: { ordem: number; valores: number[] },
        b: { ordem: number; valores: number[] },
      ) => a.ordem - b.ordem,
    )
    .map((i: { ordem: number; valores: number[] }) => i.valores);

  return {
    boxData,
    smtpData,
    extrasData,
    upgradesData,
    textoValidade,
    tituloPagina, // Exporta o título extraído
    emailData,
    matrizSugerida,
  };
}

// ==========================================
// 2. COMPONENTE DA PÁGINA (SERVER COMPONENT)
// ==========================================

export default async function PageMHP02() {
  const dadosNotion = await getAllNotionData();

  const planosEmailParaCalculadora =
    dadosNotion.emailData && dadosNotion.emailData.length > 0
      ? dadosNotion.emailData
      : [];

  return (
    <Calculadora
      planosEmail={planosEmailParaCalculadora}
      tituloRota={dadosNotion.tituloPagina} // Passa o título para o Componente
      dadosNotion={dadosNotion}
    />
  );
}
