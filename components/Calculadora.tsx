// Arquivo: src/components/Calculadora.tsx
"use client";

import React, { useState, useMemo, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

// ==========================================
// 1. DEFINIÇÃO DE TIPOS E INTERFACES
// ==========================================

export interface EmailPlan {
  id: string;
  name: string;
  baseCost: number;
  jumpCost: number;
  suggestedBase: number;
  archiveTime: string;
}

interface UpgradeItem {
  id: string;
  sizeName: string;
  timeName: string;
  qty: number;
  cost: number;
}

interface SmtpMktPlan {
  id: string;
  name: string;
  cost: number;
  suggested: number;
}

interface BoxSize {
  id: string;
  name: string;
  unitCost: number;
  baseSug: number;
  stepSug: number;
}

interface ExtraFeatures {
  hospedagem: boolean;
  lgpd: boolean;
  phishing: boolean;
}

// ==========================================
// 2. DADOS CONSTANTES
// ==========================================

const VALORES_BASE_EMAIL = [
  [
    49.88, 62.38, 74.88, 87.38, 99.88, 118, 136.13, 154.25, 172.38, 190.5,
    208.63, 226.75, 244.88, 263, 281.13, 299.25, 317.38, 335.5, 353.63, 371.75,
    389.88, 408, 426.13, 444.25, 462.38, 480.5, 498.63, 516.75, 534.88, 553,
  ],
  [
    62.38, 87.38, 112.38, 137.38, 162.38, 187.38, 212.38, 237.38, 262.38,
    287.38, 312.38, 337.38, 362.38, 387.38, 412.38, 437.38, 462.38, 487.38,
    512.38, 537.38, 562.38, 587.38, 612.38, 637.38, 662.38, 687.38, 712.38,
    737.38, 762.38, 787.38,
  ],
  [
    74.88, 124.88, 174.88, 224.88, 274.88, 324.88, 374.88, 424.88, 474.88,
    524.88, 574.88, 624.88, 674.88, 724.88, 774.88, 824.88, 874.88, 924.88,
    974.88, 1024.88, 1074.88, 1124.88, 1174.88, 1224.88, 1274.88, 1324.88,
    1374.88, 1424.88, 1474.88, 1524.88,
  ],
  [
    100.0, 175.0, 250.0, 300.0, 375.0, 450.0, 525.0, 600.0, 675.0, 750.0, 825.0,
    900.0, 975.0, 1050.0, 1125.0, 1200.0, 1275.0, 1350.0, 1425.0, 1500.0,
    1575.0, 1650.0, 1725.0, 1800.0, 1875.0, 1950.0, 2025.0, 2100.0, 2175.0,
    2250.0,
  ],
  [
    112.5, 200.0, 287.5, 350.0, 437.5, 525.0, 612.5, 700.0, 787.5, 875.0, 962.5,
    1050.0, 1137.5, 1225.0, 1312.5, 1400.0, 1487.5, 1575.0, 1662.5, 1750.0,
    1837.5, 1925.0, 2012.5, 2100.0, 2187.5, 2275.0, 2362.5, 2450.0, 2537.5,
    2625.0,
  ],
  [
    125.0, 225.0, 325.0, 400.0, 500.0, 600.0, 700.0, 800.0, 900.0, 1000.0,
    1100.0, 1200.0, 1300.0, 1400.0, 1500.0, 1600.0, 1700.0, 1800.0, 1900.0,
    2000.0, 2100.0, 2200.0, 2300.0, 2400.0, 2500.0, 2600.0, 2700.0, 2800.0,
    2900.0, 3000.0,
  ],
  [
    150.0, 275.0, 400.0, 500.0, 625.0, 750.0, 875.0, 1000.0, 1125.0, 1250.0,
    1375.0, 1500.0, 1625.0, 1750.0, 1875.0, 2000.0, 2125.0, 2250.0, 2375.0,
    2500.0, 2625.0, 2750.0, 2875.0, 3000.0, 3125.0, 3250.0, 3375.0, 3500.0,
    3625.0, 3750.0,
  ],
];

const UPGRADES_DATA: Record<string, Record<string, number>> = {
  "2GB": {
    "1 Mês": 2.03,
    "3 Meses": 2.52,
    "1 Ano": 3.92,
    "2 Anos": 5.32,
    "10 Anos": 7.7,
  },
  "10GB": {
    "1 Mês": 2.66,
    "3 Meses": 2.8,
    "1 Ano": 4.62,
    "2 Anos": 5.74,
    "10 Anos": 9.8,
  },
  "25GB": {
    "1 Mês": 4.2,
    "3 Meses": 4.48,
    "1 Ano": 5.6,
    "2 Anos": 7.0,
    "10 Anos": 11.2,
  },
  "50GB": {
    "1 Mês": 5.6,
    "3 Meses": 6.3,
    "1 Ano": 7.0,
    "2 Anos": 8.4,
    "10 Anos": 14.0,
  },
  "100GB": {
    "1 Mês": 16.1,
    "3 Meses": 18.2,
    "1 Ano": 22.4,
    "2 Anos": 26.6,
    "10 Anos": 40.6,
  },
  "150GB": {
    "1 Mês": 28.48,
    "3 Meses": 32.51,
    "1 Ano": 46.62,
    "2 Anos": 59.22,
    "10 Anos": 71.06,
  },
  "200GB": {
    "1 Mês": 37.67,
    "3 Meses": 43.97,
    "1 Ano": 60.35,
    "2 Anos": 69.17,
    "10 Anos": 88.07,
  },
};

const UPGRADE_SIZES = Object.keys(UPGRADES_DATA).map((size) => ({
  id: size,
  name: size,
}));
const UPGRADE_TIMES = Object.keys(UPGRADES_DATA["2GB"]);

const SMTP_PLANS: SmtpMktPlan[] = [
  { id: "none", name: "Nenhum", cost: 0, suggested: 0 },
  { id: "5k", name: "5.000/mês", cost: 44.99, suggested: 58.49 },
  { id: "10k", name: "10.000/mês", cost: 59.99, suggested: 77.99 },
  { id: "25k", name: "25.000/mês", cost: 80.99, suggested: 105.29 },
  { id: "50k", name: "50.000/mês", cost: 141.75, suggested: 184.28 },
  { id: "75k", name: "75.000/mês", cost: 212.63, suggested: 276.42 },
  { id: "100k", name: "100.000/mês", cost: 283.5, suggested: 368.55 },
  { id: "150k", name: "150.000/mês", cost: 425.25, suggested: 552.83 },
  { id: "250k", name: "250.000/mês", cost: 708.75, suggested: 921.38 },
  { id: "350k", name: "350.000/mês", cost: 992.25, suggested: 1289.93 },
  { id: "500k", name: "500.000/mês", cost: 1417.5, suggested: 1842.75 },
  { id: "1m", name: "1.000.000/mês", cost: 2835.0, suggested: 3685.5 },
];

const MKT_PLANS: SmtpMktPlan[] = [
  { id: "none", name: "Nenhum", cost: 0, suggested: 0 },
  { id: "5k", name: "5.000 envios", cost: 49.9, suggested: 64.87 },
  { id: "10k", name: "10.000 envios", cost: 57.8, suggested: 75.14 },
  { id: "15k", name: "15.000 envios", cost: 87.0, suggested: 113.1 },
  { id: "25k", name: "25.000 envios", cost: 124.5, suggested: 161.85 },
  { id: "50k", name: "50.000 envios", cost: 229.9, suggested: 298.87 },
  { id: "75k", name: "75.000 envios", cost: 299.9, suggested: 389.87 },
  { id: "100k", name: "100.000 envios", cost: 349.9, suggested: 454.87 },
  { id: "150k", name: "150.000 envios", cost: 514.5, suggested: 668.85 },
  { id: "250k", name: "250.000 envios", cost: 857.5, suggested: 1114.75 },
  { id: "350k", name: "350.000 envios", cost: 1200.5, suggested: 1560.65 },
  { id: "500k", name: "500.000 envios", cost: 1715.0, suggested: 2229.5 },
  { id: "1m", name: "1.000.000 envios", cost: 3430.0, suggested: 4459.0 },
];

const BOX_SIZES: BoxSize[] = [
  { id: "none", name: "Nenhum", unitCost: 0, baseSug: 0, stepSug: 0 },
  { id: "2gb", name: "2GB", unitCost: 1.8, baseSug: 67.37, stepSug: 19.575 },
  { id: "5gb", name: "5GB", unitCost: 2.25, baseSug: 80.87, stepSug: 24.3 },
  { id: "10gb", name: "10GB", unitCost: 4.35, baseSug: 94.37, stepSug: 46.575 },
  { id: "15gb", name: "15GB", unitCost: 7.5, baseSug: 114.62, stepSug: 57.305 },
  { id: "25gb", name: "25GB", unitCost: 10.9, baseSug: 134.87, stepSug: 71.55 },
];

const formatCurrency = (val: number): string =>
  `R$ ${val.toFixed(2).replace(".", ",")}`;

const getBoxSuggestedValue = (
  box: BoxSize | undefined,
  qty: number,
): number => {
  if (!box || box.id === "none" || qty <= 0) return 0;
  const band = Math.ceil(qty / 5) * 5;
  const finalBand = Math.max(5, band);
  const steps = (finalBand - 5) / 5;
  return box.baseSug + steps * box.stepSug;
};

// ==========================================
// 3. COMPONENTE DE TOOLTIP (MODAL VIA PORTAL - SEM ERROS NEXT.JS)
// ==========================================
interface TooltipProps {
  title?: string;
  children: ReactNode;
  large?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  title,
  children,
  large = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Garante que o Portal só vai renderizar no lado do cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Impede o scroll da página de fundo quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <span className="inline-flex items-center ml-2">
      {/* Botão Disparador (Ícone + Texto "Ver Tabela") */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Evita conflitos com clicks de labels pai
          setIsOpen(true);
        }}
        className="group inline-flex items-center gap-1.5 text-[#4254a6] dark:text-[#8aa3ff] transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#4254a6] rounded-md px-1"
        title="Ver Tabela Completa"
      >
        <span className="font-bold text-xs border-[1.5px] border-[#4254a6] dark:border-[#8aa3ff] rounded-full w-4 h-4 flex items-center justify-center transition-colors group-hover:bg-[#4254a6] dark:group-hover:bg-[#8aa3ff] group-hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="w-2.5 h-2.5 fill-current"
          >
            <path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM320 240C302.3 240 288 254.3 288 272C288 285.3 277.3 296 264 296C250.7 296 240 285.3 240 272C240 227.8 275.8 192 320 192C364.2 192 400 227.8 400 272C400 319.2 364 339.2 344 346.5L344 350.3C344 363.6 333.3 374.3 320 374.3C306.7 374.3 296 363.6 296 350.3L296 342.2C296 321.7 310.8 307 326.1 302C332.5 299.9 339.3 296.5 344.3 291.7C348.6 287.5 352 281.7 352 272.1C352 254.4 337.7 240.1 320 240.1zM288 432C288 414.3 302.3 400 320 400C337.7 400 352 414.3 352 432C352 449.7 337.7 464 320 464C302.3 464 288 449.7 288 432z" />
          </svg>
        </span>
        <span className="text-[11px] font-semibold tracking-wide group-hover:underline">
          Ver Tabela
        </span>
      </button>

      {/* Fundo escuro e Modal usando React Portal */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            {/* Caixa de conteúdo do Modal */}
            <div
              className={`
              bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 text-sm 
              rounded-xl border border-gray-200 dark:border-slate-700 p-5 
              shadow-2xl relative transition-all animate-in zoom-in-95 duration-200
              ${large ? "w-full max-w-4xl" : "w-full max-w-md"}
            `}
              onClick={(e) => e.stopPropagation()} // Previne que o clique dentro da caixa a feche
            >
              {/* Botão X para fechar */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors focus:outline-none"
                title="Fechar"
              >
                ✕
              </button>

              {/* Cabeçalho do Modal */}
              {title && (
                <div className="font-bold text-lg text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-700 pb-3 pr-8 flex items-center justify-between">
                  <span>{title}</span>
                </div>
              )}

              {/* Corpo da Tabela (com rolagem se ficar muito grande) */}
              <div className="max-h-[75vh] overflow-y-auto overflow-x-auto custom-scrollbar rounded-lg">
                {children}
              </div>
            </div>
          </div>,
          document.body, // Injeta o modal direto na raiz da página
        )}
    </span>
  );
};

// ==========================================
// 4. COMPONENTE PRINCIPAL
// ==========================================

export default function Calculadora({
  planosEmail,
  tituloRota,
}: {
  planosEmail: EmailPlan[];
  tituloRota?: string;
}) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const [franquia, setFranquia] = useState<number>(200);
  const [emailPlanId, setEmailPlanId] = useState<string>(planosEmail[0].id);
  const [emailAccounts, setEmailAccounts] = useState<number>(0);
  const [extras, setExtras] = useState<ExtraFeatures>({
    hospedagem: false,
    lgpd: false,
    phishing: false,
  });

  const selectedEmailPlan =
    planosEmail.find((p) => p.id === emailPlanId) || planosEmail[0];

  const [upgradeSize, setUpgradeSize] = useState<string>(UPGRADE_SIZES[0].id);
  const [upgradeQty, setUpgradeQty] = useState<number>(1);
  const [upgradeList, setUpgradeList] = useState<UpgradeItem[]>([]);

  const [boxSizeId, setBoxSizeId] = useState<string>(BOX_SIZES[0].id);
  const [boxQty, setBoxQty] = useState<number>(0);
  const [smtpId, setSmtpId] = useState<string>(SMTP_PLANS[0].id);
  const [mktId, setMktId] = useState<string>(MKT_PLANS[0].id);

  const selectedBox = BOX_SIZES.find((b) => b.id === boxSizeId) || BOX_SIZES[0];
  const selectedSmtp = SMTP_PLANS.find((s) => s.id === smtpId) || SMTP_PLANS[0];
  const selectedMkt = MKT_PLANS.find((m) => m.id === mktId) || MKT_PLANS[0];

  const calculations = useMemo(() => {
    let consumido = 0;
    let sugeridoBase = 0;
    let sugeridoEmailExtras = 0;
    let sugeridoSmtp = 0;
    let sugeridoMkt = 0;
    const itemsResumo: { name: string; cost: number }[] = [];

    // === CÁLCULOS DO E-MAIL ===
    if (emailAccounts > 0) {
      const emailCost =
        selectedEmailPlan.baseCost + emailAccounts * selectedEmailPlan.jumpCost;
      consumido += emailCost;
      itemsResumo.push({
        name: `Contas de E-mail (${emailAccounts} un)`,
        cost: emailCost,
      });

      const planIndex = planosEmail.findIndex((p) => p.id === emailPlanId);
      if (planIndex >= 0 && planIndex < VALORES_BASE_EMAIL.length) {
        const valIndex = Math.min(Math.floor((emailAccounts - 1) / 10), 29);
        sugeridoEmailExtras += VALORES_BASE_EMAIL[planIndex][valIndex];
      }
    }

    // === CÁLCULOS DE EXTRAS ===
    if (extras.hospedagem) {
      consumido += 9.9;
      itemsResumo.push({ name: "Hospedagem de Site", cost: 9.9 });
      sugeridoEmailExtras += 29.9;
    }
    if (extras.lgpd && emailAccounts > 0) {
      const lgpdCost = emailAccounts * 1.0;
      consumido += lgpdCost;
      itemsResumo.push({ name: "LGPD", cost: lgpdCost });
      sugeridoEmailExtras += emailAccounts * 3.0;
    }
    if (extras.phishing && emailAccounts > 0) {
      const phishCost = emailAccounts * 1.0;
      consumido += phishCost;
      itemsResumo.push({ name: "Phishing Educativo", cost: phishCost });
      sugeridoEmailExtras += emailAccounts * 3.0;
    }

    // === CÁLCULOS DE UPGRADES ===
    upgradeList.forEach((upg) => {
      consumido += upg.cost * upg.qty;
      itemsResumo.push({
        name: `Upgrade ${upg.sizeName} (${upg.qty} un)`,
        cost: upg.cost * upg.qty,
      });
    });

    // === CÁLCULOS DA MEILE BOX ===
    if (selectedBox.id !== "none" && boxQty > 0) {
      const boxCost = selectedBox.unitCost * boxQty;
      consumido += boxCost;
      sugeridoBase += getBoxSuggestedValue(selectedBox, boxQty);
      itemsResumo.push({
        name: `Box ${selectedBox.name} (${boxQty} un)`,
        cost: boxCost,
      });
    }

    // === CÁLCULOS DE SMTP E MKT ===
    if (selectedSmtp.id !== "none") {
      consumido += selectedSmtp.cost;
      sugeridoSmtp = selectedSmtp.suggested;
      itemsResumo.push({
        name: `SMTP ${selectedSmtp.name}`,
        cost: selectedSmtp.cost,
      });
    }
    if (selectedMkt.id !== "none") {
      consumido += selectedMkt.cost;
      sugeridoMkt = selectedMkt.suggested;
      itemsResumo.push({
        name: `MKT ${selectedMkt.name}`,
        cost: selectedMkt.cost,
      });
    }
    return {
      consumido,
      disponivel: franquia - consumido,
      mensalAPagar: Math.max(franquia, consumido),
      itemsResumo,
      sugeridoTotal:
        sugeridoEmailExtras + sugeridoBase + sugeridoSmtp + sugeridoMkt,
      sugeridoEmailExtras,
      sugeridoBase,
      sugeridoSmtp,
      sugeridoMkt,
    };
  }, [
    franquia,
    emailAccounts,
    emailPlanId,
    planosEmail,
    extras,
    upgradeList,
    selectedBox,
    boxQty,
    selectedSmtp,
    selectedMkt,
    selectedEmailPlan,
  ]);

  const handleAddUpgrade = () => {
    const timeName = selectedEmailPlan.archiveTime;
    const upgradeCost = UPGRADES_DATA[upgradeSize][timeName];
    setUpgradeList([
      ...upgradeList,
      {
        id: Math.random().toString(36).substring(2, 9),
        sizeName: upgradeSize,
        timeName,
        qty: upgradeQty,
        cost: upgradeCost,
      },
    ]);
  };

  const handleRemoveUpgrade = (idToRemove: string) =>
    setUpgradeList(upgradeList.filter((item) => item.id !== idToRemove));

  return (
    <div className="min-h-screen bg-[#f5f5f6] dark:bg-slate-900 text-gray-900 dark:text-slate-100 flex flex-col items-center pt-0 font-sans transition-colors duration-300">
      {/* CABEÇALHO RESPONSIVO */}
      <div className="w-full bg-white dark:bg-[#030f26] text-gray-900 dark:text-white py-3 px-4 sm:px-8 mb-6 sm:mb-8 border-b border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-md transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-7xl mx-auto">
          <div className="flex flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
            <svg
              width="83"
              height="30"
              className="w-17.5 h-6.25 sm:w-20.75 sm:h-7.5"
              viewBox="0 0 83 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_1_17)">
                <path
                  d="M18.1876 7.5469L21.6548 12.0938C16.4581 11.0145 11.0657 11.0105 5.8699 12.0938L6.90612 10.6855C8.44352 8.59601 10.1349 6.62435 11.9662 4.78695C12.9458 3.80398 14.5402 3.81209 15.5098 4.80497L18.1876 7.5469Z"
                  fill="#F2411F"
                />
                <path
                  className="fill-[#030f26] dark:fill-white transition-colors duration-300"
                  d="M24.6728 3.55761C24.4132 3.66305 24.2672 3.94691 24.2024 4.45787C24.105 5.30135 23.8374 5.38245 23.5049 4.67685C23.2534 4.13345 23.1561 4.04424 22.8155 4.04424C22.5316 4.04424 22.2153 4.27133 22.2153 4.4822C22.2153 4.53897 22.3694 4.91205 22.556 5.30946C22.7425 5.70687 22.9047 6.2016 22.929 6.41247C22.9777 6.89099 22.8074 7.00453 22.1667 6.92343C21.3881 6.8261 20.8365 7.16674 20.8365 7.73447C20.8365 8.12377 21.0231 8.2292 22.0044 8.37519C22.9534 8.51307 23.2534 8.65095 23.6671 9.12135C24.2916 9.82695 24.6079 10.8813 24.543 12.0411C24.4943 13.1198 24.0645 13.9714 23.4157 14.312C23.2859 14.3769 23.1886 14.4174 23.1886 14.3931C23.1886 14.3769 23.3021 13.9065 23.4319 13.3469C23.5698 12.7873 23.6752 12.3087 23.6752 12.2763C23.6752 12.2114 22.1261 13.0062 20.796 13.7524C18.8171 14.8797 17.1869 15.999 15.2647 17.5562C13.8211 18.7241 13.5129 18.6997 11.7286 17.2723C10.2606 16.0963 8.91426 15.1555 7.38951 14.2309C6.10807 13.4685 3.81282 12.2763 3.74794 12.3493C3.72361 12.3736 3.76416 12.6332 3.83716 12.9332C3.91015 13.2333 3.95881 13.4929 3.93448 13.5091C3.83716 13.6145 3.42353 13.4199 3.14777 13.136C2.53949 12.5277 2.3935 11.0597 2.86391 10.2649C3.30998 9.48632 4.2589 8.99969 5.4349 8.93481C6.25405 8.88615 6.6028 8.99969 7.25163 9.55931C8.01401 10.2 8.68717 10.3704 9.30356 10.054C9.92806 9.73774 10.3255 9.18623 10.1146 8.93481C10.0416 8.83748 9.91995 8.82126 9.60365 8.86993C8.72773 8.98347 8.6304 8.97536 8.60607 8.73205C8.58174 8.54551 8.73584 8.33464 9.48199 7.49927C9.98484 6.94776 10.5363 6.38003 10.7067 6.23404C10.877 6.09617 11.023 5.95018 11.023 5.91774C11.023 5.82041 9.14136 5.43111 8.16811 5.33379C7.12998 5.22024 5.59711 5.33379 4.58331 5.59332C2.48272 6.12861 0.982296 7.47494 0.301022 9.44576C-0.331589 11.2706 0.0414894 13.0225 1.33915 14.3282C2.03665 15.0257 2.80713 15.4231 3.73983 15.5691C4.06425 15.6178 4.37244 15.6746 4.41299 15.6827C4.46166 15.6908 4.68875 16.518 4.92395 17.5156C5.16726 18.5132 5.41057 19.5027 5.47546 19.7135C5.62144 20.1677 6.12429 20.6381 6.53792 20.7192C6.69202 20.7517 7.47872 20.6787 8.33032 20.557C10.5607 20.2488 11.4934 20.1839 13.6994 20.1839C15.6864 20.1839 17.3572 20.2975 18.9793 20.5489C20.4716 20.776 20.6419 20.7841 21.0474 20.63C21.6557 20.4029 21.8179 20.0866 22.2234 18.3997C22.41 17.5967 22.5884 16.9073 22.6208 16.8587C22.6533 16.81 22.9047 16.7127 23.1886 16.6478C25.1188 16.2017 26.5463 14.5229 27.1302 12.0087C27.3086 11.2463 27.3979 9.72152 27.3249 8.58606C27.2924 8.02644 27.2843 7.53171 27.3005 7.47494C27.3168 7.42627 27.4465 7.33706 27.5763 7.2884C27.998 7.10997 28.217 6.89099 28.217 6.63957C28.217 6.2746 28.0548 6.20971 27.3249 6.26649C26.7247 6.32326 26.676 6.31515 26.676 6.16916C26.676 6.08806 26.8626 5.85286 27.0816 5.6501C27.3654 5.39056 27.4871 5.22024 27.4871 5.07426C27.4871 4.83906 27.1545 4.53086 26.895 4.53086C26.6679 4.53086 26.1651 4.88772 25.9055 5.22835C25.7596 5.41489 25.6298 5.50411 25.4838 5.50411C25.2729 5.50411 25.2729 5.50411 25.3297 5.03371C25.3621 4.78228 25.4108 4.4092 25.4351 4.20644C25.4676 3.91447 25.4433 3.81715 25.3297 3.71171C25.1188 3.52517 24.8836 3.47651 24.6728 3.55761Z"
                />
                <path
                  className="fill-[#030f26] dark:fill-white transition-colors duration-300"
                  d="M67.6904 3.63864C66.4252 3.95494 65.4601 5.12284 64.5517 7.4262C63.6433 9.72955 63.181 11.9437 63.0107 14.7904C62.7917 18.5293 63.6677 20.5813 65.5898 20.8084C66.4739 20.9138 67.439 20.4921 68.3798 19.5756C69.0854 18.8943 69.8559 17.6372 70.4074 16.2665C70.6264 15.715 71.2914 13.7523 71.2671 13.7361C71.2509 13.728 70.9265 13.6225 70.529 13.5009C70.1398 13.3792 69.7748 13.2657 69.7099 13.2414C69.6369 13.2089 69.499 13.5171 69.2233 14.32C68.6474 16.007 67.9094 17.4425 67.2687 18.14C66.7415 18.7078 66.2143 19.0484 65.8575 19.0484C65.5736 19.0484 65.1519 18.5699 64.9978 18.067C64.9248 17.8318 64.8193 17.1992 64.7707 16.6802L64.6815 15.7313L65.5006 14.9527C66.9767 13.5658 67.9662 12.2357 68.7691 10.573C69.645 8.76441 70.229 6.85847 70.229 5.82034C70.229 4.88764 69.8316 4.13337 69.1584 3.80896C68.7367 3.61431 68.104 3.54131 67.6904 3.63864ZM68.4285 5.81223C68.4852 6.83414 67.4714 9.51868 66.4252 11.1245C66.0034 11.7653 65.0302 12.9818 64.9734 12.9332C64.9248 12.8764 65.2167 11.3679 65.4763 10.3297C66.2224 7.44242 67.439 5.25261 68.2419 5.35804C68.3798 5.38238 68.4122 5.45537 68.4285 5.81223Z"
                />
                <path
                  className="fill-[#030f26] dark:fill-white transition-colors duration-300"
                  d="M60.098 7.66969C59.9926 8.51317 59.9844 8.74837 60.0737 8.74837C60.1061 8.75648 60.4792 8.80515 60.9009 8.86192C61.3227 8.9268 61.6957 8.95113 61.7201 8.9268C61.7525 8.89436 61.8174 8.57806 61.8742 8.2212C61.9228 7.86434 61.9877 7.47504 62.012 7.3615C62.0526 7.15062 62.0445 7.15062 61.493 7.09385C61.1929 7.06952 60.7712 7.02086 60.5684 6.99653L60.1953 6.94786L60.098 7.66969Z"
                />
                <path
                  className="fill-[#030f26] dark:fill-white transition-colors duration-300"
                  d="M37.0654 9.47839C36.1327 9.81902 35.3541 10.5327 34.8107 11.5547L34.462 12.1954V11.7817C34.462 11.5547 34.4376 11.0356 34.4133 10.6301L34.3565 9.88391H33.9753C33.7645 9.88391 33.3671 9.90824 33.0913 9.93257L32.5885 9.98934L32.6371 11.0518C32.775 13.8661 33.0913 16.7615 33.5293 19.1703C33.6428 19.7948 33.7483 20.3463 33.7726 20.395C33.7888 20.4599 34.0483 20.4355 34.6404 20.3058C35.4271 20.1436 35.4758 20.1192 35.4677 19.9327C35.4596 19.8273 35.4109 19.219 35.346 18.5864C35.054 15.3909 36.1084 11.8223 37.5196 11.214C38.0711 10.9788 38.801 11.1572 39.2714 11.652L39.4904 11.8791L39.2795 12.1792C38.355 13.5417 37.7791 15.8126 37.9089 17.5401C38.0954 19.9084 39.02 21.133 40.3015 20.7113C42.0939 20.1192 43.0184 15.6504 41.956 12.7063C41.7208 12.0656 41.7289 12.0332 42.2885 11.7574C43.351 11.2302 44.2269 11.5465 44.7216 12.6496C45.411 14.1905 45.0704 16.1938 43.5213 19.6245L43.3104 20.0787L44.1215 20.4518L44.9325 20.8248L45.1758 20.2814C45.6949 19.1298 46.3031 17.4996 46.5059 16.7372C47.1872 14.1175 46.8465 12.0251 45.5164 10.7031C44.7703 9.9569 44.2918 9.76225 43.1806 9.77036C42.4913 9.77036 42.2966 9.8028 41.8749 9.98123C41.5991 10.0948 41.2342 10.2813 41.0719 10.3949L40.7637 10.6057L40.3501 10.2408C40.123 10.038 39.7013 9.76225 39.4093 9.61626C38.728 9.27563 37.7629 9.21885 37.0654 9.47839ZM40.5772 15.5206C40.5853 16.9075 40.4961 17.4347 40.1068 18.2782L39.9203 18.6837L39.8067 18.3187C39.7418 18.0916 39.7013 17.5564 39.7094 16.8994C39.7094 15.7802 39.8554 15.0502 40.2285 14.1743L40.415 13.7526L40.488 13.9878C40.5367 14.1175 40.5691 14.8069 40.5772 15.5206Z"
                />
                <path
                  className="fill-[#030f26] dark:fill-white transition-colors duration-300"
                  d="M51.6554 10.0056C50.7876 10.2408 50.0496 10.6788 49.3845 11.3357C48.314 12.3982 47.7868 13.5499 47.7057 15.026C47.5516 17.6781 49.1088 19.9895 51.5419 20.7195C52.1664 20.9141 53.6263 20.9141 54.2102 20.7357C55.2078 20.4194 55.8404 20.0463 56.5217 19.365C56.9434 18.9433 57.4949 18.189 57.4949 18.0268C57.4949 17.9782 57.1462 17.7754 56.7163 17.5889C56.0756 17.2969 55.9296 17.2563 55.8647 17.3537C55.8242 17.4185 55.7917 17.4915 55.7917 17.5159C55.7917 17.6294 55.0213 18.4161 54.6968 18.6432C53.7641 19.2839 52.5476 19.3813 51.5338 18.8784C50.6579 18.4486 49.8306 17.4023 49.5954 16.4291L49.5467 16.2101H53.8534H58.1681L58.1275 15.2125C58.0951 14.4339 58.0383 14.0933 57.8761 13.6066C57.3246 11.9846 56.0918 10.695 54.5752 10.1516C53.8209 9.88397 52.3854 9.81098 51.6554 10.0056ZM54.2589 11.8872C54.9483 12.236 55.5728 12.8605 55.9134 13.5742C56.0675 13.8824 56.2135 14.223 56.2378 14.3204L56.2865 14.5069H52.9207C51.0634 14.5069 49.5467 14.4988 49.5467 14.4826C49.5467 14.369 49.8468 13.6066 50.009 13.3228C50.2605 12.8686 50.8282 12.3009 51.2986 12.0251C51.8906 11.6764 52.2799 11.5872 53.0423 11.6115C53.6344 11.6358 53.8209 11.6764 54.2589 11.8872Z"
                />
                <path
                  className="fill-[#030f26] dark:fill-white transition-colors duration-300"
                  d="M76.3117 10.0058C74.6328 10.4681 73.1486 11.8874 72.6133 13.5582C72.3376 14.4341 72.2646 15.7318 72.4511 16.6158C72.7026 17.7999 73.4568 19.0246 74.3895 19.7626C75.4114 20.5737 76.263 20.8657 77.5688 20.8657C78.3231 20.8576 78.5583 20.8251 79.1098 20.6386C79.8884 20.3709 80.521 19.9978 81.0319 19.5031C81.4699 19.0895 82.1512 18.1892 82.1512 18.0351C82.1512 17.9459 80.6264 17.216 80.5778 17.2809C80.5615 17.2971 80.4399 17.4674 80.3101 17.6702C79.3369 19.0976 77.6418 19.5923 76.1981 18.8867C75.3141 18.4488 74.4706 17.3944 74.2354 16.4293L74.1868 16.2103H78.4934H82.8V15.5209C82.8 13.0472 81.3726 10.9142 79.2233 10.1518C78.4691 9.88418 77.0254 9.81118 76.3117 10.0058ZM78.9232 11.8956C79.7992 12.3254 80.6426 13.3716 80.8778 14.3206L80.9184 14.5071H77.5607C75.7115 14.5071 74.203 14.4909 74.203 14.4828C74.203 14.4666 74.276 14.2476 74.3571 14.0043C74.722 12.9337 75.5331 12.1064 76.5712 11.7333C77.2525 11.49 78.2501 11.563 78.9232 11.8956Z"
                />
                <path
                  className="fill-[#030f26] dark:fill-white transition-colors duration-300"
                  d="M59.5313 11.5627C59.0122 15.2935 59.1745 18.6269 59.9531 20.1435C60.1153 20.4598 60.2775 20.7599 60.3261 20.8248C60.3829 20.914 60.5532 20.8086 61.1291 20.3463L61.8509 19.7542L61.6643 19.373C61.0236 18.0916 60.9101 15.0988 61.3886 11.8466C61.4859 11.2059 61.5427 10.6381 61.5265 10.5814C61.5021 10.5246 61.1696 10.4435 60.756 10.3867C59.5962 10.2326 59.7341 10.1028 59.5313 11.5627Z"
                />
              </g>
            </svg>

            <span className="text-gray-300 dark:text-gray-600 transition-colors hidden sm:block">
              |
            </span>

            <h1 className="text-sm sm:text-base font-bold flex items-center">
              Revenda<span className="font-light ml-1">Meile</span>
              {tituloRota && (
                <span className="ml-2 sm:ml-3 text-[9px] sm:text-[10px] bg-gray-100 dark:bg-white/20 text-gray-600 dark:text-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors">
                  {tituloRota}
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 dark:border-slate-800/50 pt-3 sm:pt-0">
            <span
              className="text-[11px] sm:text-xs font-medium text-[#4254a6] dark:text-[#8aa3ff] flex items-center gap-1
             bg-[#4254a6]/10 px-5 py-2 border rounded-full border-[#4254a6]/20 dark:border-[#8aa3ff]/20 dark:bg-[#4254a6]/20 "
            >
              ⏲ Valores Válidos até 31/07/2026
            </span>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition-colors duration-300 flex-shrink-0"
              title={
                isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"
              }
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  className="fill-white sm:w-[24px] sm:h-[24px]"
                >
                  <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  className="fill-gray-600 sm:w-[24px] sm:h-[24px]"
                >
                  <path d="M565-395q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm-226.5 56.5Q280-397 280-480t58.5-141.5Q397-680 480-680t141.5 58.5Q680-563 680-480t-58.5 141.5Q563-280 480-280t-141.5-58.5ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl px-4 flex flex-col lg:flex-row gap-3 pb-5">
        <div className="flex-1 space-y-3">
          {/* US01 - Franquia (Com a Nova Tabela de Cálculo adicionada) */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-100 dark:border-slate-700/50 transition-colors">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Simulador de E-mail (Franquia)
            </h2>
            <div className="bg-[#4254a6]/5 dark:bg-[#4254a6]/20 border border-[#4254a6]/10 p-4 rounded-md">
              <label className="flex items-center text-sm text-[#4254a6] dark:text-[#8aa3ff] font-medium mb-1">
                Valor da Franquia (R$)
                <Tooltip title="Valor Unitário de caixas postais">
                  <table className="w-full text-center border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-slate-700/50">
                        <th className="p-2 border dark:border-slate-700 font-bold">
                          TAMANHO
                        </th>
                        <th className="p-2 border dark:border-slate-700 font-bold">
                          PREÇO
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {BOX_SIZES.filter((b) => b.id !== "none").map((box) => (
                        <tr
                          key={box.id}
                          className="hover:bg-[#4254a6]/5 dark:hover:bg-slate-700 transition-colors"
                        >
                          <td className="p-2 border dark:border-slate-700 text-gray-800 dark:text-slate-200">
                            {box.name
                              .replace("gb", " GB")
                              .replace("GB", " GB")
                              .toUpperCase()}
                          </td>
                          <td className="p-2 border dark:border-slate-700 font-medium text-[#4254a6] dark:text-[#8aa3ff]">
                            {formatCurrency(box.unitCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Tooltip>
              </label>
              <input
                type="number"
                min="0"
                value={franquia}
                onChange={(e) =>
                  setFranquia(Math.max(0, Number(e.target.value)))
                }
                className="w-full bg-transparent border-none text-xl font-bold text-gray-900 dark:text-white focus:ring-0 p-0 outline-none"
              />
            </div>
          </div>

          {/* US02 - Email & Extras */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-100 dark:border-slate-700/50 flex flex-col gap-4 transition-colors">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">
                  Plano de E-mail
                </label>
                <select
                  value={emailPlanId}
                  onChange={(e) => setEmailPlanId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 outline-none bg-white dark:bg-slate-800 dark:text-white focus:border-[#4254a6] dark:focus:border-[#8aa3ff]"
                >
                  {planosEmail.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">
                  Quantidade de contas (Máx. 300)
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={emailAccounts}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 300) setEmailAccounts(300);
                    else setEmailAccounts(Math.max(0, val));
                  }}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 outline-none bg-white dark:bg-slate-800 dark:text-white focus:border-[#4254a6] dark:focus:border-[#8aa3ff]"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-slate-300 mb-2 flex items-center">
                Recursos Adicionais
                <Tooltip title="Tabela de Custos (Revenda)">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-slate-700/50">
                        <th className="p-2 border dark:border-slate-700">
                          Item
                        </th>
                        <th className="p-2 border dark:border-slate-700">
                          Custo
                        </th>
                        <th className="p-2 border dark:border-slate-700">
                          Cobrança
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border dark:border-slate-700 text-xs">
                          Hospedagem
                        </td>
                        <td className="p-2 border dark:border-slate-700 font-medium text-[#4254a6] dark:text-[#8aa3ff]">
                          R$ 9,90
                        </td>
                        <td className="p-2 border dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400">
                          Fixo Mensal
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border dark:border-slate-700 text-xs">
                          LGPD
                        </td>
                        <td className="p-2 border dark:border-slate-700 font-medium text-[#4254a6] dark:text-[#8aa3ff]">
                          R$ 1,00
                        </td>
                        <td className="p-2 border dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400">
                          Por conta
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 border dark:border-slate-700 text-xs">
                          Phishing
                        </td>
                        <td className="p-2 border dark:border-slate-700 font-medium text-[#4254a6] dark:text-[#8aa3ff]">
                          R$ 1,00
                        </td>
                        <td className="p-2 border dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400">
                          Por conta
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Tooltip>
              </label>
              <div className="flex gap-2 flex-wrap">
                {["Hospedagem", "LGPD", "Phishing"].map((item) => {
                  const key = item.toLowerCase() as keyof ExtraFeatures;
                  return (
                    <button
                      key={item}
                      onClick={() =>
                        setExtras({ ...extras, [key]: !extras[key] })
                      }
                      className={`px-3 py-1 rounded-full text-sm border transition-colors inline-flex items-center gap-1.5 ${
                        extras[key]
                          ? "bg-[#4254a6] border-[#4254a6] text-[#ffffff]"
                          : "bg-[#4254a6]/5 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-[#4254a6] dark:text-slate-300"
                      }`}
                    >
                      {extras[key] && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="opacity-90"
                        >
                          <path
                            d="M2 2L10 10M10 2L2 10"
                            stroke="#FF6B6B"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      {item === "Hospedagem"
                        ? "Hospedagem de Site"
                        : item === "Phishing"
                          ? "Phishing Educativo"
                          : item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* US03 - Upgrades */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-100 dark:border-slate-700/50 transition-colors">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center">
              Upgrades de Caixa Postal
              <Tooltip title="Matriz de Custos - Upgrades (R$)" large>
                <table className="w-full text-center border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-slate-700/50">
                      <th className="p-2 border dark:border-slate-700">
                        Tamanho
                      </th>
                      {Object.keys(UPGRADES_DATA["2GB"]).map((t) => (
                        <th
                          key={t}
                          className="p-2 border dark:border-slate-700"
                        >
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(UPGRADES_DATA).map((size) => (
                      <tr
                        key={size}
                        className="hover:bg-[#4254a6]/5 dark:hover:bg-slate-700"
                      >
                        <td className="p-2 border dark:border-slate-700 font-bold text-gray-700 dark:text-slate-300">
                          {size}
                        </td>
                        {Object.values(UPGRADES_DATA[size]).map((cost, i) => (
                          <td
                            key={i}
                            className="p-2 border dark:border-slate-700 text-[#4254a6] dark:text-[#8aa3ff] font-medium"
                          >
                            {formatCurrency(cost)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Tooltip>
            </h2>

            <div className="flex items-end gap-4 mb-4">
              <div className="flex-2">
                <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">
                  Tamanho
                </label>
                <select
                  value={upgradeSize}
                  onChange={(e) => setUpgradeSize(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 outline-none bg-white dark:bg-slate-800 dark:text-white focus:border-[#4254a6] dark:focus:border-[#8aa3ff]"
                >
                  {UPGRADE_SIZES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-2">
                <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">
                  Arquivamento
                </label>
                <select
                  value={selectedEmailPlan.archiveTime}
                  disabled
                  className="w-full border border-gray-200 dark:border-slate-700 rounded-md p-2 outline-none bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                >
                  {UPGRADE_TIMES.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">
                  Qtd
                </label>
                <input
                  type="number"
                  min="1"
                  value={upgradeQty}
                  onChange={(e) =>
                    setUpgradeQty(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 outline-none bg-white dark:bg-slate-800 dark:text-white focus:border-[#4254a6] dark:focus:border-[#8aa3ff]"
                />
              </div>
              <button
                onClick={handleAddUpgrade}
                className="bg-[#4254a6] hover:bg-[#4254a6]/90 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-md transition-colors h-10.5"
              >
                ADD
              </button>
            </div>

            {/* LISTA ACUMULATIVA DE UPGRADES */}
            <div className="space-y-2 mt-4">
              {upgradeList.map((upg) => (
                <div
                  key={upg.id}
                  className="flex justify-between items-center bg-[#4254a6]/5 dark:bg-slate-700/50 p-2 border-2 border-indigo-600 dark:border-indigo-600 rounded-md text-sm"
                >
                  <span className="font-medium text-gray-700 dark:text-slate-200">
                    <strong>{upg.qty}x</strong> Upgrade {upg.sizeName}{" "}
                    <span className="text-gray-500 dark:text-slate-400 font-normal">
                      ({upg.timeName})
                    </span>
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-[#4254a6] dark:text-[#8aa3ff]">
                      {formatCurrency(upg.cost * upg.qty)}
                    </span>
                    <button
                      onClick={() => handleRemoveUpgrade(upg.id)}
                      className="text-red-400 hover:text-red-600 dark:hover:text-red-300 font-bold transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-slate-600"
                      title="Remover"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* US04 - Box */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-100 dark:border-slate-700/50 transition-colors">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center">
              Contratação do Meile Box
              <Tooltip title="Custo Linear na Revenda">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-slate-700/50">
                      <th className="p-2 border dark:border-slate-700">
                        Capacidade
                      </th>
                      <th className="p-2 border dark:border-slate-700 text-right">
                        Custo Unitário Fixo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {BOX_SIZES.filter((b) => b.id !== "none").map((box) => (
                      <tr
                        key={box.id}
                        className="hover:bg-[#4254a6]/5 dark:hover:bg-slate-700"
                      >
                        <td className="p-2 border dark:border-slate-700">
                          {box.name}
                        </td>
                        <td className="p-2 border dark:border-slate-700 text-right font-medium text-[#4254a6] dark:text-[#8aa3ff]">
                          {formatCurrency(box.unitCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Tooltip>
            </h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">
                  Tamanho
                </label>
                <select
                  value={boxSizeId}
                  onChange={(e) => setBoxSizeId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 outline-none bg-white dark:bg-slate-800 dark:text-white focus:border-[#4254a6] dark:focus:border-[#8aa3ff]"
                >
                  {BOX_SIZES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 dark:text-slate-300 mb-1">
                  Qtd Caixas (Máx. 270)
                </label>
                <input
                  type="number"
                  min="0"
                  max="270"
                  value={boxQty}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 270) setBoxQty(270);
                    else setBoxQty(Math.max(0, val));
                  }}
                  disabled={boxSizeId === "none"}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 disabled:bg-gray-100 dark:disabled:bg-slate-700 outline-none bg-white dark:bg-slate-800 dark:text-white focus:border-[#4254a6] dark:focus:border-[#8aa3ff]"
                />
              </div>
            </div>
          </div>

          {/* US05/06 - SMTP & MKT */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-100 dark:border-slate-700/50 transition-colors">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              SMTP & E-MAIL MARKETING
            </h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600 dark:text-slate-300 mb-1 flex items-center">
                  SMTP
                  <Tooltip title="Tabela de Custos - SMTP">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-slate-700/50">
                          <th className="p-2 border dark:border-slate-700">
                            Plano
                          </th>
                          <th className="p-2 border dark:border-slate-700">
                            Revenda
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {SMTP_PLANS.filter((s) => s.id !== "none").map((s) => (
                          <tr
                            key={s.id}
                            className="hover:bg-[#4254a6]/5 dark:hover:bg-slate-700"
                          >
                            <td className="p-2 border dark:border-slate-700">
                              {s.name}
                            </td>
                            <td className="p-2 border dark:border-slate-700 font-medium text-[#4254a6] dark:text-[#8aa3ff]">
                              {formatCurrency(s.cost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Tooltip>
                </label>
                <select
                  value={smtpId}
                  onChange={(e) => setSmtpId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 outline-none bg-white dark:bg-slate-800 dark:text-white focus:border-[#4254a6] dark:focus:border-[#8aa3ff]"
                >
                  {SMTP_PLANS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id === "none"
                        ? s.name
                        : `${s.name} - ${formatCurrency(s.cost)}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 dark:text-slate-300 mb-1 flex items-center">
                  MKT
                  <Tooltip title="Tabela de Custos - Marketing">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-slate-700/50">
                          <th className="p-2 border dark:border-slate-700">
                            Volume
                          </th>
                          <th className="p-2 border dark:border-slate-700">
                            Revenda
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {MKT_PLANS.filter((m) => m.id !== "none").map((m) => (
                          <tr
                            key={m.id}
                            className="hover:bg-[#4254a6]/5 dark:hover:bg-slate-700"
                          >
                            <td className="p-2 border dark:border-slate-700">
                              {m.name}
                            </td>
                            <td className="p-2 border dark:border-slate-700 font-medium text-[#4254a6] dark:text-[#8aa3ff]">
                              {formatCurrency(m.cost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Tooltip>
                </label>
                <select
                  value={mktId}
                  onChange={(e) => setMktId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 outline-none bg-white dark:bg-slate-800 dark:text-white focus:border-[#4254a6] dark:focus:border-[#8aa3ff]"
                >
                  {MKT_PLANS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id === "none"
                        ? m.name
                        : `${m.name} - ${formatCurrency(m.cost)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA - PAINEL DE CONSOLIDAÇÃO */}
        <div className="w-full lg:w-87.5">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700/50 flex flex-col sticky top-6 overflow-hidden transition-colors">
            <div className="p-6 flex-1">
              <h3 className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                Custo de Revenda
              </h3>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">
                {formatCurrency(calculations.consumido)}
              </p>

              <div className="space-y-1 mb-6">
                {calculations.itemsResumo.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-slate-700/50 pb-2"
                  >
                    <span className="text-[#000000] dark:text-slate-200">
                      {item.name}
                    </span>
                    <span className="text-[#007a4e] dark:text-emerald-400 font-medium">
                      {formatCurrency(item.cost)}
                    </span>
                  </div>
                ))}
              </div>

              {/* US07 - INDICADORES */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="bg-gray-50 dark:bg-slate-700/30 p-3 rounded-lg border border-gray-200 dark:border-slate-600 text-center">
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 mb-1 bg-gray-200 dark:bg-slate-600 rounded-full px-2 py-0.5 inline-block">
                    Franquia
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">
                    {formatCurrency(franquia)}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 text-center">
                  <p className="text-[10px] text-red-600 dark:text-red-400 mb-1 bg-red-100 dark:bg-red-900/50 rounded-full px-2 py-0.5 inline-block">
                    Consumido
                  </p>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(calculations.consumido)}
                  </p>
                </div>
                <div className="bg-[#4254a6]/5 dark:bg-[#4254a6]/10 p-3 rounded-lg border border-[#4254a6]/10 text-center">
                  <p className="text-[10px] text-[#4254a6] dark:text-[#8ba3ff] mb-1 bg-[#4254a6]/10 dark:bg-[#4254a6]/20 rounded-full px-2 py-0.5 inline-block">
                    Saldo
                  </p>
                  <p
                    className={`text-sm font-bold ${calculations.disponivel < 0 ? "text-red-600 dark:text-red-400" : "text-[#4254a6] dark:text-[#8aa3ff]"}`}
                  >
                    {formatCurrency(calculations.disponivel)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border-2 border-[#4254a6] dark:border-indigo-500 text-center">
                  <p className="text-[10px] text-[#4254a6] dark:text-indigo-400 mb-1 bg-[#4254a6]/5 dark:bg-indigo-500/10 rounded-full px-2 py-0.5 inline-block font-medium">
                    A Pagar
                  </p>
                  <p className="text-sm font-bold text-[#030f26] dark:text-white">
                    {formatCurrency(calculations.mensalAPagar)}
                  </p>
                </div>
              </div>
            </div>

            {/* RODAPÉ AZUL - VALORES SUGERIDOS */}
            <div className="bg-[#4254a6] dark:bg-indigo-900 text-white p-6 space-y-2 mt-4 transition-colors">
              {calculations.sugeridoEmailExtras > 0 && (
                <div className="flex justify-between items-center text-xs opacity-80 border-b border-white/10 pb-1">
                  <span>Sugerido Meile Mail</span>
                  <span>
                    {formatCurrency(calculations.sugeridoEmailExtras)}
                  </span>
                </div>
              )}
              {calculations.sugeridoBase > 0 && (
                <div className="flex justify-between items-center text-xs opacity-80 border-b border-white/10 pb-1">
                  <span>Sugerido Meile Box</span>
                  <span>{formatCurrency(calculations.sugeridoBase)}</span>
                </div>
              )}
              {calculations.sugeridoSmtp > 0 && (
                <div className="flex justify-between items-center text-xs opacity-80 border-b border-white/10 pb-1">
                  <span>Sugerido SMTP</span>
                  <span>{formatCurrency(calculations.sugeridoSmtp)}</span>
                </div>
              )}
              {calculations.sugeridoMkt > 0 && (
                <div className="flex justify-between items-center text-xs opacity-80 border-b border-white/10 pb-1">
                  <span>Sugerido Marketing</span>
                  <span>{formatCurrency(calculations.sugeridoMkt)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  Total Sugerido
                </span>
                <span className="text-2xl font-bold">
                  {formatCurrency(calculations.sugeridoTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* RODAPÉ FINAL */}
      <div className="w-full bg-white dark:bg-[#030f26] text-gray-900 dark:text-white py-4 px-8 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-md transition-colors duration-300">
        <p className="text-[10px] dark:text-amber-50">
          © Meile 2026 – Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
